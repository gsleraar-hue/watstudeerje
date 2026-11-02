"""Directe links naar opleidingspagina's (mbo, hbo, wo).

1. DUO RIO: het veld WEBSITE van aangeboden ho-opleidingen (open data, CC BY), via de opleidingseenheidcode
   gekoppeld aan naam en instelling uit het Overzicht Erkenningen ho.
2. Sitemaps van de scholen zelf: per instelling de sitemap.xml (via robots.txt), en daarin de pagina waarvan
   de slug duidelijk de opleidingsnaam is. Streng: liever geen link dan een verkeerde.

Schrijft links.js met HO_URL = {"naam|instelling": url}; mbo-links gaan in MBO_URL_EXTRA en vullen MBO_URL aan.
Alleen gebruiken: python tools/build_links.py   (sitemaps worden een week bewaard in de tempmap)
"""
import collections, concurrent.futures, csv, gzip, io, json, os, re, tempfile, time, unicodedata, urllib.request
from urllib.parse import urlparse, unquote

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIO = "https://onderwijsdata.duo.nl/dataset/c416acd1-e083-4ec6-9203-3b20f98fe143/resource/"
AANGEBODEN = RIO + "c0e73372-076d-46ac-b5fd-9d27e9f154f6/download/aangeboden_ho_opleidingen.csv"
ERKENNINGEN = "https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/28a4d89b-c223-4dbc-8deb-9d02a533f215/download/ho_erkenningen_rio.csv"
CACHE = os.path.join(tempfile.gettempdir(), "watstudeerje_sitemaps")
UA = "Mozilla/5.0 (compatible; watstudeerje.nl-linkbouwer; +https://watstudeerje.nl)"

# Domeinen die niet uit de open dagen of bestaande links volgen
DOMEIN = {
    "Tilburg University": ["www.tilburguniversity.edu"],
    "Saxion Next": ["www.saxion.nl"],
    "Hogeschool NCOI": ["www.ncoi.nl"],
    "NTI": ["www.nti.nl"],
    "Notenboom": ["www.notenboom.nl"],
    "Business School Notenboom": ["www.notenboom.nl"],
    "Wittenborg University of Applied Sciences B.V.": ["www.wittenborg.eu"],
    "Grafisch Lyceum Rotterdam": ["www.glr.nl"],
    "Grafisch Lyceum Utrecht": ["www.glu.nl"],
    "Cibap vakschool voor vormgeving": ["www.cibap.nl"],
    "Herman Brood Academie": ["www.hermanbroodacademie.nl"],
}


# Paden die op een domein geen opleidingspagina zijn (NCOI: /opleidingen/x is een themapagina, LOI: programma's zonder graad)
HOST_FOUT = {"www.ncoi.nl": r"/opleidingen/", "www.loi.nl": r"/hbo/programma/"}


def haal(url):
    pad = os.path.join(tempfile.gettempdir(), "duo_" + url.rsplit("/", 1)[-1])
    if not os.path.exists(pad):
        urllib.request.urlretrieve(url, pad)
    return csv.DictReader(io.open(pad, encoding="utf-8-sig"))


def laad(bestand, naam):
    s = io.open(os.path.join(SITE, bestand), encoding="utf-8").read()
    return json.loads(re.search(r"const " + naam + r"\s*=\s*(\{.*?\}|\[.*?\]);\s*$", s, re.S | re.M).group(1))


# ---------- sitemaps ----------

def get(url, limiet=40_000_000):
    for poging in range(2):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"}), timeout=60)
            b = r.read(limiet)
            if b[:2] == b"\x1f\x8b":
                b = gzip.decompress(b)
            return b.decode("utf-8", "replace")
        except urllib.error.HTTPError:
            return ""
        except Exception:
            time.sleep(3)
    return ""


LOC = re.compile(r"<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)", re.I)


