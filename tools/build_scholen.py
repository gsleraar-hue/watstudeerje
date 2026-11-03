"""Welke vestiging hoort bij welke school (voor de schoolpagina's en het zoeken op school).

Mbo-scholen staan in de data als vestigingen ("ROC van Twente, College voor Technologie", soms alleen
"Techniek"). Via DUO RIO koppelen we elke vestiging, op naam en adres, aan de instelling erachter.
De schoolnaam komt uit OD_MERK (opendagen.js) als die er is, zodat de site overal dezelfde naam gebruikt;
anders uit RIO. Hbo/wo staat al per instelling in de data.

Schrijft scholen.js en hoogt ?v= in index.html op als die verandert. Draai daarna build_seo.py voor de pagina's. Draai opnieuw na het bijwerken van mbo.js of opleidingen.js:
    python tools/build_scholen.py
"""
import collections, csv, io, json, os, re, sys, tempfile, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_begrippen import slug

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIO = "https://onderwijsdata.duo.nl/dataset/c416acd1-e083-4ec6-9203-3b20f98fe143/resource/"
BRON = {
    "aanbieders": RIO + "5cd58c3c-e44e-4840-a8e9-b029e7aa06e2/download/onderwijsaanbieders.csv",
    "aangeboden": RIO + "c528ffef-907c-43c4-bef2-b724fa925c3c/download/aangeboden_mbo_opleidingen.csv",
    "locaties": RIO + "a7e3f323-6e46-4dca-a834-369d9d520aa8/download/onderwijslocaties.csv",
    "relaties": RIO + "6aac8002-8458-42fd-8e4b-604387b56273/download/relaties_onderwijsaanbieders_onderwijsinstellingserkenningen.csv",
    "instellingen": RIO + "f78b0e96-0876-442b-ac14-a704616ad7fa/download/onderwijsinstellingserkenningen.csv",
}
VANDAAG = time.strftime("%Y-%m-%d")

# Vestigingen die als eigen school bekend zijn, ook al vallen ze onder een andere instelling
EIGEN = {"Herman Brood Academie"}
# Schoolnaam per instelling (RIO-code) als OD_MERK er geen heeft; de verkorte RIO-naam is vaak afgekapt
NAAM = {
    "25GV": "Aeres MBO", "02PN": "Cibap", "27RC": "Capabel Onderwijs", "32JG": "EuroCollege School of Management",
    "31JB": "G&D", "30LK": "GOmotive", "23JA": "Grafisch Lyceum Rotterdam", "02PG": "Hout- en Meubileringscollege",
    "31GJ": "IAM College", "30FJ": "Instituut voor Beveiligingsopleidingen", "32GA": "In Service voor ZorgOnderwijs",
    "26CR": "Instituut Broers", "25VM": "Kappers College Limburg", "30HM": "Kronenburgh", "31EN": "Laurentius College",
    "02OV": "Leidse Instrumentmakers School", "02PA": "Mediacollege Amsterdam", "31HP": "Medivus Opleidingen",
    "32CU": "Motivation Beveiligingsopleidingen", "29YH": "Motivation Beveiligingsopleidingen",
    "30LF": "Heads Academy", "32FW": "Heads Academy", "29ZY": "Nederlandse Academie voor Beeldcreatie",
    "25TP": "NIPA Opleidingen", "27GM": "Opleidingsinstituut voor Politie en Beveiligingspersoneel",
    "30VM": "OPPstap Zorg & Welzijn", "25VA": "Privé Coiffures Vakopleiding", "26TR": "PROFIT Opleidingen",
    "04EU": "ROC Kop van Noord-Holland", "25PN": "ROC Nijmegen", "31RF": "SF-S", "25LV": "De Rooi Pannen",
    "30BC": "SintLucas", "31FD": "SoSecure Academy", "25ZH": "Nederlandse Kappersakademie", "30PY": "Vakopleiding Techniek",
    "26DZ": "SVOZ", "27VT": "Technicom", "28CP": "Variva Edu Academy", "30WK": "Zorg & Werk Academy",
    "1000K0936": "OBM Oost", "31PY": "Amsterdam Training Point", "31RZ": "Barber School Amsterdam", "30RC": "Brave Minds",
    "30YA": "De Voshaar", "30WJ": "Essenzo", "30XG": "ORGB Opleidingen", "30AD": "MBO4 Nederland", "24CK": "Penso",
    "32BH": "Nice to see You", "31KE": "Maas College", "05EA": "STC", "17WH": "SVO", "25RA": "Regio College",
    "04CY": "ROC Rivor", "30RM": "ROC TOP", "14YD": "Lentiz", "30NZ": "Zorgcampus Rotterdam", "29RH": "Zorgcollege",
    "25LG": "Friesland College", "26DL": "Kappersacademie Roermond", "31WD": "Kappersacademie Roermond",
}
# Hbo/wo: dezelfde school onder twee namen, of een naam met "Stichting" of "B.V." erin
HO_NAAM = {"Viaa": "Hogeschool Viaa", "Stichting Hogeschool Viaa": "Hogeschool Viaa",
           "Hogeschool v Pedagogisch en Sociaal-Agogisch Onderwijs Groningen": "Hogeschool Pedagogisch en Sociaal-Agogisch Onderwijs Groningen",
           "Stichting hbo A&A Hogeschool voor de Accountancy": "A&A Hogeschool voor de Accountancy"}
