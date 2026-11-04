"""Maakt alle vaste, vindbare pagina's: begrippen, opleidingen en groepen,
plus sitemap.xml en robots.txt.

Draai opnieuw na het aanpassen van de data of als het domein verandert
(pas dan BASE aan in build_begrippen.py):
    python tools/build_seo.py

De data komt uit de .js-bestanden van de site. Die laten we door Chrome uitvoeren
(tools/export.html), zodat de pagina's precies hetzelfde zeggen als de app.
"""
import datetime, html, json, os, re, shutil, subprocess, sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_begrippen as bb

SITE, BASE, NAAM = bb.SITE, bb.BASE, bb.NAAM
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
NIV = {"mbo": "mbo", "hbo": "hbo", "wo": "wo (universiteit)", "ad": "associate degree"}
VORM = {"bol": "bol (vooral leren, met stages)", "bbl": "bbl (werken en één dag naar school)", "voltijd": "voltijd", "deeltijd": "deeltijd (naast je werk)", "duaal": "duaal (werk en studie afwisselen)", "inservice": "in dienst van een ziekenhuis (werken en leren, met salaris)"}
DUUR = {"mbo": "1 tot 4 jaar, afhankelijk van het niveau", "hbo": "4 jaar", "wo": "3 jaar voor de bachelor, daarna vaak nog een master", "ad": "2 jaar"}

# Eén foto per groep: laat zien hoe het vak er in het echt uitziet. Tweede waarde is het focuspunt.
# Gemaakt met Magnific (AI) en bijgewerkt met tools/kleur_fotos.py, zodat alle foto's dezelfde look hebben.
FOTO = {
    "zorg": ("Studenten verpleegkunde meten bij elkaar de bloeddruk in het praktijklokaal", "center 30%"),
    "therapie": ("Studenten fysiotherapie oefenen op elkaar op de behandelbank", "center 35%"),
    "sociaal": ("Een student sociaal werk praat met een jongen in een buurthuis", "center 45%"),
    "onderwijs": ("Een pabostudent zit bij een groepje kinderen die hun vinger opsteken", "center 35%"),
    "gedrag": ("Studenten psychologie discussiëren aan een tafel in een werkcollege", "center 45%"),
    "talen": ("Twee studenten lezen en maken aantekeningen in een oude universiteitsbibliotheek", "center 40%"),
    "recht": ("Een student rechten in toga pleit bij een oefenrechtbank", "center 25%"),
    "communicatie": ("Studenten journalistiek interviewen een voorbijganger op straat", "center 25%"),
    "economie": ("Studenten bespreken een grafiek op een laptop", "center 30%"),
    "management": ("Studenten overleggen over een project aan tafels vol laptops en plakbriefjes", "center 50%"),
    "marketing": ("Studenten bedenken een campagne bij een glazen wand vol plakbriefjes", "center 30%"),
    "horeca": ("Koksstudenten richten een bord op terwijl de docent proeft", "center 30%"),
    "veilig": ("Studenten van de politieacademie oefenen met een instructeur bij een politieauto", "center 30%"),
    "natuur": ("Studenten in labjassen doen een experiment in het lab", "center 30%"),
    "groen": ("Studenten bekijken tomatenplanten in een kas", "center 30%"),
    "ict": ("Studenten programmeren samen achter twee beeldschermen", "center 40%"),
    "techniek": ("Studenten bouwen met veiligheidsbril aan een elektrische raceauto", "center 25%"),
    "bouw": ("Studenten bouwkunde maken een maquette van karton", "center 25%"),
    "design": ("Designstudenten hangen schetsen op een moodboard in de studio", "center 25%"),
    "muziek": ("Conservatoriumstudenten repeteren met gitaar, zang en piano", "center 45%"),
    "uiterlijk": ("Kappersstudenten knippen en föhnen bij elkaar in een oefensalon terwijl de docent meekijkt", "center 35%"),
}


def als_je(l):
    """'Het helpt als je ...' loopt door als zin: a, b en c."""
    return ", ".join(l[:-1]) + " en " + l[-1] if len(l) > 1 else "".join(l)