def sitemap(host):
    """Alle pagina-urls uit de sitemap(s) van een domein (een week bewaard)."""
    os.makedirs(CACHE, exist_ok=True)
    pad = os.path.join(CACHE, re.sub(r"[^a-z0-9.-]", "_", host) + ".json")
    if os.path.exists(pad) and time.time() - os.path.getmtime(pad) < 7 * 86400:
        return json.load(io.open(pad, encoding="utf-8"))
    basis = "https://" + host
    start = re.findall(r"(?im)^[﻿ ]*sitemap:\s*(\S+)", get(basis + "/robots.txt", 200_000))
    start += [basis + "/sitemap.xml", basis + "/sitemap_index.xml"]
    gezien, paginas, rij = set(), set(), list(dict.fromkeys(start))
    while rij and len(gezien) < 80:
        u = rij.pop(0)
        if u in gezien:
            continue
        gezien.add(u)
        x = get(u)
        if "<sitemapindex" in x.lower()[:20000]:
            sub = [l.replace("&amp;", "&") for l in LOC.findall(x)]
            # opleidingssitemaps eerst; nieuws, agenda en afbeeldingen overslaan
            sub = [s for s in sub if not re.search(r"news|nieuws|event|agenda|image|video|blog|vacature|person|medewerker|staff|people|research|onderzoek", s, re.I)]
            sub.sort(key=lambda s: 0 if re.search(r"opleid|stud|program|course|educat|bachelor|master", s, re.I) else 1)
            rij.extend(s for s in sub if s not in gezien)
        elif "<urlset" in x.lower()[:20000]:
            paginas.update(l.replace("&amp;", "&") for l in LOC.findall(x))
        if len(paginas) > 400_000:
            break
    paginas = sorted(p for p in paginas if urlparse(p).netloc.lower().removeprefix("www.") == host.removeprefix("www."))
    if paginas:  # leeg is vaak een time-out: volgende keer opnieuw proberen
        json.dump(paginas, io.open(pad, "w", encoding="utf-8"))
    return paginas


def tokens(s):
    s = unicodedata.normalize("NFKD", unquote(s)).encode("ascii", "ignore").decode().lower()
    return re.findall(r"[a-z0-9]+", s.replace("&", " en "))


STOP = {"en", "and", "van", "de", "het", "in", "of", "the", "voor", "for", "s"}
# Woorden die naast de naam in een slug mogen staan (vorm, niveau, taal)
VORM = {"voltijd": "voltijd", "voltijds": "voltijd", "fulltime": "voltijd", "deeltijd": "deeltijd", "deeltijds": "deeltijd",
        "parttime": "deeltijd", "duaal": "duaal", "dual": "duaal", "werkenenleren": "duaal", "bol": "voltijd", "bbl": "duaal"}
NIVEAU = {"bachelor", "bachelors", "ba", "bsc", "llb", "hbo", "wo", "ad", "associate", "degree", "master", "masters", "msc", "ma",
          "mbo", "niveau", "level", "1", "2", "3", "4", "opleiding", "tweedegraads", "eerstegraads", "programme", "program", "studie", "study", "htm", "html", "aspx", "php"}
KWAL = set(VORM) | NIVEAU
SECTIE = re.compile(r"opleid|studie|stud|bachelor|program|course|educat|mbo|hbo|deeltijd|voltijd|degree|ad$|associate|leren", re.I)
FOUT = re.compile(r"nieuws|news|agenda|event|evenement|onderzoek|research|blog|vacature|alumni|minor|cursus|cursuss|post-?hbo|post-?bachelor|"
                  r"postbachelor|pre-?classes|gastles|webklas|vakgebied|organisatie|eendag|studiegids|dossier|afdeling|facult|department|about|/over-|formulier|"
                  r"instituut|afstudeer|cijfers|vertellen|vooropleid|taster|bibliothe|library|database|voorlichting|kiezen|studiekeuze|interesse|ik-wil|master|exchange|summer|lectora|publicat|verhal|stor(y|ies)|ervaring|medewerker|profiel|project|contract|maatwerk|"
                  r"/tags?/|https?:|open-?dag|meeloop|proefstud|zij-?instroom|traject|keuzevak|vak$|module|webinar|training|pre-?master|schakel", re.I)


