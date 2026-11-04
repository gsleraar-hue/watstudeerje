"""Maakt voor elk begrip uit WOORDEN (uitleg.js) een vaste, vindbare pagina,
plus een overzichtspagina, sitemap.xml en robots.txt.

Wordt aangeroepen door build_seo.py; draai dat na het aanpassen van WOORDEN of als het domein verandert:
    python tools/build_seo.py
"""
import json, os, re, unicodedata, html, datetime

BASE = "https://watstudeerje.nl/"
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAAM = "Wat studeer je eigenlijk?"

THEMA = {
    "school": ("Op school nu", "Dit woord hoor je op school, in de bovenbouw van het vmbo, de havo of het vwo."),
    "kiezen": ("Kiezen en aanmelden", "Dit woord kom je tegen als je een vervolgopleiding kiest en je aanmeldt."),
    "toelating": ("Toelating", "Dit woord gaat over toelating: of je aan een opleiding mag beginnen."),
    "studie": ("Tijdens je studie", "Dit woord hoor je tijdens je opleiding op het mbo, het hbo of de universiteit."),
    "geld": ("Geld en regelen", "Dit woord gaat over geld en zaken die je rond je studie moet regelen."),
}


def slug(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").replace("&", " en ")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def kort(t, n=155):
    if len(t) <= n:
        return t
    return t[: t.rfind(" ", 0, n - 1)].rstrip(",.;:") + "…"


def lees_woorden():
    u = open(os.path.join(SITE, "uitleg.js"), encoding="utf-8").read()
    body = re.search(r"const WOORDEN = \[\n(.*?)\n\];", u, re.S).group(1)
    return [json.loads(l.strip().rstrip(",")) for l in body.split("\n") if l.strip()]


CSS = """
:root{--paper:#faf8f6;--ink:#1b1b1f;--muted:#5d5d66;--card:#fff;--line:rgba(27,27,31,.13);--accent:#d62828;--tint:#fbeceb}
@media (prefers-color-scheme:dark){:root{--paper:#16161a;--ink:#ececf1;--muted:#a3a3ad;--card:#1f1f24;--line:rgba(255,255,255,.13);--accent:#ff5a5a;--tint:#2a1a1c}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.6 "Segoe UI",system-ui,-apple-system,Roboto,sans-serif}
a{color:var(--accent)}
.top{border-bottom:1px solid var(--line);background:var(--card)}
.top .w{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.merk{font-weight:800;color:var(--ink);text-decoration:none}
.merk span{color:var(--accent)}
.top nav{display:flex;gap:16px;font-size:.92rem}
.w{max-width:820px;margin:0 auto;padding:16px}
.kruim{font-size:.85rem;color:var(--muted);margin-top:18px}
.kruim a{color:var(--muted)}
h1{font-size:clamp(1.9rem,5vw,2.7rem);line-height:1.1;margin:10px 0 14px}
h1::before{content:"";display:block;width:44px;height:4px;border-radius:4px;background:var(--accent);margin-bottom:16px}
.lead{font-size:1.2rem}
.thema{display:inline-block;font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--accent)}
h2{font-size:1.15rem;margin:30px 0 8px}
.rel{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}
.rel a{display:inline-block;padding:6px 14px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);text-decoration:none;font-size:.92rem}
.rel a:hover{border-color:var(--accent)}
.cta{margin:34px 0;padding:20px 22px;border-radius:14px;background:var(--tint);border-left:4px solid var(--accent)}
.cta p{margin:0 0 10px}
.knop{display:inline-block;padding:10px 18px;border-radius:999px;background:var(--accent);color:#fff;text-decoration:none;font-weight:700;margin:4px 8px 0 0}
.knop.licht{background:transparent;color:var(--accent);border:1px solid var(--accent)}
.lijst{display:grid;gap:10px;padding:0;list-style:none}
.lijst li{padding:12px 16px;border:1px solid var(--line);border-radius:10px;background:var(--card)}
.lijst a{font-weight:700;text-decoration:none}
.lijst p{margin:2px 0 0;color:var(--muted);font-size:.93rem}
footer{border-top:1px solid var(--line);margin-top:40px;font-size:.85rem;color:var(--muted)}
"""


# Favicon, app-iconen en kleur van de browserbalk: op elke pagina hetzelfde (tools/build_iconen.py)
ICONEN = f"""<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#d62828">"""

# Standaard deelafbeelding; opleidings- en groepspagina's geven hun eigen groepsfoto mee
OG_BEELD = (BASE + "og-image.jpg", 1200, 630, "Wat studeer je eigenlijk? Studiekeuze in gewone taal, voor leerlingen én ouders")


def pagina(titel, beschrijving, pad, inhoud, ld, terug, beeld=None, soort="article"):
    url = BASE + pad
    src, bw, bh, alt = beeld or OG_BEELD
    return f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(titel)}</title>