# Buitenlandse partners van een gezamenlijke opleiding en lege namen: geen eigen pagina
HO_NIET = re.compile(r"^[A-Z0-9 ().,'-]+$|^Unknown |^University of Cyprus$")


def haal(naam):
    url = BRON[naam]
    pad = os.path.join(tempfile.gettempdir(), "duo_" + url.rsplit("/", 1)[-1])
    if not os.path.exists(pad) or time.time() - os.path.getmtime(pad) > 20 * 86400:
        urllib.request.urlretrieve(url, pad)
    return csv.DictReader(io.open(pad, encoding="utf-8-sig"))


def laad(bestand, naam):
    s = io.open(os.path.join(SITE, bestand), encoding="utf-8").read()
    return json.loads(re.search(r"const " + naam + r"\s*=\s*(\{.*?\}|\[.*?\]);?\s*$", s, re.S | re.M).group(1))


def ho_naam(n):
    if n in HO_NAAM:
        return HO_NAAM[n]
    return re.sub(r"\s+", " ", re.sub(r"\s+(B\.?V\.?|bv)$", "", re.sub(r"^Stichting\s+", "", n))).strip()


def main():
    insts, plek, loc_mbo = laad("mbo.js", "MBO_INSTS"), laad("mbo.js", "MBO_PLEK"), laad("mbo.js", "LOC_MBO")
    merk = laad("opendagen.js", "OD_MERK")
    ho = laad("opleidingen.js", "OPLEIDINGEN")

    # RIO: aanbieder -> huidige naam, adressen waar hij nu mbo geeft, instelling erachter
    naam = {}
    for r in haal("aanbieders"):
        if not r["EINDDATUM_PERIODE"] or r["EINDDATUM_PERIODE"] > VANDAAG or r["ONDERWIJSAANBIEDERID"] not in naam:
            naam[r["ONDERWIJSAANBIEDERID"]] = r["NAAM"].strip()
    locs = {r["ONDERWIJSLOCATIECODE"]: r for r in haal("locaties")}
    op_adres, op_naam = collections.defaultdict(set), collections.defaultdict(set)
    for r in haal("aangeboden"):
        if r["EINDDATUM"] and r["EINDDATUM"] <= VANDAAG:
            continue
        a, l = r["ONDERWIJSAANBIEDERID"], locs.get(r["ONDERWIJSLOCATIECODE"])
        if not naam.get(a) or not l:
            continue
        adres = f'{l["STRAATNAAM"]} {l["HUISNUMMER"]}{l["HUISNUMMERTOEVOEGING"]}'.strip().lower()
        op_adres[(naam[a], l["PLAATSNAAM"].strip().lower(), adres)].add(a)
        op_naam[naam[a]].add(a)
    rel = collections.defaultdict(list)
    for r in haal("relaties"):
        rel[r["ONDERWIJSAANBIEDERID"]].append((r["EINDDATUM"] or "9999", r["OIE_CODE"]))
    inst = {}
    for r in haal("instellingen"):
        if r["OIE_CODE"] not in inst or not r["EINDDATUM_PERIODE"] or r["EINDDATUM_PERIODE"] > VANDAAG:
            inst[r["OIE_CODE"]] = r
    voorkeur = {"ROC": 0, "ROCV": 0, "AOC": 0, "BER": 1, "BERV": 1}

    def instelling(a):
        rs = rel.get(a)
        if not rs:
            return None
        laatst = max(e for e, _ in rs)
        kandidaten = sorted({o for e, o in rs if e == laatst or e > VANDAAG}, key=lambda o: (voorkeur.get(inst[o]["SOORT"], 5) if o in inst else 9, not re.fullmatch(r"\d\d[A-Z]{2}", o), o))
        return kandidaten[0]

    # elke vestiging op elk adres -> instelling
    paar, mis = {}, []
    for lijst in loc_mbo.values():
        for ii, pi in lijst:
            if (ii, pi) in paar:
                continue
            n, p = insts[ii], plek[pi]
            ids = op_adres.get((n, p[0].lower(), p[3].lower())) or op_naam.get(n, set())
            oies = {instelling(a) for a in ids} - {None}
            if len(oies) > 1:  # zelfde naam bij twee instellingen: die waarvan de naam erop lijkt
                oies = {o for o in oies if n.lower().startswith(inst[o]["VOLLEDIGE_NAAM"].lower()[:8])} or oies
            paar[(ii, pi)] = min(oies) if oies else None
            if not oies:
                mis.append(n)
    # instelling -> merk dat de meeste vestigingen gebruiken
    merken = collections.defaultdict(collections.Counter)
    for (ii, pi), o in paar.items():
        if o and insts[ii] in merk:
            merken[o][merk[insts[ii]]] += 1

    scholen, idx = [], {}

    def school(n, soort):
        s = slug(n)
        if s not in idx:
            idx[s] = len(scholen)
            scholen.append({"n": n, "s": s, "t": soort})
        return idx[s]

    def mbo_school(ii, pi):
        n, o = insts[ii], paar[(ii, pi)]
        r = inst.get(o) if o else None
        if not r:
            soort = "mbo"
        elif r["SOORT"] in ("ROC", "ROCV"):
            soort = "roc"
        elif r["SOORT"] == "AOC":
            soort = "aoc"
        else:
            soort = "vakschool" if r["BEKOSTIGINGSCODE"] == "BEKOSTIGD" else "particulier"
        if n in EIGEN:
            return school(n, soort)
        if n in merk:
            return school(merk[n], soort)
        if o in merken:
            return school(merken[o].most_common(1)[0][0], soort)
        if o in NAAM:
            return school(NAAM[o], soort)
        return school(r["VERKORTE_NAAM"] or r["VOLLEDIGE_NAAM"] if r else n, soort)

    per_naam = collections.defaultdict(dict)  # vestiging -> {plaats: school}
    for (ii, pi) in sorted(paar):
        per_naam[insts[ii]].setdefault(plek[pi][0], set()).add(mbo_school(ii, pi))
    van, plek_school = {}, {}
    for n, pp in per_naam.items():
        alle = set().union(*pp.values())
        if len(alle) == 1:
            van[n] = alle.pop()
            continue
        for pl, s in pp.items():
            if len(s) > 1:
                print(f"Let op: {n} in {pl} hoort bij {[scholen[x]['n'] for x in s]}; eerste gekozen")
            plek_school[f"{n}|{pl}"] = min(s)
    ho_namen = sorted({i for o in ho for i in o["i"]})
    for n in ho_namen:
        if HO_NIET.search(n):
            continue
        nn = ho_naam(n)
        wo = re.search(r"universit(eit|y)\b", nn, re.I) and "Applied" not in nn or nn.startswith("Faculteit")
        van[n] = school(nn, "universiteit" if wo else "hogeschool")

    regel = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))
    uit = ("// Bron: DUO, RIO (onderwijsaanbieders en instellingen), open data CC BY. Gemaakt met tools/build_scholen.py.\n"
           "// SCHOLEN: naam, adres (scholen/<s>/) en soort. SCHOOL_VAN: vestiging -> school. SCHOOL_PLEK: \"vestiging|plaats\" -> school,\n"
           "// voor vestigingsnamen die bij meer scholen voorkomen (\"Techniek\").\n"
           f"const SCHOLEN = {regel(scholen)};\nconst SCHOOL_VAN = {regel(van)};\nconst SCHOOL_PLEK = {regel(plek_school)};\n")
    pad = os.path.join(SITE, "scholen.js")
    oud = io.open(pad, encoding="utf-8").read() if os.path.exists(pad) else ""
    if uit != oud:
        io.open(pad, "w", encoding="utf-8", newline="\n").write(uit)
        # Nieuwe ?v= zodat browsers de nieuwe scholen.js ophalen
        ih = os.path.join(SITE, "index.html")
        s = io.open(ih, encoding="utf-8").read()
        v = int(re.search(r'\?v=(\d+)"', s).group(1)) + 1
        io.open(ih, "w", encoding="utf-8", newline="").write(re.sub(r'\?v=\d+"', f'?v={v}"', s))
    print(f"{len(scholen)} scholen, {len(van)} vestigingsnamen, {len(plek_school)} op plaats; niet gekoppeld: {sorted(set(mis))}")


if __name__ == "__main__":
    main()