def kern(t):
    """Zonder vorm/niveau/taal aan de randen en zonder stopwoorden: de naam in de slug."""
    t = list(t)
    while t and t[-1] in KWAL | {"nl", "en"}: t.pop()
    while t and t[0] in KWAL: t.pop(0)
    return tuple(x for x in t if x not in STOP)


def index(paginas):
    """kern van de slug -> [(url, extra woorden)], alleen voor pagina's die op een opleidingspagina lijken."""
    ix = collections.defaultdict(list)
    for u in paginas:
        p = urlparse(u)
        if p.query or p.fragment:
            continue
        seg = [s for s in unquote(p.path).split("/") if s]
        if not seg or FOUT.search(p.path) or seg[0] == "de" or (HOST_FOUT.get(p.netloc) and re.match(HOST_FOUT[p.netloc], p.path)):
            continue
        taal = seg[0] if seg[0] in ("nl", "en") else ""
        laatste = tokens(seg[-1])
        if laatste and laatste[-1] in ("nl", "en"):  # …/psychologie-nl/
            taal = laatste[-1]
        # slug = laatste deel dat niet alleen vorm/niveau is (…/verpleegkunde/voltijd/ telt als verpleegkunde)
        i = len(seg) - 1
        while i > 0 and all(x in KWAL for x in tokens(seg[i])):
            i -= 1
        t = tokens(re.sub(r"\.(html?|aspx|php)$", "", seg[i]))
        k = kern(t)
        if not k or len(k) > 9:
            continue
        rest = [x for s in seg[i + 1:] for x in tokens(s)]
        boven = seg[:i]
        sectie = any(SECTIE.search(s) for s in boven)
        if not sectie and not (set(t) & KWAL):
            continue
        ix[k].append((u, set(t) | set(rest) | {x for s in boven for x in tokens(s)}, len(seg), taal, sectie))
    return ix


def varianten(namen):
    uit = set()
    for n in namen:
        if not n:
            continue
        n = re.sub(r"\(.*?\)", " ", n)
        for d in {n, n.split(" - ")[0], re.sub(r"^(hbo|wo|b|m|ad|associate degree|bachelor|master|ba|bsc)\b\.?\s+(of\s+)?", "", n.split(" - ")[0], flags=re.I)}:
            k = kern(tokens(d))
            if k:
                uit.add(k)
        m = re.search(r"leraar .*? in (?:de |het )?(.+)$", n, re.I)
        if m:  # "Opleiding tot leraar vo van de tweede graad in Geschiedenis"
            vak = [x for x in tokens(m.group(1)) if x not in STOP]
            for pre in ("leraar", "docent", "lerarenopleiding"):
                uit.add(tuple([pre] + vak))
    return uit


def kies(kand, niv, vormen, plaatsen):
    """Beste pagina voor een opleiding; None als het niet eenduidig of niet passend is."""
    voorkeur = "voltijd" if "voltijd" in vormen or not vormen else ("deeltijd" if "deeltijd" in vormen else "duaal")
    best = []
    lv = {"hbo": {"hbo", "bachelor", "bachelors"}, "wo": {"wo", "bachelor", "bachelors", "bsc", "ba"}, "ad": {"ad", "associate"}, "mbo": {"mbo"}}
    for u, w, diepte, taal, sectie in kand:
        vw = {VORM[x] for x in w if x in VORM}
        if vw and not (vw & (set(vormen) or {"voltijd"})):
            continue
        if w & {"master", "masters", "msc", "ma"} and "master" not in niv:
            continue
        if w & {"ad", "associate"} and "ad" not in niv and "mbo" not in niv:
            continue
        if "mbo" not in niv and "mbo" in w:
            continue
        if "mbo" in niv:
            n = {int(x) for x in w if x in {"1", "2", "3", "4"}} if "niveau" in w or "level" in w else set()
            if n and not n & set(niv["mbo"]):
                continue
        r = (0 if sectie else 1,  # onder /opleidingen/ e.d. boven een losse pagina
             0 if voorkeur in vw else 1 if not vw else 2,
             1 if (w & {"ad", "associate"}) and set(niv) - {"ad"} else 0,  # bij bachelor en ad: de bachelorpagina
             0 if any(w & lv.get(l, set()) for l in niv) else 1,  # pagina die het niveau noemt boven een themapagina
             1 if taal == "en" else 0,  # Nederlandse pagina boven Engelse
             diepte, len(u))
        best.append((r, u))
    if not best:
        return None
    best.sort()
    return best[0][1]


