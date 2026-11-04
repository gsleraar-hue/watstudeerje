"""Directe links naar opleidingspagina's (mbo, hbo, wo).

1. DUO RIO: het veld WEBSITE van aangeboden ho-opleidingen (open data, CC BY), via de opleidingseenheidcode
   gekoppeld aan naam en instelling uit het Overzicht Erkenningen ho.
2. Sitemaps van de scholen zelf: per instelling de sitemap.xml (via robots.txt), en daarin de pagina waarvan
   de slug duidelijk de opleidingsnaam is. Streng: liever geen link dan een verkeerde.

3. Controle: links die eerder gevonden zijn blijven staan zolang de pagina bestaat; dode links (404/410, of
   doorgestuurd naar de homepage of naar een ander domein) gaan eruit, ook die uit DUO en mbo.js. Valt meer dan 10% weg, dan stopt het script.

Schrijft links.js met HO_URL = {"naam|instelling": url} en een aanvulling op MBO_URL (mbo.js), en hoogt ?v= in
index.html op als links.js verandert. Draait elke maand vanzelf via .github/workflows/links.yml.
Met de hand: python tools/build_links.py   (sitemaps en linkstatus worden een week bewaard in de tempmap)
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
    # Mbo-scholen zonder site in de open dagen (Regio College en Friesland College zijn opgegaan in Talland en Firda)
    "Regio College": ["www.talland.nl"], "Friesland College": ["www.firda.nl"], "ROC van Flevoland": ["www.rocvanflevoland.nl"],
    "De Rooi Pannen": ["www.derooipannen.nl"], "ORGB Opleidingen": ["www.orgb.nl"], "Ter AA": ["www.ter-aa.nl"],
    "Noorderpoort": ["noorderpoort.nl"], "Summa College": ["summa-onderwijs.nl"],
}
# Eigen domeinen van onderdelen van scholen: een doorverwijzing daarheen is geen kaping
SCHOOLDOMEIN = {"academieminerva.nl", "prinsclausconservatorium.nl", "calderacademie.nl", "jhs.nl"}


# Paden die op een domein geen opleidingspagina zijn (NCOI: /opleidingen/x is een themapagina, LOI: programma's zonder graad)
HOST_FOUT = {"www.ncoi.nl": r"/opleidingen/", "www.loi.nl": r"/hbo/programma/"}


def haal(url):
    pad = os.path.join(tempfile.gettempdir(), "duo_" + url.rsplit("/", 1)[-1])
    if not os.path.exists(pad) or time.time() - os.path.getmtime(pad) > 20 * 86400:
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


STOP = {"en", "and", "van", "de", "het", "in", "of", "the", "voor", "for", "s", "tot"}
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
        if re.search(r"leraar basisonderwijs", n, re.I):
            uit.add(("pabo",))
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


EIND = {}  # url -> waar die uiteindelijk uitkomt (na doorsturen), gevuld door dood()
NOOIT = re.compile(r"master|oude-versie|archief|omscholen|/vervallen|old-version", re.I)
# Adressen met een code in plaats van de naam, die de school zelf aan DUO opgeeft (Open Universiteit: /studieaanbod/bps)
CODE_URL = re.compile(r"^https://www\.ou\.nl/studieaanbod/[a-z]+$")


def lijkt(w, x):
    """Zelfde woord of zelfde stam: oefentherapeut ~ oefentherapie, verpleegkundige ~ verpleegkunde."""
    if w == x:
        return True
    n = len(os.path.commonprefix([w, x]))
    return min(len(w), len(x)) >= 6 and n >= max(len(w), len(x)) - 4


def past(u, namen):
    """Wijst een link (van DUO of een eerdere run) echt naar deze opleiding? De slug is de naam, of alle woorden
    van de naam (of hun stam) staan in het adres, ook na doorsturen (uva.nl/ba-arabisch). Master-, archief- en kapotte links nooit."""
    if not re.match(r"https?://[^/]", u) or NOOIT.search(u) or NOOIT.search(EIND.get(u, "")):
        return False
    if CODE_URL.match(u):
        return True
    var = varianten(namen)
    for x in {u, EIND.get(u, u)}:
        seg = [s for s in unquote(urlparse(x).path).split("/") if s]
        if any(kern(tokens(re.sub(r"\.(html?|aspx|php)$", "", s))) in var for s in seg):
            return True
        woorden = {w for s in seg for w in tokens(s)}
        if any(all(any(lijkt(w, x) for x in woorden) for w in v) for v in var):
            return True
    return False


def domein(u):
    return ".".join(urlparse(u if "//" in u else "//" + u).netloc.lower().split(":")[0].split(".")[-2:])


def dood(urls, bekend=frozenset()):
    """Urls die echt weg zijn: 404/410 of doorgestuurd naar de homepage. Geblokkeerd (403) of een time-out telt
    niet als dood, anders verdwijnen goede links als een school bots weert. Uitkomst een week bewaard."""
    os.makedirs(CACHE, exist_ok=True)
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
    EIND.update({u: v[1] for u, v in st.items()})
    # ook dood: doorgestuurd naar een onbekend domein (een verlopen schooldomein kan zo bij een gokwebsite
    # uitkomen); naar een ander domein van een school (Hanze -> Minerva) mag wel
    return {u for u in urls if st[u][0] in (404, 410) or (200 <= st[u][0] < 400 and (
        not [x for x in urlparse(st[u][1]).path.split("/") if x] or domein(st[u][1]) not in bekend | {domein(u)}))}


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
    # Vorige uitkomst: wat toen gevonden is blijft staan zolang de pagina bestaat (een sitemap die
    # tijdelijk niet laadt kost dan geen links)
    pad = os.path.join(SITE, "links.js")
    vorig = io.open(pad, encoding="utf-8").read() if os.path.exists(pad) else ""
    m = re.search(r"const HO_URL = (\{.*?\});$", vorig, re.M)
    oud_ho = json.loads(m.group(1)) if m else {}
    m = re.search(r"Object\.assign\(MBO_URL, (\{.*?\})\);$", vorig, re.M)
    oud_mbo = json.loads(m.group(1)) if m else {}

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
    # Bestaande links (DUO en mbo.js) die niet meer werken tellen als ontbrekend
    bekend = {domein(h) for c in hosts.values() for h in c} | {domein(u) for u in list(mbo_url.values()) + list(oud_ho.values()) + list(oud_mbo.values())}
    bekend |= {domein(e["site"]) for e in od.values() if e.get("site")} | {domein(h) for d in DOMEIN.values() for h in d} | SCHOOLDOMEIN
    weg = dood([u for u in list(duo.values()) + list(mbo_url.values()) if not algemeen(u)], bekend)
    print(len(weg), "bestaande links van DUO en mbo.js werken niet meer")
    per_naam = {o["n"]: o for o in opl}

    def namen_ho(k):
        n, i = k.split("|", 1)
        return [n, per_naam[n].get("e")] + sorted(eigen.get((n, i), ()))

    # DUO-links die niet bij de opleiding passen (masterpagina, oude versie, andere opleiding) tellen als ontbrekend
    afgekeurd = {u for k, u in duo.items() if not algemeen(u) and u not in weg and not past(u, namen_ho(k))}
    print(len(afgekeurd), "DUO-links passen niet bij de opleiding")
    mis_mbo = [(k, u) for k, u in mbo_url.items() if not algemeen(u) and u not in weg and not past(u, [k.split("|")[0]])]
    print(len(mis_mbo), "links in mbo.js waarvan de naam niet in het adres staat (alleen gemeld)")

    # 2. Domeinen per instelling: open dagen, bestaande links en DUO
    for k, u in list(duo.items()) + list(mbo_url.items()):
        hosts[k.split("|", 1)[1]][urlparse(u).netloc.lower()] += 1

    # Mbo-vestigingen ("Creatieve Industrie") horen bij een school (Rijn IJssel): gebruik ook het domein van die school
    scholen, school_van = laad("scholen.js", "SCHOLEN"), laad("scholen.js", "SCHOOL_VAN")

    def domeinen(i):
        school = scholen[school_van[i]]["n"] if i in school_van else None
        uit = list(DOMEIN.get(i, [])) + list(DOMEIN.get(school, []))
        for e in (od.get(i), od.get(merk.get(i)), od.get(school)):
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
        if oud and not algemeen(oud) and oud not in weg and oud not in afgekeurd:
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
        # Mbo-scholen zetten de plaats soms achter de naam: allround-kapper-groningen
        pl = [tuple(x for x in tokens(p) if x not in STOP) for p in o.get("p", [])] if soort == "mbo" else []
        for h in dom[i]:
            for k in varianten(namen):
                for kk in [k] + [k + p for p in pl if p]:
                    kand += [c for c in ix[h].get(kk, []) if set(niv) != {"ad"} or k not in bachelor or c[1] & {"ad", "associate"}]
        u = kies(kand, niv, vormen, o.get("p", []))
        if u:
            (ho if soort == "ho" else extra)[key] = u
            bron[key] = u
            nivs[key] = niv
    # Samenvoegen: vorige keer < sitemaps nu < DUO; daarna alles wat dood is eruit
    sleutels_ho = {f"{n}|{i}" for n, i in paren}
    sleutels_mbo = {f"{o['n']}|{i}" for o in mbo for i in o["i"]}
    ho = {k: u for k, u in oud_ho.items() if k in sleutels_ho and past(u, namen_ho(k))} | ho
    ho |= {k: u for k, u in duo.items() if not algemeen(u) and u not in weg and u not in afgekeurd}
    goed_mbo = {k for k, u in mbo_url.items() if not algemeen(u) and u not in weg}
    extra = {k: u for k, u in oud_mbo.items() if k in sleutels_mbo and k not in goed_mbo} | extra
    weg |= dood(list(ho.values()) + list(extra.values()), bekend)
    bron = {k: u for k, u in bron.items() if u not in weg}
    ho = dict(sorted((k, u) for k, u in ho.items() if u not in weg))
    extra = dict(sorted((k, u) for k, u in extra.items() if u not in weg))
    wis = sorted(k for k, u in mbo_url.items() if u in weg and k not in extra)

    # Rapport (in GitHub Actions als samenvatting van de run)
    verdwenen = sorted(set(oud_ho) - set(ho)) + sorted(set(oud_mbo) - set(extra))
    nieuw = sorted(set(ho) - set(oud_ho)) + sorted(set(extra) - set(oud_mbo))
    anders = sorted(k for k in set(ho) & set(oud_ho) if ho[k] != oud_ho[k]) + sorted(k for k in set(extra) & set(oud_mbo) if extra[k] != oud_mbo[k])
    rapport = [f"## Opleidingslinks {time.strftime('%d-%m-%Y')}", "",
               f"- hbo/wo: {len(ho)} links (was {len(oud_ho)}); mbo aanvulling: {len(extra)} (was {len(oud_mbo)})",
               f"- nieuw: {len(nieuw)}, andere pagina: {len(anders)}, verdwenen: {len(verdwenen)}, dode links uit mbo.js: {len(wis)}", ""]
    for kop, lijst in (("Verdwenen", verdwenen), ("Nieuw", nieuw), ("Andere pagina", anders), ("Dood in mbo.js", wis)):
        if lijst:
            rapport += [f"### {kop}", ""] + [f"- {k}" for k in lijst[:100]] + ([f"- … en nog {len(lijst) - 100}"] if len(lijst) > 100 else []) + [""]
    rapport = "\n".join(rapport)
    print(rapport)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        io.open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write(rapport + "\n")
    # Valt in één keer meer dan 10% weg, dan eerst zelf kijken (site van een school vernieuwd, of geblokkeerd)
    if len(ho) < 0.9 * len(oud_ho) or len(extra) < 0.9 * len(oud_mbo):
        raise SystemExit("Meer dan 10% van de links valt weg; links.js is niet aangepast. Kijk eerst wat er aan de hand is.")

    nieuw_js = (
        "// Bron: DUO, RIO (aangeboden ho-opleidingen, veld WEBSITE), open data CC BY, aangevuld met de sitemaps van de scholen.\n"
        "// Gemaakt met tools/build_links.py; elke maand gecontroleerd door .github/workflows/links.yml.\n"
        "const HO_URL = " + json.dumps(ho, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "// Mbo: vult MBO_URL (mbo.js) aan waar die geen of alleen een algemene link had, en haalt dode links weg\n"
        "if (typeof MBO_URL === \"object\") {\n"
        "  " + json.dumps(wis, ensure_ascii=False) + ".forEach((k) => delete MBO_URL[k]);\n"
        "  Object.assign(MBO_URL, " + json.dumps(extra, ensure_ascii=False, separators=(",", ":")) + ");\n"
        "}\n")
    if nieuw_js != vorig:
        io.open(pad, "w", encoding="utf-8", newline="\n").write(nieuw_js)
        # Nieuwe ?v= zodat browsers de nieuwe links.js ophalen
        ix_pad = os.path.join(SITE, "index.html")
        s = io.open(ix_pad, encoding="utf-8", newline="").read()
        v = int(re.search(r'\?v=(\d+)"', s).group(1)) + 1
        io.open(ix_pad, "w", encoding="utf-8", newline="").write(re.sub(r'\?v=\d+"', f'?v={v}"', s))
        print("links.js bijgewerkt, ?v=" + str(v))
    else:
        print("links.js ongewijzigd")
    # Ter controle: wat uit de sitemaps kwam, met het niveau per school
    json.dump({k: [u, sorted(nivs[k])] for k, u in bron.items()}, io.open(os.path.join(CACHE, "_gekoppeld.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    nho = len(paren)
    nmbo = sum(len(o["i"]) for o in mbo)
    mbo_goed = sum(1 for k, u in mbo_url.items() if not algemeen(u))
    print(f"hbo/wo: {len(ho)} van {nho} ({len(ho) / nho:.0%}), waarvan {sum(1 for k in ho if k in bron)} uit sitemaps")
    print(f"mbo: {mbo_goed - len(wis)} bestaand + {len(extra)} uit sitemaps van {nmbo}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        p = sitemap(sys.argv[1])
        print(len(p)); print("\n".join(p[:: max(1, len(p) // 40)]))
    else:
        main()