<meta name="description" content="{html.escape(beschrijving)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
{ICONEN}
<meta property="og:type" content="{soort}">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="{NAAM}">
<meta property="og:title" content="{html.escape(titel)}">
<meta property="og:description" content="{html.escape(beschrijving)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{src}">
<meta property="og:image:width" content="{bw}">
<meta property="og:image:height" content="{bh}">
<meta property="og:image:alt" content="{html.escape(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(titel)}">
<meta name="twitter:description" content="{html.escape(beschrijving)}">
<meta name="twitter:image" content="{src}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
<header class="top"><div class="w"><a class="merk" href="{terug}">Wat studeer je eigenlijk<span>?</span></a><nav><a href="{terug}begrippen/">Alle begrippen</a><a href="{terug}#/test">Doe de Padvinder</a></nav></div></header>
<main class="w">
{inhoud}
</main>
<footer><div class="w"><p><strong>{NAAM}</strong> legt studiekeuze uit in gewone taal, voor leerlingen en ouders. Onafhankelijk en zonder account. Check voor officiële informatie altijd de opleiding zelf.</p></div></footer>
</body>
</html>
"""


def main():
    woorden = lees_woorden()
    vandaag = datetime.date.today().isoformat()
    os.makedirs(os.path.join(SITE, "begrippen"), exist_ok=True)
    urls = [BASE, BASE + "begrippen/"]
    set_url = BASE + "begrippen/"
    for th, term, uitleg in woorden:
        s = slug(term)
        pad = f"begrippen/{s}/"
        verwant = [w for w in woorden if w[0] == th and w[1] != term][:8]
        titel = f"{term}: wat betekent het? | {NAAM}"
        inhoud = (
            f'<p class="kruim"><a href="../../">Home</a> › <a href="../">Begrippen</a> › {html.escape(term)}</p>'
            f'<span class="thema">{THEMA[th][0]}</span>'
            f"<h1>Wat betekent {html.escape(term)}?</h1>"
            f'<p class="lead">{html.escape(uitleg)}</p>'
            f"<h2>Waar kom je dit tegen?</h2><p>{THEMA[th][1]}</p>"
            + (f'<h2>Verwante begrippen</h2><ul class="rel">' + "".join(f'<li><a href="../{slug(w[1])}/">{html.escape(w[1])}</a></li>' for w in verwant) + "</ul>" if verwant else "")
            + '<div class="cta"><p><strong>Nog geen idee wat je wilt studeren?</strong> Doe de Padvinder: in 5 minuten zie je welke richtingen bij je passen, en wat al die studies in gewone taal betekenen.</p>'
            '<a class="knop" href="../../#/test">Start de Padvinder</a><a class="knop licht" href="../../#woorden">Alle moeilijke woorden</a></div>'
        )
        ld = {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "DefinedTerm", "name": term, "description": uitleg, "url": BASE + pad, "inLanguage": "nl",
                 "inDefinedTermSet": {"@type": "DefinedTermSet", "name": "Begrippen rond studiekeuze", "url": set_url}},
                {"@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
                    {"@type": "ListItem", "position": 2, "name": "Begrippen", "item": set_url},
                    {"@type": "ListItem", "position": 3, "name": term, "item": BASE + pad}]},
                {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": f"Wat betekent {term}?",
                    "acceptedAnswer": {"@type": "Answer", "text": uitleg}}]},
            ],
        }
        os.makedirs(os.path.join(SITE, pad), exist_ok=True)
        open(os.path.join(SITE, pad, "index.html"), "w", encoding="utf-8").write(pagina(titel, kort(uitleg), pad, inhoud, ld, "../../"))
        urls.append(BASE + pad)

    # overzicht
    blokken = ""
    for th, (kop, zin) in THEMA.items():
        items = sorted([w for w in woorden if w[0] == th], key=lambda w: w[1].lower())
        blokken += f"<h2>{kop}</h2><ul class=\"lijst\">" + "".join(
            f'<li><a href="{slug(w[1])}/">{html.escape(w[1])}</a><p>{html.escape(kort(w[2], 120))}</p></li>' for w in items) + "</ul>"
    inhoud = ('<p class="kruim"><a href="../">Home</a> › Begrippen</p>'
              "<h1>Begrippen rond studiekeuze, in gewone taal</h1>"
              f'<p class="lead">Van LOB tot BSA en van decaan tot numerus fixus: {len(woorden)} woorden die je tegenkomt als je een vervolgopleiding kiest, uitgelegd voor leerlingen en ouders.</p>'
              + blokken)
    ld = {"@context": "https://schema.org", "@type": "DefinedTermSet", "name": "Begrippen rond studiekeuze", "url": set_url, "inLanguage": "nl",
          "hasDefinedTerm": [{"@type": "DefinedTerm", "name": w[1], "url": BASE + f"begrippen/{slug(w[1])}/"} for w in woorden]}
    open(os.path.join(SITE, "begrippen", "index.html"), "w", encoding="utf-8").write(
        pagina(f"Begrippen rond studiekeuze uitgelegd | {NAAM}", f"LOB, decaan, BSA, propedeuse, numerus fixus en meer: {len(woorden)} studiekeuzebegrippen in gewone taal uitgelegd, voor leerlingen en ouders.", "begrippen/", inhoud, ld, "../", soort="website"))

    print(f"{len(woorden)} begrippen")
    return urls


if __name__ == "__main__":
    import build_seo
    build_seo.main()