def foto(fid, terug, klein=False):
    if fid not in FOTO:
        return ""
    alt, pos = FOTO[fid]
    return f'<img src="{terug}img/groep/{"klein/" if klein else ""}{fid}.jpg" alt="{html.escape(alt)}" style="object-position:{pos}" loading="lazy">'


def og_foto(fid):
    """Deelafbeelding: de groepsfoto (1400x788), anders de standaard van de site."""
    if fid not in FOTO:
        return None
    return (f"{BASE}img/groep/{fid}.jpg", 1400, 788, FOTO[fid][0])


CSS_EXTRA = """/* Op de achtergrond: gestippelde padvinderlijntjes */
body{background-image:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-dasharray='0 9'><g stroke-opacity='.28'><path d='M150 0C260 220 40 420 180 600S120 1000 150 1200'/><path d='M520 0C420 180 700 360 560 620S380 980 520 1200'/><path d='M880 0C1000 260 760 480 900 700S1040 1020 880 1200'/><path d='M180 600C320 560 420 680 560 620M560 620C700 640 780 760 900 700'/><path d='M0 300C300 260 700 380 1200 300'/><path d='M0 950C400 1010 800 880 1200 950'/></g><g fill='%23888' fill-opacity='.3' stroke='none'><circle cx='180' cy='600' r='3.5'/><circle cx='560' cy='620' r='3.5'/><circle cx='900' cy='700' r='3.5'/></g></svg>");background-size:1200px 1200px;background-repeat:repeat}
.foto{margin:14px 0 4px}
.foto img{display:block;width:100%;height:220px;object-fit:cover;border-radius:16px}
@media (max-width:640px){.foto img{height:150px;border-radius:12px}}
.lijst.fotos li{padding:0;overflow:hidden;display:grid;grid-template-columns:170px 1fr}
.lijst.fotos img{display:block;width:100%;height:100%;min-height:110px;object-fit:cover}
.lijst.fotos li>a{display:block}
.lijst.fotos div{padding:12px 16px}
@media (max-width:640px){.lijst.fotos li{grid-template-columns:110px 1fr}}
.badges{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}
.badge{font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:999px;border:1px solid var(--line);background:var(--card)}
.badge.niv{border-color:var(--accent);color:var(--accent)}
.eng{color:var(--muted);margin:-6px 0 14px}
.nlv{color:var(--muted)}
.scholen{columns:2;column-gap:28px;padding-left:18px}
.scholen li{break-inside:avoid}
@media (max-width:640px){.scholen{columns:1}}
"""


def exporteer():
    if not os.path.exists(CHROME):
        raise SystemExit("Chrome niet gevonden: " + CHROME)
    url = "file:///" + os.path.join(SITE, "tools", "export.html").replace("\\", "/")
    uit = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--virtual-time-budget=5000", "--dump-dom", url],
                         capture_output=True, text=True, encoding="utf-8").stdout
    m = re.search("@@BEGIN@@(.*?)@@EIND@@", uit, re.S)
    if not m:
        raise SystemExit("Export mislukt: geen data uit tools/export.html")
    return json.loads(html.unescape(m.group(1)))


