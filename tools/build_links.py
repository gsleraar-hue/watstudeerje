"""Directe links naar opleidingspagina's (hbo/wo) uit DUO RIO: het veld WEBSITE van aangeboden opleidingen.

Haalt de open data van DUO op (CC BY), koppelt via de opleidingseenheidcode aan naam en instelling
uit het Overzicht Erkenningen ho, en schrijft links.js met HO_URL = {"naam|instelling": url}.
Alleen gebruiken: python tools/build_links.py
"""
import collections, csv, io, json, os, re, tempfile, urllib.request

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIO = "https://onderwijsdata.duo.nl/dataset/c416acd1-e083-4ec6-9203-3b20f98fe143/resource/"
AANGEBODEN = RIO + "c0e73372-076d-46ac-b5fd-9d27e9f154f6/download/aangeboden_ho_opleidingen.csv"
ERKENNINGEN = "https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/28a4d89b-c223-4dbc-8deb-9d02a533f215/download/ho_erkenningen_rio.csv"


def haal(url):
    pad = os.path.join(tempfile.gettempdir(), "duo_" + url.rsplit("/", 1)[-1])
    if not os.path.exists(pad):
        urllib.request.urlretrieve(url, pad)
    return csv.DictReader(io.open(pad, encoding="utf-8-sig"))


def main():
    erk = {}
    for x in haal(ERKENNINGEN):
        erk.setdefault(x["OPLEIDINGSEENHEIDCODE"], (x["OPLEIDINGSEENHEID_NAAM"], x["INSTELLINGSNAAM"]))
    s = io.open(os.path.join(SITE, "opleidingen.js"), encoding="utf-8").read()
    opl = json.loads(re.search(r"const OPLEIDINGEN\s*=\s*(\[.*?\]);\s*$", s, re.S | re.M).group(1))
    paren = {(o["n"], i) for o in opl for i in o["i"]}
    web = collections.defaultdict(collections.Counter)
    for x in haal(AANGEBODEN):
        w = x["WEBSITE"].strip()
        e = erk.get(x["OPLEIDINGSEENHEIDCODE"])
        if w.startswith("http") and e in paren:
            web[e][w] += 1
    # Meest genoemde url per opleiding en school (voltijd en deeltijd hebben soms eigen pagina's)
    uit = {f"{n}|{i}": c.most_common(1)[0][0] for (n, i), c in sorted(web.items())}
    io.open(os.path.join(SITE, "links.js"), "w", encoding="utf-8", newline="\n").write(
        "// Bron: DUO, RIO (aangeboden ho-opleidingen, veld WEBSITE), open data CC BY. Gemaakt met tools/build_links.py.\n"
        "const HO_URL = " + json.dumps(uit, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(len(uit), "directe links van", len(paren), "combinaties")


if __name__ == "__main__":
    main()