def leeft(urls):
    """Welke urls geven een pagina (status < 400); uitkomst een week bewaard."""
    pad = os.path.join(CACHE, "_status.json")
    st = json.load(io.open(pad, encoding="utf-8")) if os.path.exists(pad) and time.time() - os.path.getmtime(pad) < 7 * 86400 else {}

    def check(u):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=25)
            return u, r.status, r.geturl()
        except urllib.error.HTTPError as e:
            return u, e.code, u
        except Exception:
            return u, 0, u

    nieuw = [u for u in set(urls) if u not in st]
    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        for u, code, eind in ex.map(check, nieuw):
            st[u] = [code, eind]
    json.dump(st, io.open(pad, "w", encoding="utf-8"))
    # doorgestuurd naar de homepage telt niet
    return {u for u in urls if 200 <= st[u][0] < 400 and len([x for x in urlparse(st[u][1]).path.split("/") if x])}


def algemeen(u):
    """DUO-links die niet naar een opleiding wijzen (alleen de homepage of een zoekpagina)."""
    p = urlparse(u)
    return len([s for s in p.path.split("/") if s]) == 0 or "coursefinder" in u or p.fragment


def main():
    erk, graad = {}, {}
    for x in haal(ERKENNINGEN):
        erk.setdefault(x["OPLEIDINGSEENHEIDCODE"], (x["OPLEIDINGSEENHEID_NAAM"], x["INSTELLINGSNAAM"]))
        n = x["NIVEAU"]
        graad.setdefault(x["OPLEIDINGSEENHEIDCODE"], "ad" if "AD" in n else "wo" if n.startswith("WO") else "hbo")
    opl = laad("opleidingen.js", "OPLEIDINGEN")
    mbo = laad("mbo.js", "OPLEIDINGEN_MBO")
    od, merk = laad("opendagen.js", "OPEN_DAGEN"), laad("opendagen.js", "OD_MERK")
    mbo_url = laad("mbo.js", "MBO_URL")
    paren = {(o["n"], i) for o in opl for i in o["i"]}

    # 1. DUO RIO: website, eigen naam en vorm per opleiding en school
    web = collections.defaultdict(collections.Counter)
    eigen = collections.defaultdict(set)
    vorm = collections.defaultdict(set)
    niveau = collections.defaultdict(set)  # ad of bachelor verschilt per school
    hosts = collections.defaultdict(collections.Counter)
    for x in haal(AANGEBODEN):
        e = erk.get(x["OPLEIDINGSEENHEIDCODE"])
        if not e:
            continue
        w = x["WEBSITE"].strip()
        if w.startswith("http"):
            hosts[e[1]][urlparse(w).netloc.lower()] += 1
        if e not in paren or (x["EINDDATUM"] and x["EINDDATUM"] < time.strftime("%Y-%m-%d")):
            continue
        if w.startswith("http"):
            web[e][w] += 1
        eigen[e].update(x[k] for k in ("EIGENNAAM", "EIGENNAAM_KORT", "EIGENNAAM_ENGELS") if x[k])
        vorm[e].add(x["VORM"].lower())
        niveau[e].add(graad[x["OPLEIDINGSEENHEIDCODE"]])
    # Meest genoemde url per opleiding en school
    duo = {f"{n}|{i}": c.most_common(1)[0][0] for (n, i), c in sorted(web.items())}

    # 2. Domeinen per instelling: open dagen, bestaande links en DUO
    for k, u in list(duo.items()) + list(mbo_url.items()):
        hosts[k.split("|", 1)[1]][urlparse(u).netloc.lower()] += 1

    def domeinen(i):
        uit = list(DOMEIN.get(i, []))
        e = od.get(i) or od.get(merk.get(i))
        if e and e.get("site"):
            uit.append(urlparse(e["site"]).netloc.lower())
        uit += [h for h, n in hosts.get(i, {}).items() if n >= 2 or not uit]
        return list(dict.fromkeys(h for h in uit if h))

    allen = [(o, i, "ho") for o in opl for i in o["i"]] + [(o, i, "mbo") for o in mbo for i in o["i"]]
    dom = {i: domeinen(i) for i in {i for _, i, _ in allen}}
    alle_hosts = sorted({h for d in dom.values() for h in d})
    print(len(alle_hosts), "domeinen ophalen")
    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        sm = dict(zip(alle_hosts, ex.map(sitemap, alle_hosts)))
    ix = {h: index(p) for h, p in sm.items()}
    print(sum(1 for p in sm.values() if p), "domeinen met sitemap")

    # 3. Koppelen. Namen van bachelors: een ad-opleiding mag daar alleen naar een pagina die 'ad' noemt
    bachelor = set()
    for (n, i), nv in niveau.items():
        if nv - {"ad"}:
            bachelor |= varianten([n] + sorted(eigen[(n, i)]))
    ho, extra, bron, nivs = {}, {}, {}, {}
    for o, i, soort in allen:
        key = f"{o['n']}|{i}"
        oud = duo.get(key) if soort == "ho" else mbo_url.get(key)
        if oud and not algemeen(oud):
            continue
        if soort == "ho":
            niv = {l: [] for l in niveau.get((o["n"], i)) or o["l"]}
            vormen = vorm.get((o["n"], i)) or set(o.get("v", []))
            namen = [o["n"], o.get("e")] + sorted(eigen.get((o["n"], i), ()))
        else:
            niv = {"mbo": o.get("mn", [])}
            vormen = {"voltijd" if v == "bol" else "duaal" for v in o.get("v", [])}
            namen = [o["n"]]
        kand = []
        for h in dom[i]:
            for k in varianten(namen):
                kand += [c for c in ix[h].get(k, []) if set(niv) != {"ad"} or k not in bachelor or c[1] & {"ad", "associate"}]
        u = kies(kand, niv, vormen, o.get("p", []))
        if u:
            (ho if soort == "ho" else extra)[key] = u
            bron[key] = u
            nivs[key] = niv
    goed = leeft(bron.values())
    print(len(set(bron.values()) - goed), "links uit sitemaps werken niet")
    bron = {k: u for k, u in bron.items() if u in goed}
    ho = {k: u for k, u in ho.items() if u in goed}
    extra = {k: u for k, u in extra.items() if u in goed}
    for k, u in duo.items():
        if k not in ho and not algemeen(u):
            ho[k] = u
    ho = dict(sorted(ho.items()))
    extra = dict(sorted(extra.items()))
    io.open(os.path.join(SITE, "links.js"), "w", encoding="utf-8", newline="\n").write(
        "// Bron: DUO, RIO (aangeboden ho-opleidingen, veld WEBSITE), open data CC BY, aangevuld met de sitemaps van de scholen.\n"
        "// Gemaakt met tools/build_links.py.\n"
        "const HO_URL = " + json.dumps(ho, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "// Mbo: vult MBO_URL (mbo.js) aan waar die geen of alleen een algemene link had\n"
        "if (typeof MBO_URL === \"object\") Object.assign(MBO_URL, " + json.dumps(extra, ensure_ascii=False, separators=(",", ":")) + ");\n")
    # Ter controle: wat uit de sitemaps kwam, met het niveau per school
    json.dump({k: [u, sorted(nivs[k])] for k, u in bron.items()}, io.open(os.path.join(CACHE, "_gekoppeld.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    nho = len(paren)
    nmbo = sum(len(o["i"]) for o in mbo)
    mbo_goed = sum(1 for k, u in mbo_url.items() if not algemeen(u))
    print(f"hbo/wo: {len(ho)} van {nho} ({len(ho) / nho:.0%}), waarvan {sum(1 for k in ho if k in bron)} uit sitemaps")
    print(f"mbo: {mbo_goed} bestaand + {len(extra)} uit sitemaps van {nmbo}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        p = sitemap(sys.argv[1])
        print(len(p)); print("\n".join(p[:: max(1, len(p) // 40)]))
    else:
        main()