def lijst(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " en " + xs[-1]


def zin_niveaus(o):
    return lijst(NIV[n] for n in o["l"])


def main():
    urls = bb.main()
    d = exporteer()
    fam = {f["id"]: f for f in d["families"]}
    geb = d["gebieden"]
    opls = d["opleidingen"]
    SCH = d["scholen"]
    css = bb.CSS + CSS_EXTRA
    pagina = lambda *a, **k: bb.pagina(*a, **k).replace(f"<style>{bb.CSS}</style>", f"<style>{css}</style>")

    # unieke adressen per opleiding
    gezien, slugs = {}, {}
    for o in opls:
        s = bb.slug(o["n"]) or "opleiding"
        if s in gezien:
            gezien[s] += 1
            s = f"{s}-{gezien[s]}"
        else:
            gezien[s] = 1
        slugs[o["n"]] = s

    if os.path.isdir(os.path.join(SITE, "opleidingen")):
        shutil.rmtree(os.path.join(SITE, "opleidingen"))
    per_fam = {}
    for o in opls:
        per_fam.setdefault(o["f"], []).append(o)

    for o in opls:
        f = fam.get(o["f"])
        if not f:
            continue
        s = slugs[o["n"]]
        pad = f"opleidingen/{s}/"
        n = html.escape(o["n"])
        verwant = sorted([x for x in per_fam[o["f"]] if x["n"] != o["n"]],
                         key=lambda x: (not set(x["l"]) & set(o["l"]), -len(x["i"])))[:10]
        scholen = sorted(set(o["i"]))
        plaatsen = sorted(set(p.title() if p.isupper() or p.startswith("'S") else p for p in o["p"]))
        # Scholen met een eigen pagina, plus ziekenhuizen en buitenlandse partners zonder pagina
        scholen = sorted([(SCH[s]["n"], f'<a href="../../scholen/{SCH[s]["s"]}/">{html.escape(SCH[s]["n"])}</a>') for s in {x[0] for x in o["sch"]}]
                         + [(x, html.escape(x)) for x in o["los"]], key=lambda x: x[0].lower())
        vormen = [v for v in o["v"] if v]
        mbo_niv = f" (niveau {lijst(str(x) for x in o['mn'])})" if o["mn"] else ""
        nl_regel = f'<p class="eng">In het Nederlands: <strong>{html.escape(o["nl"])}</strong></p>' if o["nl"] else ""
        if o["e"] and o["e"].lower().replace(" ", "") != o["n"].lower().replace(" ", ""):
            nl_regel += f'<p class="eng">Internationale naam: {html.escape(o["e"])}</p>'
        Z = o.get("is")
        alleen_mbo = o["l"] == ["mbo"]
        if Z:
            inleiding = (f"{n} is een opleiding van een ziekenhuis, op hbo-niveau. {Z['uitleg']} "
                         "Je bent in dienst van het ziekenhuis, krijgt salaris en haalt een erkend diploma (CZO), geen bachelor.")
        else:
          inleiding = (f"{n}{' (' + html.escape(o['nl']) + ')' if o['nl'] else ''} is een opleiding op {zin_niveaus(o)}{mbo_niv}. "
                       + (o["info"]["u"] if o.get("info") else f"Hij valt in de groep {html.escape(f['naam'])}. {f['uitleg']}"))
          if o.get("nw"):  # nieuwe mbo-opleiding: nog bij weinig scholen bekend
              aantal = "biedt nog maar één school" if len(o["i"]) == 1 else f"bieden nog maar {len(o['i'])} scholen"
              lijkt = lijst(f'<a href="../{slugs[x]}/">{html.escape(x)}</a>' for x in o["nw"]["lijkt"] if x in slugs)
              inleiding += f" Dit is een nieuwe opleiding vanaf schooljaar {o['nw']['jaar']}; nu {aantal} hem aan. Hij lijkt op {lijkt}."
        inhoud = (
            f'<p class="kruim"><a href="../../">Home</a> › <a href="../">Opleidingen</a> › <a href="../groep/{f["id"]}/">{html.escape(f["naam"])}</a> › {n}</p>'
            f'<figure class="foto">{foto(f["id"], "../../")}</figure>'
            f'<div class="badges">{"".join(f"<span class='badge niv'>{NIV[x]}</span>" for x in o["l"])}<span class="badge">{html.escape(f["naam"])}</span></div>'
            f"<h1>Wat is {n}?</h1>{nl_regel}"
            f'<p class="lead">{inleiding}</p>'
            + (f"<h2>Wat kun je ermee?</h2><ul>{''.join(f'<li>{k}</li>' for k in Z['kunJe'])}</ul>"
               f"<h2>Wat heb je ervoor nodig?</h2><ul><li><strong>Vooropleiding:</strong> {html.escape(Z['eisen'])}</li><li>Het helpt als je {als_je(Z['eigen'])}.</li></ul>"
               f"<h2>Selectie of toelatingsexamen?</h2><p>Je solliciteert bij een ziekenhuis op een vacature voor {n.lower()} in opleiding. Er zijn per ziekenhuis maar een paar plekken, dus vaak volgt een gesprek en soms een meeloopdag. Je meldt je niet aan via Studielink.</p>"
               f"<h2>Hoe lang duurt het?</h2><p>{html.escape(Z['duur'])}, in dienst van het ziekenhuis: je werkt en leert, met salaris.</p>"
               if Z else
            (f"<h2>Wat kun je ermee?</h2><ul>{''.join(f'<li>{k}</li>' for k in (o['info']['k'] if o.get('info') else f['kunJeMbo'] if alleen_mbo else f['kunJe']))}</ul>" if f["kunJe"] else "")
            + "<h2>Wat heb je ervoor nodig?</h2><ul>"
            + "".join(f"<li><strong>Voor {NIV[x]}:</strong> {html.escape(d['vooropleiding'].get(x, ''))}</li>" for x in o["l"] if d["vooropleiding"].get(x))
            + ((f"<li>Elk vmbo-profiel is goed. {'Het sluit mooi aan als je ' + html.escape(f['vmbo']) + ' hebt gedaan.' if f['vmbo'] else 'Wat je zelf laat zien, telt meer dan je profiel.'} Soms vraagt een opleiding een bepaald vak.</li>" if alleen_mbo else f"<li>{f['profiel']}</li>") if f["profiel"] else "")
            + (f"<li>Het helpt als je {als_je(f['eigen'])}.</li>" if f["eigen"] else "")
            + "</ul>"
            + f"<h2>Selectie of toelatingsexamen?</h2><p>{html.escape(f['selectie']) + ' Kijk bij de opleiding zelf wat er precies gevraagd wordt.' if f['selectie'] else 'Meestal niet. Heb je de juiste vooropleiding en meld je je op tijd aan, dan mag je in principe beginnen.'}</p>"
            + f"<h2>Hoe lang duurt het?</h2><p>{' · '.join(f'{NIV[x]}: {DUUR[x]}' for x in o['l'])}"
            + (f". Je kunt het volgen als {lijst(VORM.get(v, v) for v in vormen)}." if vormen else ".") + "</p>"
            )
            + ("<p>Bij bol ga je vooral naar school en loop je stage. Bij bbl werk je bij een leerbedrijf en ga je één dag per week naar school; je verdient dan al salaris. Het diploma is hetzelfde. <a href='../../begrippen/bol-en-bbl/'>Meer over bol en bbl</a></p>" if {"bol", "bbl"} & set(vormen) else "")
            + (f"<h2>Waar kun je {n} studeren?</h2><p>Bij {len(scholen)} {'ziekenhuizen' if Z else 'school' if len(scholen) == 1 else 'scholen'}"
               + (f", onder andere in {html.escape(lijst(plaatsen[:12]))}" if plaatsen else "") + ":</p>"
               f"<ul class=\"scholen\">{''.join(f'<li>{x[1]}</li>' for x in scholen[:40])}</ul>"
               + ("<p>Veel meer ziekenhuizen leiden op. Kijk ook bij het ziekenhuis bij jou in de buurt.</p>" if Z else "") if scholen else "")
            + (f'<h2>Verwante opleidingen</h2><ul class="rel">{"".join(f"<li><a href='../{slugs[x["n"]]}/'>{html.escape(x["n"])}</a></li>" for x in verwant)}</ul>' if verwant else "")
            + f'<div class="cta"><p><strong>Past {n} bij jou?</strong> In de app zie je hoe ver elke school van je huis is, wanneer de open dagen zijn en wat je Plan B is. Je kunt hem ook op je lijst zetten.</p>'
            f'<a class="knop" href="../../#/opl?n={quote(o["n"])}">Bekijk in de app</a><a class="knop licht" href="../../#/test">Doe de Padvinder</a></div>'
        )
        kale_uitleg = re.sub(r"<[^>]+>", "", o["info"]["u"]) if o.get("info") else f["uitlegKaal"]
        beschrijving = bb.kort(f"{o['n']}{' (' + o['nl'] + ')' if o['nl'] else ''} op {zin_niveaus(o)}, uitgelegd in gewone taal: {kale_uitleg} Bij {len(scholen)} {'school' if len(scholen) == 1 else 'scholen'}.")
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Course", "name": o["n"], "description": kale_uitleg, "url": BASE + pad, "inLanguage": "nl",
             "educationalLevel": zin_niveaus(o),
             "provider": [{"@type": "EducationalOrganization", "name": x[0]} for x in scholen[:20]]},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
                {"@type": "ListItem", "position": 2, "name": "Opleidingen", "item": BASE + "opleidingen/"},
                {"@type": "ListItem", "position": 3, "name": f["naam"], "item": BASE + f"opleidingen/groep/{f['id']}/"},
                {"@type": "ListItem", "position": 4, "name": o["n"], "item": BASE + pad}]},
            {"@type": "FAQPage", "mainEntity": [
                {"@type": "Question", "name": f"Wat is {o['n']}?", "acceptedAnswer": {"@type": "Answer", "text": f"{o['n']} is een opleiding op {zin_niveaus(o)} in de groep {f['naam']}. {kale_uitleg}"}},
                {"@type": "Question", "name": f"Waar kun je {o['n']} studeren?", "acceptedAnswer": {"@type": "Answer", "text": f"Bij {len(scholen)} {'school' if len(scholen) == 1 else 'scholen'}, waaronder {lijst(x[0] for x in scholen[:5])}."}}]},
        ]}
        titel = f"{o['n']}: wat is het en wat kun je ermee? | {NAAM}"
        os.makedirs(os.path.join(SITE, pad), exist_ok=True)
        open(os.path.join(SITE, pad, "index.html"), "w", encoding="utf-8").write(pagina(titel, beschrijving, pad, inhoud, ld, "../../", beeld=og_foto(f["id"])))
        urls.append(BASE + pad)

    # schoolpagina's: alle opleidingen van één school, per niveau en groep, en waar de school zit
    if os.path.isdir(os.path.join(SITE, "scholen")):
        shutil.rmtree(os.path.join(SITE, "scholen"))
    per_school = {}
    for o in opls:
        for s, pl, adres, lv in o["sch"]:
            x = per_school.setdefault(s, {"opl": {}, "plek": {}})
            x["opl"].setdefault(o["n"], [o, set()])[1].update(lv)
            if pl:
                x["plek"].setdefault((pl, adres), set()).add(o["n"])
    gemaakt = []
    for s, x in per_school.items():
        sc = SCH[s]
        n = html.escape(sc["n"])
        pad = f"scholen/{sc['s']}/"
        items = sorted(x["opl"].values(), key=lambda y: y[0]["n"].lower())
        niveaus = [nv for nv in ["mbo", "hbo", "ad", "wo"] if any(nv in lv for _, lv in items)]
        plaatsen = sorted({pl for pl, _ in x["plek"]}, key=lambda pl: (-sum(len(v) for (p, _), v in x["plek"].items() if p == pl), pl))
        soort = {
            "roc": "een roc (regionaal opleidingencentrum): een mbo-school met opleidingen in veel richtingen",
            "aoc": "een groene mbo-school (aoc)",
            "vakschool": "een vakschool: een mbo-school die zich op een paar vakken richt",
            "particulier": "een particuliere opleider. Die krijgt geen geld van de overheid en bepaalt zelf het lesgeld, dus vraag vooraf wat het kost",
            "hogeschool": "een hogeschool: hier volg je hbo-opleidingen",
            "universiteit": "een universiteit: hier volg je wo-opleidingen",
        }.get(sc["t"], "een school")
        if sc["t"] in ("hogeschool", "universiteit"):
            soort += ' (<a href="../../begrippen/hogeschool-of-universiteit/">wat is het verschil?</a>)'
        waar = (f", in {html.escape(', '.join(plaatsen[:8]))} en nog {len(plaatsen) - 8} andere plaatsen" if len(plaatsen) > 8
                else f", in {html.escape(lijst(plaatsen))}" if plaatsen else "")

        def chips(ys):
            return '<ul class="rel">' + "".join(f'<li><a href="../../opleidingen/{slugs[y["n"]]}/">{html.escape(y["n"])}</a></li>' for y in ys) + "</ul>"

        def per_groep(ys, kop):
            groepen = {}
            for y in ys:
                groepen.setdefault(y["f"], []).append(y)
            return "".join(f"<{kop}>{html.escape(fam[g]['naam'])} <span class='nlv'>({len(v)})</span></{kop}>{chips(v)}"
                           for g, v in sorted(groepen.items(), key=lambda kv: (-len(kv[1]), fam[kv[0]]["naam"])) if g in fam)

        if len(niveaus) > 1:
            kop = {"mbo": "Mbo-opleidingen", "hbo": "Hbo-bachelors", "ad": "Associate degrees", "wo": "Wo-bachelors"}
            lijsten = "".join(f"<h2>{kop[nv]} ({len(ys)})</h2>" + per_groep(ys, "h3")
                              for nv in niveaus for ys in [[y for y, lv in items if nv in lv]] if ys)
        else:
            lijsten = per_groep([y for y, _ in items], "h2")
        locaties = sorted(x["plek"].items(), key=lambda kv: (-len(kv[1]), kv[0]))
        inhoud = (
            f'<p class="kruim"><a href="../../">Home</a> › <a href="../">Scholen</a> › {n}</p>'
            f'<div class="badges">{"".join(f"<span class=\'badge niv\'>{NIV[nv]}</span>" for nv in niveaus)}</div>'
            f"<h1>Opleidingen bij {n}</h1>"
            f'<p class="lead">{n} is {soort}. Je kunt er {len(items)} {"opleiding" if len(items) == 1 else "opleidingen"} volgen{waar}. Klik op een opleiding voor wat je er doet, wat je ermee kunt en wat je ervoor nodig hebt.</p>'
            + lijsten
            + (f"<h2>Waar zit {n}?</h2><ul class=\"scholen\">" + "".join(
                f"<li>{html.escape(pl)}{', ' + html.escape(adres) if adres else ''} <span class='nlv'>({len(v)} {'opleiding' if len(v) == 1 else 'opleidingen'})</span></li>"
                for (pl, adres), v in locaties[:40]) + "</ul>" if locaties else "")
            + (f'<h2>Open dagen</h2><p>Ga kijken voordat je kiest. De data staan op <a href="{html.escape(sc["od"])}" rel="noopener">de site van {n}</a>. In de app zie je de open dagen van alle scholen op een rij.</p>' if sc["od"] else "")
            + f'<div class="cta"><p><strong>Hoe ver is {n} van je huis?</strong> In de app zie je per opleiding de afstand, de open dagen en je Plan B. Je kunt opleidingen ook op je lijst zetten.</p>'
            f'<a class="knop" href="../../#/zoek?q={quote(sc["n"])}">Bekijk in de app</a><a class="knop licht" href="../../#/test">Doe de Padvinder</a></div>'
        )
        beschrijving = bb.kort(f"Alle {len(items)} opleidingen van {sc['n']}{', in ' + lijst(plaatsen[:3]) if plaatsen else ''}, in gewone taal uitgelegd: wat je er doet, wat je ermee kunt en wat je ervoor nodig hebt.")
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "CollegeOrUniversity" if sc["t"] in ("hogeschool", "universiteit") else "EducationalOrganization", "name": sc["n"], "url": BASE + pad,
             **({"address": [{"@type": "PostalAddress", "addressLocality": p} for p in plaatsen[:10]]} if plaatsen else {})},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
                {"@type": "ListItem", "position": 2, "name": "Scholen", "item": BASE + "scholen/"},
                {"@type": "ListItem", "position": 3, "name": sc["n"], "item": BASE + pad}]},
        ]}
        os.makedirs(os.path.join(SITE, pad), exist_ok=True)
        open(os.path.join(SITE, pad, "index.html"), "w", encoding="utf-8").write(
            pagina(f"{sc['n']}: alle opleidingen op een rij | {NAAM}", beschrijving, pad, inhoud, ld, "../../"))
        urls.append(BASE + pad)
        gemaakt.append((sc, len(items)))

    # overzicht van alle scholen
    blok = ""
    for kop, soorten in [("Mbo-scholen", ("roc", "aoc", "vakschool", "mbo")), ("Particuliere mbo-opleiders", ("particulier",)), ("Hogescholen", ("hogeschool",)), ("Universiteiten", ("universiteit",))]:
        xs = sorted([g for g in gemaakt if g[0]["t"] in soorten], key=lambda g: g[0]["n"].lower())
        if xs:
            blok += f"<h2>{kop} ({len(xs)})</h2><ul class=\"rel\">" + "".join(f'<li><a href="{g[0]["s"]}/">{html.escape(g[0]["n"])} <span class="nlv">{g[1]}</span></a></li>' for g in xs) + "</ul>"
    inhoud = ('<p class="kruim"><a href="../">Home</a> › Scholen</p>'
              f'<h1>Alle scholen en hun opleidingen</h1><p class="lead">{len(gemaakt)} mbo-scholen, hogescholen en universiteiten in Nederland. Per school zie je welke opleidingen je er kunt volgen en waar de school zit.</p>'
              + blok)
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Alle scholen en hun opleidingen", "url": BASE + "scholen/", "inLanguage": "nl"}
    open(os.path.join(SITE, "scholen", "index.html"), "w", encoding="utf-8").write(
        pagina(f"Alle mbo-scholen, hogescholen en universiteiten | {NAAM}", f"{len(gemaakt)} scholen in Nederland met al hun opleidingen, in gewone taal uitgelegd: roc's, vakscholen, hogescholen en universiteiten.", "scholen/", inhoud, ld, "../", soort="website"))
    urls.append(BASE + "scholen/")

    # groepspagina's
    for f in d["families"]:
        items = sorted(per_fam.get(f["id"], []), key=lambda x: x["n"].lower())
        pad = f"opleidingen/groep/{f['id']}/"
        perniv = {nv: [x for x in items if nv in x["l"]] for nv in ["mbo", "hbo", "wo"]}
        inhoud = (f'<p class="kruim"><a href="../../../">Home</a> › <a href="../../">Opleidingen</a> › {html.escape(f["naam"])}</p>'
                  f'<figure class="foto">{foto(f["id"], "../../../")}</figure>'
                  f'<span class="thema">{geb[f["gebied"]]["naam"]}</span><h1>Opleidingen in {html.escape(f["naam"])}</h1>'
                  f'<p class="lead">{f["uitleg"]} Hier staan alle {len(items)} opleidingen in deze groep, op mbo, hbo en universiteit.</p>'
                  + (f"<h2>Wat kun je ermee?</h2><ul>{''.join(f'<li>{k}</li>' for k in f['kunJe'])}</ul>" if f["kunJe"] else "")
                  + "".join(f'<h2>Op {NIV[nv]} ({len(xs)})</h2><ul class="rel">' + "".join(f'<li><a href="../../{slugs[x["n"]]}/">{html.escape(x["n"])}</a></li>' for x in xs) + "</ul>" for nv, xs in perniv.items() if xs)
                  + '<div class="cta"><p><strong>Weet je nog niet welke kant je op wilt?</strong> De Padvinder laat in 5 minuten zien welke richtingen bij je passen.</p><a class="knop" href="../../../#/test">Start de Padvinder</a></div>')
        ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": f"Opleidingen in {f['naam']}", "url": BASE + pad, "inLanguage": "nl",
              "hasPart": [{"@type": "Course", "name": x["n"], "url": BASE + f"opleidingen/{slugs[x['n']]}/"} for x in items]}
        os.makedirs(os.path.join(SITE, pad), exist_ok=True)
        open(os.path.join(SITE, pad, "index.html"), "w", encoding="utf-8").write(
            pagina(f"Opleidingen {f['naam']}: mbo, hbo en wo uitgelegd | {NAAM}", bb.kort(f"Alle {len(items)} opleidingen in {f['naam']} op mbo, hbo en universiteit, in gewone taal uitgelegd. {f['uitlegKaal']}"), pad, inhoud, ld, "../../../", beeld=og_foto(f["id"]), soort="website"))
        urls.append(BASE + pad)

    # overzicht
    blok = ""
    for k, g in geb.items():
        fs = [f for f in d["families"] if f["gebied"] == k]
        blok += f"<h2>{html.escape(g['naam'])}</h2><ul class=\"lijst fotos\">" + "".join(
            f'<li><a href="groep/{f["id"]}/" tabindex="-1" aria-hidden="true">{foto(f["id"], "../", True)}</a><div><a href="groep/{f["id"]}/">{html.escape(f["naam"])}</a> <span class="nlv">({len(per_fam.get(f["id"], []))})</span><p>{f["uitleg"]}</p></div></li>' for f in fs) + "</ul>"
    inhoud = ('<p class="kruim"><a href="../">Home</a> › Opleidingen</p>'
              f"<h1>Alle opleidingen in gewone taal</h1><p class=\"lead\">{len(opls)} mbo-, hbo- en wo-opleidingen in Nederland, in {len(d['families'])} groepen. Per opleiding lees je wat je er doet, wat je ermee kunt en wat je ervoor nodig hebt. Engelse namen vertalen we.</p>"
              "<p>Weet je al welke school? <a href=\"../scholen/\">Bekijk de opleidingen per school</a>.</p>"
              + blok)
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Alle opleidingen in gewone taal", "url": BASE + "opleidingen/", "inLanguage": "nl"}
    open(os.path.join(SITE, "opleidingen", "index.html"), "w", encoding="utf-8").write(
        pagina(f"Alle mbo-, hbo- en wo-opleidingen in gewone taal | {NAAM}", f"{len(opls)} opleidingen in Nederland uitgelegd in gewone taal: wat je er doet, wat je ermee kunt en wat je nodig hebt. Engelse studienamen vertaald.", "opleidingen/", inhoud, ld, "../", soort="website"))
    urls.insert(2, BASE + "opleidingen/")

    # 404: GitHub Pages toont deze bij elk onbekend adres. Niet indexeren, links vanaf de root.
    inhoud = ('<h1>Deze pagina bestaat niet (meer)</h1>'
              '<p class="lead">Misschien is de opleiding van naam veranderd, of zit er een tikfout in het adres. Zoek hem hieronder op.</p>'
              '<ul class="rel"><li><a href="/opleidingen/">Alle opleidingen</a></li><li><a href="/scholen/">Alle scholen</a></li><li><a href="/begrippen/">Alle begrippen</a></li></ul>'
              '<div class="cta"><p><strong>Weet je nog niet wat je wilt?</strong> De Padvinder laat in 5 minuten zien welke richtingen bij je passen.</p><a class="knop" href="/#/test">Start de Padvinder</a></div>')
    p404 = pagina(f"Pagina niet gevonden | {NAAM}", "Deze pagina bestaat niet (meer).", "", inhoud, {"@context": "https://schema.org", "@type": "WebPage", "name": "Pagina niet gevonden"}, "/", soort="website")
    p404 = re.sub(r'<link rel="canonical"[^>]*>\n', "", p404).replace("index, follow, max-image-preview:large", "noindex")
    open(os.path.join(SITE, "404.html"), "w", encoding="utf-8").write(p404)

    vandaag = datetime.date.today().isoformat()
    open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{u}</loc><lastmod>{vandaag}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    open(os.path.join(SITE, "robots.txt"), "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    print(f"{len(opls)} opleidingen, {len(d['families'])} groepen, {len(urls)} url's in de sitemap")


if __name__ == "__main__":
    main()
