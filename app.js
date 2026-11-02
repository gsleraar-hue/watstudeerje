(function () {
  // Mbo-opleidingen (DUO) toevoegen aan de lijst; zelfde naam als hbo/wo = één opleiding met meer niveaus
  if (typeof OPLEIDINGEN_MBO === "object") {
    const bestaand = new Map(OPLEIDINGEN.map((o) => [o.n.toLowerCase(), o]));
    OPLEIDINGEN_MBO.forEach((x) => {
      const b = bestaand.get(x.n.toLowerCase());
      if (b) { b.l = [...new Set(b.l.concat("mbo"))]; b.i = [...new Set(b.i.concat(x.i))]; b.mn = x.mn; b.v = [...new Set(b.v.concat(x.v))]; }
      else OPLEIDINGEN.push(x);
    });
    OPLEIDINGEN.sort((p, q) => p.n.localeCompare(q.n, "nl"));
  }
  // Ziekenhuisopleidingen (in-service): niet in DUO, wel gewoon te vinden
  if (typeof OPLEIDINGEN_INSERVICE === "object") {
    OPLEIDINGEN.push(...OPLEIDINGEN_INSERVICE);
    OPLEIDINGEN.sort((p, q) => p.n.localeCompare(q.n, "nl"));
  }
  // Vaste pagina per opleiding: zelfde adressen als tools/build_seo.py (ook bij dubbele namen)
  const maakSlug = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " en ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "opleiding";
  const oplSlug = new Map();
  (() => { const teller = {}; OPLEIDINGEN.forEach((o) => { const s = maakSlug(o.n); teller[s] = (teller[s] || 0) + 1; oplSlug.set(o.n, teller[s] > 1 ? `${s}-${teller[s]}` : s); }); })();
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Engelse termen in uitleg: vertaling tussen haakjes (eerste keer per tekst)
  const termRe = new RegExp("(?<![\\p{L}\\d'-])(" + TERMEN.map((t) => t[0]).sort((x, y) => y.length - x.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[ -]?")).join("|") + ")(?![\\p{L}\\d-])", "giu");
  const termMap = new Map(TERMEN.map((t) => [t[0].toLowerCase().replace(/[ -]/g, ""), t[1]]));
  const vt = (s) => {
    const seen = new Set();
    return esc(s).replace(termRe, (m) => {
      const key = m.toLowerCase().replace(/[ -]/g, "");
      const nl = termMap.get(key);
      if (!nl || seen.has(key)) return m;
      seen.add(key);
      return `${m} <span class="nlv">(${nl})</span>`;
    });
  };

  const termNl = (s) => termMap.get(String(s).toLowerCase().replace(/[ -]/g, "")) || null;
  // Onder een naam: Nederlandse vertaling (als de hele naam Engels is) en eventueel een echt andere naam
  function naamRegels(naam, alt, label) {
    let h = "";
    const nl = termNl(naam) || (Object.hasOwn(ENGELSE_NAAM_NL, naam) && norm(ENGELSE_NAAM_NL[naam]) !== norm(naam) ? ENGELSE_NAAM_NL[naam] : null);
    if (nl) h += `<p class="eng">In het Nederlands: <strong>${esc(nl)}</strong></p>`;
    const kaal = (x) => String(x).toLowerCase().replace(/[^a-z]/g, "");
    if (alt && kaal(alt) !== kaal(naam) && !kaal(alt).startsWith(kaal(naam))) h += `<p class="eng">${label || "Ook bekend als"}: ${esc(alt)}</p>`;
    return h;
  }

  // Persona's horen bij een brede richting, niet bij één opleiding: zeg dat er dus bij
  const personaKop = (k) => `<h3>Wie kiezen voor ${esc((GEBIEDEN[k] || {}).naam || "deze richting")}? <small>(verzonnen voorbeelden uit deze richting, niet per se van deze opleiding)</small></h3>`;
  // Studenten op hetzelfde niveau als de opleiding (een Ad telt als hbo)
  function personasVoor(k, niveaus) {
    const alle = [...(PERSONAS[k] || []), ...(PERSONAS_MBO[k] || [])];
    const niv = (niveaus || []).map((n) => (n === "ad" ? "hbo" : n));
    const passend = alle.filter((p) => niv.some((n) => p.studie.startsWith(n + " ")));
    return passend.length ? passend.slice(0, 2) : PERSONAS[k] || [];
  }
  // In de Padvinder: zit je op het vmbo, dan zie je mbo-studenten
  const personaLijst = (k) => (schoolSoort() === "vmbo" ? PERSONAS_MBO[k] : PERSONAS[k]) || [];

  function personaHtml(k, niveaus) {
    return personaKop(k) + `<div class="personas">${personasVoor(k, niveaus).map((p) => `<div class="persona"><strong>${esc(p.naam)}</strong><span>${esc(p.studie)}</span><p>${vt(p.tekst)}</p></div>`).join("")}</div>`;
  }
  // Afwijkende toelatingseisen: eerst op naam (zeker), anders op groep (misschien)
  function extraEis(o, famId) {
    const e = EXTRA_EIS.find(([re]) => re.test(o.n));
    if (e) return { zeker: true, tekst: e[1] };
    if (famId === "muziek") return { zeker: true, tekst: "Bijna altijd een auditie." };
    if (famId === "design" && !o.l.every((n) => n === "mbo")) return { zeker: true, tekst: "Vaak een portfolio of toelatingsopdracht." };
    if (SELECTIE[famId]) return { zeker: false, tekst: `In deze groep hebben sommige opleidingen extra eisen: ${SELECTIE[famId].charAt(0).toLowerCase() + SELECTIE[famId].slice(1)}` };
    return null;
  }
  // "Het helpt als je ..." loopt door als zin: a, b en c
  const alsJe = (l) => { const x = l.map(vt); return x.length > 1 ? x.slice(0, -1).join(", ") + " en " + x[x.length - 1] : x.join(""); };
  // Niet door de overheid bekostigd: hoger collegegeld
  const PARTICULIER = new Set(["LOI", "NTI", "Hogeschool NCOI", "Tio", "Wittenborg University of Applied Sciences B.V.", "Nyenrode Business Universiteit", "TMO Fashion Business School BV", "Schoevers", "EuroCollege Hogeschool", "Haarlem Institute for Higher Education B.V.", "The New School for Information Services", "Pro Education B.V.", "International University of Applied Sciences  Amsterdam"]);

  /* ---------- Waar woon je? Afstand en reistijd ---------- */
  const WP = WOONPLAATSEN.map((w) => ({ naam: w[0], prov: w[1], lat: w[2], lon: w[3] }));
  const telNaam = {};
  WP.forEach((w) => (telNaam[w.naam] = (telNaam[w.naam] || 0) + 1));
  const wpLabel = (w) => (telNaam[w.naam] > 1 ? `${w.naam} (${w.prov})` : w.naam);
  const wpByLabel = new Map(WP.map((w) => [wpLabel(w).toLowerCase(), w]));
  let thuis = null;
  try {
    const t = localStorage.getItem("woonplaats");
    if (t) thuis = wpByLabel.get(t.toLowerCase()) || null;
  } catch (e) {}
  const km = (a, b) => {
    const r = Math.PI / 180;
    const x = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(x));
  };
  const reistijd = (d) => Math.max(10, Math.round((12 + d * 1.15) / 5) * 5);
  const afstandTekst = (d) => (d < 1 ? "in je woonplaats" : `${Math.round(d)} km, ± ${reistijd(d)} min reizen`);
  const woonInput = (id) => `<label class="woon"><span>Waar woon je?</span><input id="${id}" list="woonLijst" placeholder="Bijv. Zwolle" autocomplete="off" value="${thuis ? esc(wpLabel(thuis)) : ""}"></label>`;
  function plekkenVan(naam) {
    const k = String(naam).toLowerCase();
    const ho = (typeof LOC === "object" && LOC[k]) || [];
    const mbo = (typeof LOC_MBO === "object" && LOC_MBO[k]) || [];
    const zh = (typeof LOC_INSERVICE === "object" && LOC_INSERVICE[k]) || [];
    return ho.concat(zh, mbo.map(([ii, pi]) => [MBO_INSTS[ii], MBO_PLEK[pi][0], MBO_PLEK[pi][1], MBO_PLEK[pi][2], MBO_PLEK[pi][3]]));
  }
  function dichtsteBij(naam) {
    const per = {};
    if (!thuis) return per;
    plekkenVan(naam).forEach(([inst, pl, lat, lon, adres]) => {
      const d = km(thuis, { lat, lon });
      if (!per[inst] || d < per[inst].d) per[inst] = { d, pl, adres };
    });
    return per;
  }
  // Hoofdlocatie per school, voor de open dagen
  const instPlek = {};
  if (typeof LOC === "object") Object.values(LOC).forEach((lijst) => lijst.forEach(([inst, pl, lat, lon]) => { if (!instPlek[inst]) instPlek[inst] = { pl, lat, lon }; }));
  if (typeof LOC_MBO === "object") Object.values(LOC_MBO).forEach((lijst) => lijst.forEach(([ii, pi]) => { const inst = MBO_INSTS[ii]; if (!instPlek[inst]) instPlek[inst] = { pl: MBO_PLEK[pi][0], lat: MBO_PLEK[pi][1], lon: MBO_PLEK[pi][2] }; }));
  if (typeof OD_MERK === "object") Object.keys(OD_MERK).forEach((inst) => { const merk = OD_MERK[inst]; if (!instPlek[merk] && instPlek[inst]) instPlek[merk] = instPlek[inst]; });
  let huidigeOpl = null;
  function zetThuis(val) {
    const w = wpByLabel.get(String(val).trim().toLowerCase()) || null;
    thuis = w;
    try { w ? localStorage.setItem("woonplaats", wpLabel(w)) : localStorage.removeItem("woonplaats"); } catch (e) {}
    document.querySelectorAll(".woon input").forEach((i) => { if (w) i.value = wpLabel(w); });
    renderOpenDagen();
    if (typeof renderPlan === "function") renderPlan();
    if (huidigeOpl && $("#detail").open) openOpleiding(huidigeOpl[0], huidigeOpl[1]);
  }

  /* ---------- Gids ---------- */
  const state = { zoek: "", niveau: "", gebied: "", vorm: "", autoUit: false };
  const NIVEAUS = ["mbo", "hbo", "wo"];

  function chip(container, label, key, value) {
    const b = el("button", { type: "button", class: "chip", "aria-pressed": "false" }, esc(label));
    b.addEventListener("click", () => {
      state[key] = state[key] === value ? "" : value;
      if (key === "niveau") state.autoUit = true;
      renderChips();
      renderList();
    });
    b.dataset.key = key;
    b.dataset.value = value;
    container.appendChild(b);
  }
  function renderChips() {
    document.querySelectorAll("#gids .chip, #alle .chip[data-key]").forEach((b) => {
      b.setAttribute("aria-pressed", String(state[b.dataset.key] === b.dataset.value));
    });
  }

  /* ---------- Zoeken: beroepen, samenstellingen en relevantie ---------- */
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Beroep of spreektaal -> woorden die in de naam van de opleiding staan
  const BEROEP_ZOEK = {
    dokter: ["geneeskunde"], arts: ["geneeskunde"], huisarts: ["geneeskunde"], chirurg: ["geneeskunde"], specialist: ["geneeskunde"],
    tandarts: ["tandheelkunde"], mondhygienist: ["mondzorg"], dierenarts: ["diergeneeskunde"], apotheker: ["farmacie"],
    verpleger: ["verpleeg"], verpleegster: ["verpleeg"], zuster: ["verpleeg"], fysio: ["fysiotherapie"], psycholoog: ["psychologie"],
    advocaat: ["rechten", "fiscaal recht"], rechter: ["rechten"], jurist: ["rechten", "fiscaal recht"], notaris: ["notarieel"], officier: ["rechten"],
    piloot: ["luchtvaart", "aviation"], vlieger: ["luchtvaart"], stewardess: ["luchtvaartdienstverlener"], steward: ["luchtvaartdienstverlener"],
    politie: ["politie", "veiligheid"], agent: ["politie", "veiligheid"], rechercheur: ["politie", "criminologie"], boa: ["handhaving", "toezichthouder"],
    journalist: ["journalistiek"], verslaggever: ["journalistiek"], programmeur: ["software", "informatica"], developer: ["software"], softwareontwikkelaar: ["software"],
    architect: ["architectuur", "bouwkunde"], accountant: ["accountancy"], boer: ["landbouw", "veehouderij"], dierverzorger: ["dierverzorging"],
    juf: ["leraar basisonderwijs", "pedagogisch"], meester: ["leraar basisonderwijs", "pedagogisch"], onderwijzer: ["leraar basisonderwijs"],
    gymleraar: ["lichamelijke opvoeding", "sport"], gymdocent: ["lichamelijke opvoeding"], kinderopvang: ["pedagogisch"],
  };
  const VAK_ALIAS = { gym: "lichamelijke opvoeding", wiskunde: "wiskunde", economie: "economie", nederlands: "nederlands", engels: "engels" };
  // Eén zoekvraag wordt een paar varianten: de vraag zelf, beroepen en samenstellingen als "geschiedenisleraar"
  function zoekVarianten(q) {
    const v = norm(q).trim();
    if (!v) return [];
    const uit = [{ w: v.split(/\s+/), straf: 0 }];
    const voeg = (t, straf = 2) => uit.push({ w: norm(t).split(/\s+/), straf });
    // Object.hasOwn: anders vindt "constructor" of "tostring" een ingebouwde functie
    const beroep = (w) => (Object.hasOwn(BEROEP_ZOEK, w) ? BEROEP_ZOEK[w] : []);
    beroep(v).forEach((t) => voeg(t));
    v.split(/\s+/).forEach((w) => beroep(w).forEach((t) => voeg(v.replace(w, t))));
    const m = v.replace(/\s+/g, "").match(/^(.{3,}?)(leraar|lerares|docent|leerkracht)$/) || v.match(/^(?:leraar|lerares|docent|leerkracht) (.{3,})$/);
    if (m) { const vak = VAK_ALIAS[m[1]] || m[1]; voeg("leraar " + vak, 0); voeg("docent " + vak, 0); }
    return uit;
  }
  // 100 = naam is precies de vraag, 80/60 = alle woorden in de naam, 40 = in de Engelse naam, 5 = alleen in de groep
  function zoekScore(o, f, varianten) {
    const n = norm(o.n), ne = n + " " + norm(o.e), alles = ne + " " + norm(f.naam + " " + f.uitleg);
    let best = 0;
    varianten.forEach(({ w, straf }) => {
      let sc = 0;
      if (n === w.join(" ")) sc = 100;
      else if (w.every((x) => n.includes(x))) sc = n.startsWith(w[0]) || n.includes(" " + w[0]) ? 80 : 60;
      else if (w.every((x) => ne.includes(x))) sc = 40;
      else if (w.every((x) => alles.includes(x))) sc = 5;
      if (sc) best = Math.max(best, sc - straf);
    });
    return best;
  }

  /* ---------- Beroepen: doorklikken naar opleidingen die erbij passen ---------- */
  // Woorden die in een beroep staan maar niets zeggen over de opleiding
  const BEROEP_STOP = new Set(["medewerker", "werken", "bij", "een", "of", "in", "op", "de", "het", "van", "voor", "met", "later", "en", "eigen", "bedrijf", "via", "naar", "doorstromen", "zelfstandig", "werk", "iets", "die", "als"]);
  const BEROEP_VAAG = new Set(["overheid", "specialist", "technisch", "creatief", "hbo", "industrie", "universiteit", "art", "maker", "account", "engineer", "licht", "data", "medisch", "tweede", "intelligentie", "adviseur", "bedrijven", "bedrijf", "zorg", "talen", "sociale", "manager", "medewerker"]);
  const beroepCache = new Map();
  let famVan = null;
  // Staat de zoekterm in de naam van minstens één opleiding?
  function heeftTreffer(q) {
    const v = zoekVarianten(q);
    if (!v.length) return false;
    famVan = famVan || new Map(FAMILIES.map((f) => [f.id, f]));
    return OPLEIDINGEN.some((o) => famVan.get(o.f) && zoekScore(o, famVan.get(o.f), v) >= 60);
  }
  // Van "Grafisch ontwerper" naar een zoekterm die opleidingen vindt, of null als er niets past
  function beroepZoekterm(b) {
    if (beroepCache.has(b)) return beroepCache.get(b);
    if (Object.hasOwn(BEROEP_TERM, b)) {
      const t = BEROEP_TERM[b] && heeftTreffer(BEROEP_TERM[b]) ? BEROEP_TERM[b] : null;
      beroepCache.set(b, t);
      return t;
    }
    const stam = (w) => (/[pk]er$/.test(w) ? w.slice(0, -2) : w); // ontwerper -> ontwerp, onderzoeker -> onderzoek
    const kand = [];
    String(b).replace(/\([^)]*\)/g, " ").replace(/:.*$/, "").split(/,| of | en |\//).map((d) => d.trim()).filter(Boolean).forEach((d) => {
      const ws = norm(d).split(/\s+/).filter((w) => w.length > 2 && !BEROEP_STOP.has(w) && !w.endsWith("-"));
      kand.push(ws.join(" "), ws.map(stam).join(" "));
      // Losse woorden alleen als ze iets zeggen: "overheid" of "specialist" vindt van alles
      ws.filter((w) => !BEROEP_VAAG.has(w)).sort((x, y) => y.length - x.length).forEach((w) => kand.push(w, stam(w)));
    });
    const term = kand.find((k) => k && heeftTreffer(k)) || null;
    beroepCache.set(b, term);
    return term;
  }
  // Een beroep in een lijst: klikbaar als er opleidingen bij te vinden zijn
  const beroepLi = (b) => { const t = beroepZoekterm(b); return t ? `<li><a class="beroepknop" href="#/opleidingen" data-beroep="${esc(t)}" title="Bekijk opleidingen voor ${esc(t)}">${vt(b)}</a></li>` : `<li>${vt(b)}</li>`; };

  function haystack(s) {
    return [s.naam, s.engels, s.kort, s.doe, GEBIEDEN[s.gebied].naam, s.kanJe.join(" ")].join(" ").toLowerCase();
  }
  function renderList() {
    const q = state.zoek.trim().toLowerCase();
    const res = STUDIES.filter(
      (s) =>
        (!state.niveau || s.niveau.includes(state.niveau)) &&
        (!state.gebied || s.gebied === state.gebied) &&
        (!q || zoekVarianten(q).some(({ w }) => w.every((x) => norm(haystack(s)).includes(x))))
    );
    const list = $("#lijst");
    list.innerHTML = "";
    res.forEach((s) => list.appendChild(card(s)));
    $("#leeg").hidden = res.length > 0;
    $("#selectieAantal").textContent = STUDIES.length;
    // Teller alleen bij zoeken of filteren; anders lijkt de selectie een onvolledig zoekresultaat
    $("#aantal").textContent = q || state.niveau || state.gebied ? res.length + (res.length === 1 ? " studie" : " studies") + " uit de selectie" : "";
    renderFamilies();
  }

  /* ---------- Alle opleidingen (DUO/RIO), gegroepeerd ---------- */
  const VORM_KORT = { bol: "Vooral leren (bol)", bbl: "Werken en leren (bbl)", werk: "Naast je werk (deeltijd, duaal, in dienst)" };
  const VORM_LANG = { bol: "bol (vooral leren, met stages)", bbl: "bbl (werken en één dag naar school)", voltijd: "voltijd", deeltijd: "deeltijd (naast je werk)", duaal: "duaal (werk en studie afwisselen)", inservice: "in dienst van een ziekenhuis (je werkt en leert, met salaris)" };
  const NIV_LABEL = { mbo: "mbo", hbo: "hbo", wo: "wo", ad: "associate degree" };
  const EC_JAAR = { mbo: "1 tot 4 jaar, afhankelijk van het niveau", hbo: "4 jaar", wo: "3 jaar", ad: "2 jaar" };
  const VORM = { voltijd: "voltijd", deeltijd: "deeltijd", duaal: "duaal (leren en werken)", bol: "bol: naar school, met stages", bbl: "bbl: werken en leren, een paar dagen per week werken", inservice: "in dienst: je werkt in het ziekenhuis en krijgt les, met salaris" };

  // Heb je je klas ingevuld, dan zie je eerst de opleidingen die daarna logisch zijn
  const AUTO_NIV = { vmbo: ["mbo"], havo: ["hbo", "ad"], vwo: ["wo", "hbo"] };
  function autoNiveau() {
    if (state.autoUit || state.niveau || state.zoek || typeof schoolSoort !== "function") return [];
    return AUTO_NIV[schoolSoort()] || [];
  }
  function renderFamilies() {
    const varianten = zoekVarianten(state.zoek);
    const auto = autoNiveau();
    const words = varianten.length ? varianten[0].w : [];
    const wrap = $("#families");
    const open = new Set([...wrap.querySelectorAll("details[open]")].map((d) => d.dataset.fam));
    wrap.innerHTML = "";
    let total = 0;
    const score = new Map();
    const perFam = FAMILIES.map((f) => {
      const items = OPLEIDINGEN.filter((o) => {
        if (o.f !== f.id) return false;
        if (state.niveau && !o.l.includes(state.niveau)) return false;
        if (auto.length && !o.l.some((n) => auto.includes(n))) return false;
        if (state.gebied && f.gebied !== state.gebied) return false;
        if (state.vorm && !(state.vorm === "werk" ? (o.v || []).some((v) => v === "deeltijd" || v === "duaal" || v === "inservice") : (o.v || []).includes(state.vorm))) return false;
        if (!varianten.length) return true;
        const sc = zoekScore(o, f, varianten);
        score.set(o, sc);
        return sc > 0;
      });
      return { f, items };
    });
    // Staat de vraag in de naam van een opleiding, laat dan niet de hele groep zien
    const drempel = [...score.values()].some((x) => x >= 38) ? 38 : 1;
    const rangorde = varianten.length
      ? perFam.map(({ f, items }) => {
          const goed = items.filter((o) => score.get(o) >= drempel).sort((a, b) => score.get(b) - score.get(a) || a.n.localeCompare(b.n, "nl"));
          return { f, items: goed, top: goed.length ? score.get(goed[0]) : 0 };
        }).sort((a, b) => b.top - a.top)
      : perFam;
    const perGebied = varianten.length ? {} : null;
    rangorde.forEach(({ f, items }) => {
      if (!items.length) return;
      total += items.length;
      if (perGebied) perGebied[f.gebied] = (perGebied[f.gebied] || 0) + items.length;
      const d = el("details", { class: "fam", id: "fam-" + f.id });
      d.dataset.fam = f.id;
      if (open.has(f.id) || words.length || state.gebied) d.open = true;
      d.innerHTML =
        `<summary><span class="femoji">${FAM_EXTRA[f.id].e}</span><span class="fname">${esc(f.naam)}</span><span class="fcount">${items.length}</span><span class="fgebied">${esc(GEBIEDEN[f.gebied].naam)}</span></summary>` +
        `<p class="fuitleg">${vt(f.uitleg)}</p>`;
      const ul = el("div", { class: "opl" });
      items.forEach((o) => {
        const b = el(
          "button",
          { type: "button", class: "oplbtn" },
          `<span class="on">${esc(o.n)}</span>` +
            (o.e ? `<span class="oe">${esc(o.e)}</span>` : "") +
            `<span class="badges">${o.l.map((n) => `<span class="badge ${n}">${NIV_LABEL[n]}</span>`).join("")}${(extraEis(o, f.id) || {}).zeker ? `<span class="pf-info pf-extra" title="Extra toelatingseisen" aria-label="extra toelatingseisen">!</span>` : ""}${profielTeken(o, f.id)}</span>`
        );
        b.addEventListener("click", () => openOpleiding(o, f));
        ul.appendChild(b);
      });
      d.appendChild(ul);
      wrap.appendChild(d);
    });
    const act = $("#actief");
    act.innerHTML = "";
    const addChip = (txt, reset) => {
      const b = el("button", { type: "button", class: "chip" }, esc(txt) + " ✕");
      b.addEventListener("click", () => { reset(); renderChips(); renderList(); });
      act.appendChild(b);
    };
    if (state.gebied) addChip("Faculteit: " + GEBIEDEN[state.gebied].naam, () => (state.gebied = ""));
    if (state.niveau) addChip("Niveau: " + NIV_LABEL[state.niveau], () => (state.niveau = ""));
    const soort = typeof schoolSoort === "function" ? schoolSoort() : "";
    if (auto.length) {
      const p = el("p", { class: "niv-hint" }, `Je zit op het ${esc(soort)}, dus je ziet eerst ${auto.map((n) => NIV_LABEL[n]).join(" en ")}. Later doorstromen naar een ander niveau? <a href="#/metro">Bekijk de routes</a> of `);
      const b = el("button", { type: "button", class: "linkbtn" }, "toon alle niveaus");
      b.addEventListener("click", () => { state.autoUit = true; renderChips(); renderList(); });
      p.appendChild(b);
      act.appendChild(p);
    } else if (state.autoUit && !state.niveau && AUTO_NIV[soort]) {
      const b = el("button", { type: "button", class: "linkbtn niv-hint" }, `Alleen wat past na het ${esc(soort)}`);
      b.addEventListener("click", () => { state.autoUit = false; renderChips(); renderList(); });
      act.appendChild(b);
    }
    if (state.vorm) addChip("Leervorm: " + VORM_KORT[state.vorm], () => (state.vorm = ""));
    if (state.zoek) addChip("Zoekterm: " + state.zoek, () => { state.zoek = ""; $("#zoek").value = ""; });
    if ($("#kaartKaart").firstChild) zoekOpKaart($("#kaartKaart"), perGebied);
    $("#alleLeeg").hidden = total > 0;
    $("#alleAantal").textContent = OPLEIDINGEN.length;
  }

  // Foto's: één per groep, en een eigen foto voor uitgelichte studies die anders dezelfde groepsfoto zouden delen
  const STUDIE_FOTO = {
    verpleegkunde: "groep/zorg", fysio: "groep/therapie", sport: "studie/sport", ba: "groep/management", iba: "studie/iba", marketing: "groep/marketing", hrm: "studie/hrm",
    informatica: "groep/ict", datascience: "studie/datascience", softdev: "studie/softdev", ct: "studie/ct", ido: "studie/ido",
    cmd: "groep/design", mediamaker: "studie/mediamaker", mic: "groep/communicatie", creativebiz: "studie/creativebiz",
    psychologie: "groep/gedrag", sw: "groep/sociaal", recht: "groep/recht", pabo: "groep/onderwijs", biomed: "studie/biomed", las: "groep/talen", biologie: "groep/groen",
  };
  const fotoPad = (p, klein) => (p ? `img/${p.replace("/", klein ? "/klein/" : "/")}.jpg` : "");
  const fotoImg = (p, cls, klein) => (p ? `<img class="${cls}" src="${fotoPad(p, klein)}" alt="" loading="lazy">` : "");

  function openOpleiding(o, f) {
    huidigeOpl = [o, f];
    const X = FAM_EXTRA[f.id];
    const Z = o.is; // ziekenhuisopleiding: solliciteren in plaats van Studielink
    const M = o.l.length === 1 && o.l[0] === "mbo" ? MBO_EXTRA[f.id] : null; // alleen mbo: beroepen, aanmelden en profiel op mbo-niveau
    const bekender = o.e && OPLEIDINGEN.find((x) => x.n.toLowerCase() === o.e.toLowerCase() && x.n !== o.n);
    const particulier = o.i.filter((i) => PARTICULIER.has(i));
    const extra = extraEis(o, f.id);
    const per = dichtsteBij(o.n);
    const gesorteerd = thuis ? o.i.slice().sort((a, b) => ((per[a] || {}).d ?? 1e9) - ((per[b] || {}).d ?? 1e9)) : o.i;
    const insts = gesorteerd.slice(0, 40);
    let reis = `<div class="reis">${woonInput("woonDialog")}`;
    if (!thuis) {
      reis += `<p>Vul in waar je woont, dan zie je hoe ver elke school is en hoe lang je ongeveer reist.</p>`;
    } else {
      const afst = Object.values(per).map((x) => x.d);
      const best = afst.length ? Math.min(...afst) : null;
      if (best === null) reis += `<p>Van deze opleiding is geen locatie bekend.</p>`;
      else if (o.is && best > 40) reis += `<p><strong>Dit zijn niet alle ziekenhuizen die opleiden.</strong> Het dichtstbijzijnde hier is ${afstandTekst(best)}, maar de kans is groot dat een ziekenhuis bij jou in de buurt ook opleidt. Kijk op de werkenbij-site van dat ziekenhuis.</p>`;
      else if (best < 25) reis += `<p><strong>Thuis blijven wonen kan prima.</strong> De dichtstbijzijnde school is ${afstandTekst(best)}.</p>`;
      else if (best <= 60) reis += `<p><strong>Reizen kan.</strong> De dichtstbijzijnde school is ${afstandTekst(best)} (enkele reis, indicatie). Veel studenten reizen zo'n afstand dagelijks.</p>`;
      else reis += `<p><strong>Dat is ver weg:</strong> de dichtstbijzijnde school is ${afstandTekst(best)}. De meeste studenten gaan dan op kamers. Begin op tijd met zoeken, want in studentensteden is een kamer vinden niet altijd makkelijk.</p>`;
      if (best !== null && best > 40 && !o.is) {
        const alt = OPLEIDINGEN.filter((x) => x.f === o.f && x.n !== o.n).map((x) => {
          let m = 1e9;
          plekkenVan(x.n).forEach((p) => { const d = km(thuis, { lat: p[2], lon: p[3] }); if (d < m) m = d; });
          return { x, d: m };
        }).filter((z) => z.d <= 35).sort((p, q) => p.d - q.d).slice(0, 5);
        if (alt.length) reis += `<p><strong>Dichterbij, in dezelfde groep:</strong></p><div class="mini">${alt.map((z) => `<button type="button" data-oplnaam="${esc(z.x.n)}">${esc(z.x.n)} <small style="color:var(--muted)">${z.d < 1 ? "in je woonplaats" : Math.round(z.d) + " km"}</small></button>`).join("")}</div>`;
      }
    }
    reis += `</div>`;
    $("#detailInhoud").innerHTML =
      fotoImg("groep/" + f.id, "dfoto") +
      `<div class="badges">${o.l.map((n) => `<span class="badge ${n}">${NIV_LABEL[n]}</span>`).join("")}<span class="badge gebied">${esc(f.naam)}</span></div>` +
      `<h2 id="dTitel">${esc(o.n)}</h2>${naamRegels(o.n, o.e, "Internationale naam")}` +
      (extra ? `<div class="attentie${extra.zeker ? "" : " zacht"}"><p><strong>${extra.zeker ? "Let op: extra toelatingseisen" : "Misschien extra toelatingseisen"}</strong></p><p>${esc(extra.tekst)} ${extra.zeker ? "" : "Check of dat voor deze opleiding geldt. "}De precieze eisen en data staan op de website van de opleiding. <a href="#toelating">Hoe werkt selectie?</a></p></div>` : "") +
      (bekender ? `<p class="praat">Zoek je <button type="button" class="linkbtn" data-oplnaam="${esc(bekender.n)}">${esc(bekender.n)}</button>? Die opleiding bestaat ook los, bij ${bekender.i.length} ${bekender.i.length === 1 ? "school" : "scholen"}.</p>` : "") +
      `<p><button type="button" class="btn ${isFav(o.n) ? "" : "ghost"} favknop" data-fav="${esc(o.n)}">${isFav(o.n) ? "✓ Op mijn lijst" : "+ Zet op mijn lijst"}</button> <a class="deel-link" href="opleidingen/${oplSlug.get(o.n)}/" target="_blank" rel="noopener">Vaste pagina om te delen ↗</a></p>` +
      
      (Z
        ? `<h3>Wat doe je?</h3><p>${vt(o.uitleg)}</p><p>Dit is een opleiding van een ziekenhuis, niet van een hogeschool. Je bent er in dienst, werkt vanaf het begin mee en krijgt les op hbo-niveau. Je haalt een erkend diploma (CZO), geen bachelor.</p>` +
          `<h3>Wat kun je ermee?</h3><ul class="beroepen">${o.kunJe.map(beroepLi).join("")}</ul>` +
          `<h3>Wat heb je ervoor nodig?</h3><ul><li><strong>Vooropleiding:</strong> ${esc(o.eisen)}</li><li>Het helpt als je ${alsJe(o.eigen)}.</li></ul><p class="praat" style="margin-top:8px">Eisen en startmomenten verschillen per ziekenhuis. Kijk bij de vacature zelf.</p>`
        : `<h3>In welke groep valt dit?</h3><p>${esc(o.n)} hoort bij de groep <strong>${esc(f.naam)}</strong>. ${vt(f.uitleg)}</p><p>Wat je precies leert, verschilt per school. Lees het programma op de website van de opleiding, of <button type="button" class="linkbtn" data-famopen="${f.id}">vergelijk met de andere opleidingen in deze groep</button>.</p>`) +
      (X && !Z ? `<h3>Wat kun je ermee?</h3><ul class="beroepen">${(M ? M.kunJe : X.kunJe).map(beroepLi).join("")}</ul>` : "") +
      (X && !Z
        ? `<h3>Wat heb je ervoor nodig?</h3><ul><li><strong>Vooropleiding:</strong> ${o.l.map((n) => `voor ${NIV_LABEL[n]}: ${VOOROPLEIDING[n] || ""}`).join("; ")}.</li>` +
          (M ? `<li>Elk vmbo-profiel is goed. ${M.vmbo ? `Het sluit mooi aan als je ${esc(M.vmbo)} hebt gedaan.` : "Wat je zelf laat zien, telt meer dan je profiel."} Soms vraagt een opleiding een bepaald vak.</li>` : `<li>${vt(X.profiel)}</li>`) +
          (o.l.includes("ad") ? `<li><strong>Associate degree:</strong> ${(o.v || []).includes("voltijd") ? "op papier volstaat havo, vwo of mbo 4. Toch zijn veel Ad's bedoeld voor mensen die al werken. Kom je direct van school, vraag dan op de open dag wie er in de klas zitten en wat ze na de Ad doen." : "deze Ad volg je alleen naast je werk (deeltijd of duaal). Je hebt dan meestal een baan of werkplek in het vak nodig. Direct na de middelbare school is dat zelden een route."} Een Ad is een volwaardig hbo-diploma; wil je daarna de bachelor, dan kost dat meestal nog 2 jaar.</li>` : "") +
          `<li>Het helpt als je ${alsJe(X.eigen)}.</li></ul><p class="praat" style="margin-top:8px">Toelatingseisen verschillen per school. Lees ze altijd bij de opleiding zelf.</p>`
        : "") +
      profielCheck(o, f.id) +
      (Z ? `<h3>Toelatingsexamen, auditie of selectie?</h3><p>Ja: je solliciteert bij een ziekenhuis op een vacature voor "${esc(o.n.toLowerCase())} in opleiding". Er zijn per ziekenhuis maar een paar plekken, dus vaak volgt een gesprek en soms een meeloopdag.</p>` : "") +
      (Z ? "" : `<h3>Toelatingsexamen, auditie of selectie?</h3><p>${SELECTIE[f.id] ? esc(SELECTIE[f.id]) + " Kijk bij de opleiding zelf wat er precies gevraagd wordt." : M ? "Meestal niet. Meld je je vóór 1 april aan en heb je de juiste vooropleiding, dan moet de school je toelaten. Wel heb je eerst een intakegesprek." : "Meestal niet. Heb je de juiste vooropleiding en meld je je op tijd aan, dan mag je in principe beginnen."}</p>`) +
      `<div class="planb-box"><h3>Plan B: wat als je niet wordt aangenomen?</h3><ul>` +
      (Z
        ? `<li>Solliciteer bij meer ziekenhuizen: veel meer ziekenhuizen dan hieronder leiden op.</li><li>Begin met een bachelor als <button type="button" class="linkbtn" data-oplnaam="Medische Hulpverlening">Medische Hulpverlening</button> of Verpleegkunde. Daarmee kom je ook op de OK.</li><li>Werk eerst in de zorg (bijvoorbeeld via mbo 4) en solliciteer daarna opnieuw.</li></ul><p><a href="#planb">Lees alles over Plan B →</a></p></div>`
        : `<li>Dezelfde opleiding bij een andere school${o.i.length > 1 ? ` (${o.i.length} scholen bieden hem aan)` : ""}.</li>` +
      `<li>Een verwante opleiding in de groep ${esc(f.naam)}.</li>` +
      (o.l.includes("wo") ? "<li>Via het hbo: met je propedeuse kun je vaak alsnog naar de universiteit.</li>" : "") +
      (o.l.includes("hbo") ? "<li>Via mbo 4: daarna kun je alsnog naar het hbo.</li>" : "") +
      `<li>Volgend jaar opnieuw proberen.</li></ul><p><a href="#planb">Lees alles over Plan B →</a></p></div>`) +
      (Z ? `<h3>Hoe kom je daar?</h3><ol class="stapjes"><li>Haal je havo-, vwo- of mbo 4-diploma.</li><li>Loop een dagje mee op de OK van een ziekenhuis.</li><li>Zoek vacatures voor "${esc(o.n.toLowerCase())} in opleiding" op de werkenbij-sites van ziekenhuizen. Ze openen vaak een paar keer per jaar.</li><li>Solliciteer met een brief en je cv.</li><li>Aangenomen? Dan teken je een leerwerkovereenkomst en krijg je meteen salaris. Je meldt je niet aan via Studielink.</li></ol>` : "") +
      (M ? `<h3>Hoe kom je daar?</h3><ol class="stapjes"><li>Haal je vmbo-diploma${o.mn && o.mn.length ? `: voor niveau ${o.mn.join(" of ")} ${Math.min(...o.mn) >= 3 ? "met de kader-, gemengde of theoretische leerweg" : "kan dat in elke leerweg"}` : ""}.</li><li>Ga naar een open dag of loop een dag mee op de mbo-school.</li><li>Meld je aan via de website van de mbo-school zelf, niet via Studielink. Doe dat vóór 1 april. Bewaar de bevestiging: je mentor of decaan vraagt soms om een kopie.</li><li>Ga naar het intakegesprek: een kennismaking, geen examen.</li>${(o.v || []).includes("bbl") ? "<li>Kies je bbl? Dan zoek je zelf een leerbedrijf met een leerbaan. Dat kan op <a href=\"https://leerbanenmarkt.nl\" target=\"_blank\" rel=\"noopener\">leerbanenmarkt.nl</a>. Sommige scholen helpen, maar reken daar niet op.</li>" : ""}<li>Vraag bij DUO je studentenreisproduct aan.</li></ol><p><a href="#/plan">Maak je eigen stappenplan →</a> · Meer over het mbo: <a href="https://www.kiesmbo.nl/home" target="_blank" rel="noopener">kiesmbo.nl ↗</a></p>` : "") +
      (Z || M ? "" : `<h3>Hoe kom je daar?</h3><ol class="stapjes"><li>Zorg voor de juiste vooropleiding en het juiste profiel.</li><li>Ga naar een open dag of meeloopdag.</li><li>Meld je aan via Studielink: uiterlijk 1 mei${SELECTIE[f.id] ? ", bij selectie of loting vaak al vóór 15 januari" : ""}.</li><li>Doe de studiekeuzecheck.</li><li>Regel je geld bij DUO, en eventueel een kamer.</li></ol><p><a href="#route">Bekijk het hele stappenplan →</a></p>`) +
      personaHtml(f.gebied, o.l) +
      `<h3>Hoe lang?</h3><p>${Z ? esc(o.duur) : o.l.map((n) => `${NIV_LABEL[n]}${n === "mbo" && o.mn && o.mn.length ? " niveau " + o.mn.join(", ") : ""}: ${EC_JAAR[n]}`).join(" · ")}</p>` +
      ((o.v || []).length ? `<h3>Hoe kun je hem volgen?</h3><p>${o.v.map((v) => VORM_LANG[v] || v).join(", ")}.${o.v.some((v) => v === "bol" || v === "bbl") ? ` <a href="#leerwerk">Bol of bbl: wat past bij jou? →</a>` : o.v.some((v) => v === "deeltijd" || v === "duaal") ? ` <a href="#leerwerk">Werken en leren: hoe zit dat? →</a>` : ""}</p>` : "") +
      `<h3>Hoe studeer je?</h3><p>${o.v.map((v) => VORM[v] || v).join(", ") || "onbekend"}</p>` +
      `<h3>Waar kan het? (${o.i.length} ${Z ? "ziekenhuizen" : o.i.length === 1 ? "school" : "scholen"})</h3>${reis}<ul class="scholen">${insts.map((i) => schoolRegel(i, o.n, per[i])).join("")}</ul>` +
      (Z ? `<p>Veel meer ziekenhuizen leiden op. Kijk ook bij het ziekenhuis bij jou in de buurt.</p>` : "") +
      (particulier.length ? `<p class="praat"><strong>Let op:</strong> ${particulier.map(esc).join(", ")} ${particulier.length === 1 ? "is een particuliere school" : "zijn particuliere scholen"}: zonder geld van de overheid. Je betaalt daar een veel hoger collegegeld dan het wettelijke.</p>` : "") +
      (o.i.length > insts.length ? `<p style="color:var(--muted)">en ${o.i.length - insts.length} andere</p>` : "") +
      `<p class="praat" style="margin-top:16px">Namen kunnen misleiden. Vergelijk altijd het programma van twee scholen en lees de toelatingseisen op de website van de opleiding zelf.</p>`;
    const d = $("#detail");
    if (d.showModal) d.showModal();
    else d.setAttribute("open", "");
  }

  function openFamily(id) {
    state.zoek = "";
    $("#zoek").value = "";
    state.niveau = "";
    state.gebied = "";
    state.vorm = "";
    renderChips();
    renderList();
    const d = document.getElementById("fam-" + id);
    if (d) d.open = true;
    go("opleidingen", d ? d.id : "alle");
  }

  function badges(s) {
    return (
      '<div class="badges">' +
      s.niveau.map((n) => `<span class="badge ${n}">${n}</span>`).join("") +
      `<span class="badge gebied">${esc(GEBIEDEN[s.gebied].naam)}</span></div>`
    );
  }
  function card(s) {
    const b = el(
      "button",
      { type: "button", class: "card" },
      fotoImg(STUDIE_FOTO[s.id], "cfoto", true) + badges(s) +
        `<h3>${esc(s.naam)}</h3>${naamRegels(s.naam, s.engels)}<p class="kort">${vt(s.kort)}</p><span class="more">Lees de uitleg →</span>`
    );
    b.addEventListener("click", () => openDetail(s.id));
    return b;
  }

  function openDetail(id) {
    const s = STUDIES.find((x) => x.id === id);
    if (!s) return;
    $("#detailInhoud").innerHTML =
      fotoImg(STUDIE_FOTO[s.id], "dfoto") + badges(s) +
      `<h2 id="dTitel">${esc(s.naam)}</h2>${naamRegels(s.naam, s.engels)}` +
      `<h3>In gewone woorden</h3><p>${vt(s.kort)}</p>` +
      `<h3>Wat doe je er?</h3><p>${vt(s.doe)}</p>` +
      `<h3>Wat kun je ermee?</h3><ul class="beroepen">${s.kanJe.map(beroepLi).join("")}</ul>` +
      `<h3>Wat heb je ervoor nodig?</h3><p>${vt(STUDIE_NODIG[s.id] || "")}</p>` +
      `<h3>Goed om te weten</h3><p>${vt(s.let)}</p>` +
      `<h3>Praat erover</h3><p class="praat">${vt(s.praat)}</p>` +
      personaHtml(s.gebied, s.niveau) +
      (STUDIE_FAM[s.id] ? `<p style="margin-top:18px"><button type="button" class="btn" data-famopen="${STUDIE_FAM[s.id]}">Bekijk waar je dit kunt studeren</button></p>` : "");
    const d = $("#detail");
    if (d.showModal) d.showModal();
    else d.setAttribute("open", "");
  }
  $("#detail").addEventListener("click", (e) => {
    if (e.target === $("#detail")) $("#detail").close();
  });

  /* ---------- Test ---------- */
  let who = "leerling";
  let cur = 0;
  const ANTW = ["Totaal niet", "Een beetje", "Neutraal", "Wel", "Heel erg"];
  const form = $("#testForm");

  function buildQuiz() {
    const kept = {};
    form.querySelectorAll("input:checked").forEach((i) => (kept[i.name] = i.value));
    form.querySelectorAll("input[name=kind]:checked").forEach((i) => (kept["kind" + i.value] = "1"));
    form.innerHTML = "";
    const kf = el("fieldset", { class: "q" });
    kf.dataset.part = "Even opwarmen";
    kf.innerHTML = `<legend><span class="nr">0.</span>${
      who === "ouder" ? "Waar wordt je kind blij van? Denk aan vroeger én nu." : "Waar word jij blij van? Denk aan vroeger én nu."
    } <small>(kies er zoveel als je wilt)</small></legend>`;
    const kg = el("div", { class: "kids" });
    KIND.forEach((k, n) => {
      const l = el("label", { class: "kid" });
      const inp = el("input", { type: "checkbox", name: "kind", value: n });
      if (kept["kind" + n]) inp.checked = true;
      l.appendChild(inp);
      l.appendChild(document.createTextNode(k[1]));
      kg.appendChild(l);
    });
    kf.appendChild(kg);
    kf.appendChild(el("p", { class: "hint" }, "Wat je vroeger al leuk vond en nu nog steeds, zegt vaak veel over wat bij je past."));
    form.appendChild(kf);
    const pf = el("fieldset", { class: "q" });
    pf.dataset.part = "Herken je jezelf?";
    pf.innerHTML = `<legend>${who === "ouder" ? "Welke student lijkt het meest op je kind?" : "Welke student lijkt het meest op jou?"}</legend>`;
    const pg = el("div", { class: "pz-grid" });
    Object.keys(PERSONAS).forEach((k) => {
      const p = personaLijst(k)[0];
      const l = el("label", { class: "pz" });
      const inp = el("input", { type: "radio", name: "pz", value: k });
      if (kept.pz === k) inp.checked = true;
      l.appendChild(inp);
      l.insertAdjacentHTML("beforeend", `<strong>${esc(p.naam)}</strong><span>${esc(p.tekst)}</span>`);
      pg.appendChild(l);
    });
    const geen = el("label", { class: "pz pz-geen" });
    const gi = el("input", { type: "radio", name: "pz", value: "" });
    if (kept.pz === "") gi.checked = true;
    geen.appendChild(gi);
    geen.insertAdjacentHTML("beforeend", "<strong>Geen van allen</strong><span>Ik herken me in niemand. Ook prima!</span>");
    pg.appendChild(geen);
    pf.appendChild(pg);
    form.appendChild(pf);
    let nr = 0;
    const section = (titel, sub, prefix, items) => {
      form.appendChild(el("h3", { class: "part" }, `${esc(titel)} <small>${esc(sub)}</small>`));
      items.forEach((txt, i) => {
        nr++;
        const fs = el("fieldset", { class: "q" });
        fs.dataset.part = titel;
        fs.innerHTML = `<legend><span class="nr">${nr}.</span>${vt(txt)}</legend>`;
        const sc = el("div", { class: "scale" });
        ANTW.forEach((a, n) => {
          const l = el("label");
          const inp = el("input", { type: "radio", name: prefix + i, value: n });
          if (kept[prefix + i] === String(n)) inp.checked = true;
          l.appendChild(inp);
          l.appendChild(document.createTextNode(a));
          sc.appendChild(l);
        });
        fs.appendChild(sc);
        form.appendChild(fs);
      });
    };
    const pick = (a) => a.map((v) => (who === "ouder" ? v[2] : v[1]));
    section("Deel 1: waar word je blij van?", "je interesses", "q", pick(VRAGEN));
    section("Deel 2: waar ben je goed in?", "je kwaliteiten", "k", pick(KWAL));
    section("Deel 3: wat telt voor jou in je werk?", "je waarden", "d", pick(DRIJF));
    const tf = el("fieldset", { class: "q" });
    tf.dataset.part = "Nog één ding";
    tf.innerHTML = `<legend>${who === "ouder" ? "Hoe staat je kind tegenover een toelatingsexamen, auditie of portfolio?" : "Hoe sta jij tegenover een toelatingsexamen, auditie of portfolio?"}</legend>`;
    const ts = el("div", { class: "scale drie" });
    ["Prima, daar ga ik voor", "Liever niet, maar het mag", "Liever helemaal niet"].forEach((t, n) => {
      const l = el("label");
      const inp = el("input", { type: "radio", name: "t0", value: n });
      if (kept.t0 === String(n)) inp.checked = true;
      l.appendChild(inp);
      l.appendChild(document.createTextNode(t));
      ts.appendChild(l);
    });
    tf.appendChild(ts);
    form.appendChild(tf);
    const act = el("div", { class: "actions" });
    act.innerHTML =
      '<button class="btn" type="submit" id="klaar" disabled>Bekijk mijn uitslag</button><span class="progress" id="voortgang" aria-live="polite"></span>';
    form.appendChild(act);
    updateProgress();
    initStepper();
  }

  /* Eén vraag tegelijk */
  function initStepper() {
    form.prepend(el("div", { class: "stepper" }, '<div class="sbar"><span id="sfill"></span></div><div class="sdots" id="sdots" aria-label="Spring naar een vraag"></div><div class="smeta"><span id="spart"></span><span id="scount"></span></div>'));
    form.querySelector(".actions").before(el("div", { class: "snav" }, '<button type="button" class="btn ghost" id="vorige">Vorige</button><button type="button" class="btn" id="volgende">Volgende</button>'));
    $("#vorige").addEventListener("click", () => toStep(cur - 1));
    $("#sdots").addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (b && !b.disabled) toStep(Number(b.dataset.step)); });
    $("#volgende").addEventListener("click", () => toStep(cur + 1));
    toStep(Math.min(cur, form.querySelectorAll("fieldset.q").length - 1), true);
  }
  function toStep(i, noFocus) {
    const steps = [...form.querySelectorAll("fieldset.q")];
    if (i < 0 || i >= steps.length) return;
    cur = i;
    steps.forEach((s, j) => (s.hidden = j !== i));
    const last = i === steps.length - 1;
    const answered = !steps[i].querySelector("input[type=radio]") || steps[i].querySelector("input:checked");
    $("#sfill").style.width = Math.round((i / (steps.length - 1)) * 100) + "%";
    $("#spart").textContent = steps[i].dataset.part;
    $("#scount").textContent = `${i + 1} van ${steps.length}`;
    // Elke beantwoorde vraag is aanklikbaar, plus de eerste open vraag
    const klaar = steps.map((st) => !st.querySelector("input[type=radio]") || !!st.querySelector("input:checked"));
    const open = klaar.indexOf(false) < 0 ? steps.length - 1 : klaar.indexOf(false);
    $("#sdots").innerHTML = steps.map((st, j) => `<button type="button" data-step="${j}" class="${j === i ? "nu" : klaar[j] ? "klaar" : ""}" ${j > open && !klaar[j] ? "disabled" : ""} aria-label="Vraag ${j + 1}${klaar[j] ? ", beantwoord" : ""}"${j === i ? ' aria-current="step"' : ""}></button>`).join("");
    $("#vorige").disabled = i === 0;
    $("#volgende").hidden = last;
    $("#volgende").disabled = !answered;
    form.querySelector(".actions").hidden = !last;
    if (!noFocus) steps[i].querySelector("input")?.focus({ preventScroll: true });
  }
  form.addEventListener("change", (e) => {
    const steps = [...form.querySelectorAll("fieldset.q")];
    if (e.target.type !== "radio" || steps.indexOf(e.target.closest("fieldset.q")) !== cur) return;
    if (e.target.name === "t0") {
      voegDiepToe();
      setTimeout(() => toStep(cur + 1), 260);
      return;
    }
    if (cur < steps.length - 1) setTimeout(() => toStep(cur + 1), 260);
    else toStep(cur, true);
  });
  function updateProgress() {
    const sets = [...form.querySelectorAll("fieldset.q")].filter((f) => f.querySelector("input[type=radio]"));
    const n = sets.filter((f) => f.querySelector("input:checked")).length;
    $("#voortgang").textContent = `${n} van ${sets.length} ingevuld`;
    $("#klaar").disabled = n < sets.length || !form.querySelector("fieldset.diep");
    tekenPad();
  }
  form.addEventListener("change", updateProgress);

  // Antwoorden blijven bewaard op dit apparaat, ook als je halverwege stopt
  function bewaarAntwoorden() {
    const vals = {};
    form.querySelectorAll("input[type=radio]:checked").forEach((i) => (vals[i.name] = i.value));
    bewaar("antwoorden", { who, cur, vals, kind: [...form.querySelectorAll("input[name=kind]:checked")].map((i) => i.value) });
  }
  form.addEventListener("change", () => setTimeout(bewaarAntwoorden, 300));
  form.addEventListener("click", (e) => { if (e.target.closest("#vorige, #volgende, [data-step]")) bewaarAntwoorden(); });
  function herstelAntwoorden() {
    const ant = lees("antwoorden", null);
    if (!ant) return;
    if (ant.who && ant.who !== who) {
      who = ant.who;
      document.querySelectorAll(".who .chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.who === who)));
      buildQuiz();
    }
    const zet = (naam, v) => { const i = form.querySelector(`input[name="${naam}"][value="${v}"]`); if (i) i.checked = true; };
    const vals = ant.vals || {};
    (ant.kind || []).forEach((v) => zet("kind", v));
    Object.keys(vals).filter((k) => !k.startsWith("z_")).forEach((k) => zet(k, vals[k]));
    if (vals.t0 != null) {
      voegDiepToe();
      Object.keys(vals).filter((k) => k.startsWith("z_")).forEach((k) => zet(k, vals[k]));
    }
    updateProgress();
    toStep(Math.min(ant.cur || 0, form.querySelectorAll("fieldset.q").length - 1), true);
    // Was de Padvinder al af, dan staat je uitslag meteen weer klaar
    if (padvinder && !$("#klaar").disabled) form.requestSubmit();
  }

  document.querySelectorAll(".who .chip").forEach((b) =>
    b.addEventListener("click", () => {
      if (who === b.dataset.who) return;
      who = b.dataset.who;
      document.querySelectorAll(".who .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      cur = 0;
      form.reset();
      form.innerHTML = "";
      padX = [];
      padLengte = 0;
      bewaar("antwoorden", null);
      buildQuiz();
      $("#uitslag").hidden = true;
      $(".testgrid").hidden = false;
    })
  );

  function formWaarden() {
    const vals = {};
    form.querySelectorAll("input[type=radio]:checked").forEach((x) => (vals[x.name] = x.value));
    return { vals, kind: [...form.querySelectorAll("input[name=kind]:checked")].map((x) => x.value) };
  }
  function bereken() {
    const w = formWaarden();
    return scoreVan(w.vals, w.kind);
  }
  function scoreVan(vals, kind) {
    const score = {};
    const max = {};
    const num = (n) => (vals[n] != null && vals[n] !== "" ? Number(vals[n]) : 0);
    Object.keys(GEBIEDEN).forEach((k) => ((score[k] = 0), (max[k] = 0)));
    VRAGEN.forEach((v, i) => {
      score[v[0]] += num(`q${i}`);
      max[v[0]] += 4;
    });
    const profiel = { kwal: [], drijf: [] };
    [["k", KWAL, "kwal"], ["d", DRIJF, "drijf"]].forEach(([p, lijst, sleutel]) => {
      lijst.forEach((v, i) => {
        const val = num(`${p}${i}`);
        profiel[sleutel].push({ naam: v[0], val });
        for (const g in v[3]) {
          score[g] += val * v[3][g];
          max[g] += 4 * v[3][g];
        }
      });
    });
    const picks = {};
    kind.forEach((x) => {
      if (!KIND[Number(x)]) return;
      const g = KIND[Number(x)][0];
      picks[g] = (picks[g] || 0) + 1;
    });
    Object.keys(GEBIEDEN).forEach((k) => {
      score[k] += Math.min(3, (picks[k] || 0) * 1.5);
      max[k] += 3;
    });
    Object.keys(GEBIEDEN).forEach((k) => { max[k] += 3; if (vals.pz && vals.pz === k) score[k] += 3; });
    // Op percentage, niet op ruwe punten: niet elke richting heeft evenveel vragen
    const rank = Object.keys(score).sort((a, b) => score[b] / max[b] - score[a] / max[a]);
    return { score, max, profiel, rank };
  }

  // Doorvragen binnen de twee sterkste richtingen; verfijnt alleen, sluit niets uit
  function voegDiepToe() {
    form.querySelectorAll("fieldset.diep").forEach((f) => f.remove());
    const voor = form.querySelector(".snav");
    bereken().rank.slice(0, 2).forEach((k) => {
      DIEP[k].forEach(([fam, tekst]) => {
        const fs = el("fieldset", { class: "q diep" });
        fs.dataset.part = "Even doorvragen: " + GEBIEDEN[k].naam;
        fs.innerHTML = `<legend>${vt(who === "ouder" ? tekst.replace(/^Ik wil/, "Mijn kind wil") : tekst)}</legend>`;
        const sc = el("div", { class: "scale" });
        ANTW.forEach((t, n) => {
          const l = el("label");
          const inp = el("input", { type: "radio", name: `z_${k}_${fam}`, value: n });
          l.appendChild(inp);
          l.appendChild(document.createTextNode(t));
          sc.appendChild(l);
        });
        fs.appendChild(sc);
        fs.hidden = true;
        form.insertBefore(fs, voor);
      });
    });
    updateProgress();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const r = bereken();
    const famScore = {};
    form.querySelectorAll("fieldset.diep input:checked").forEach((i) => {
      const fam = i.name.split("_")[2];
      famScore[fam] = Math.max(famScore[fam] || 0, Number(i.value));
    });
    bewaar("uitslag_" + who, { ...formWaarden(), datum: new Date().toISOString().slice(0, 10) });
    const t = form.querySelector('input[name="t0"]:checked');
    const toon = () => showResult(r.rank, r.score, r.max, r.profiel, famScore, t ? Number(t.value) : 0);
    // De vragen eerst rustig laten verdwijnen, dan pas de uitslag tonen
    const grid = $(".testgrid");
    if (grid.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) return toon();
    grid.classList.add("weg");
    setTimeout(() => { grid.classList.remove("weg"); toon(); }, 220);
  });

  function topLijst(items) {
    const s = items.slice().sort((a, b) => b.val - a.val).filter((x) => x.val >= 3).slice(0, 3);
    return s.length ? s.map((x) => x.naam) : [];
  }

  function showResult(rank, score, max, profiel, famScore = {}, toel = 0) {
    const top = rank.slice(0, 2);
    const ouder = who === "ouder";
    const pct = (k) => Math.round((score[k] / max[k]) * 100);
    const kw = topLijst(profiel.kwal);
    const dr = topLijst(profiel.drijf);
    const lijstje = (xs) => xs.map((x) => x.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " en $1");
    const famNaam = (f) => esc((FAMILIES.find((x) => x.id === f) || {}).naam || f);
    const fams = Object.keys(famScore).filter((f) => famScore[f] >= 3).sort((a, b) => famScore[b] - famScore[a]).slice(0, 3);
    const delen = [];
    if (kw.length) delen.push(`sterk in ${lijstje(kw)}`);
    if (dr.length) delen.push(`vindt ${lijstje(dr)} belangrijk`);

    let h = `<div class="res-top"><a class="btn" href="#/plan">Maak mijn stappenplan →</a><button type="button" class="btn ghost" id="aanpassen">← Antwoorden aanpassen</button><button type="button" class="btn ghost" id="opnieuw">Opnieuw beginnen</button></div>`;
    h += `<h3>${ouder ? "Dit past bij je kind" : "Dit past bij jou"}</h3>`;
    if (delen.length) h += `<p class="res-jij">${ouder ? "Je kind is" : "Jij bent"} ${delen.join(" en ")}.</p>`;
    h += `<div class="samen-uit"><div><p class="st-soort">Samen vergelijken</p><p>${ouder ? "Laat je kind de Padvinder ook doen. Dan zie je in één oogopslag waar jullie hetzelfde zien en waar het verschilt." : "Laat je ouder de Padvinder ook doen, over jou. Dan zie je in één oogopslag waar jullie hetzelfde zien en waar het verschilt."}</p></div><a class="btn ghost" href="#/samen">${lees("uitslag_" + (ouder ? "leerling" : "ouder"), null) ? "Bekijk de vergelijking →" : "Zo werkt het →"}</a></div>`;
    h += `<div class="pad-terug"><figure class="levendpad replay" id="padReplay"></figure><div><h4>Zo liep ${ouder ? "het pad van je kind" : "jouw pad"}</h4><p>Elk antwoord boog het pad een klein stukje. Tijdens de test liet de Padvinder dat bewust niet zien, zodat het je antwoorden niet stuurde.</p><button type="button" class="btn ghost" id="padOpnieuw">Speel opnieuw af</button></div></div>`;

    h += `<div class="richtingen">` + top.map((k, i) => {
      const g = GEBIEDEN[k];
      const p = personaLijst(k)[0];
      const p2 = personaLijst(k)[1];
      const eigen = fams.filter((f) => (FAMILIES.find((x) => x.id === f) || {}).gebied === k);
      const knoppen = (eigen.length ? eigen : FAMILIES.filter((f) => f.gebied === k).map((f) => f.id)).slice(0, 3);
      return `<article class="richting"><div class="r-kop"><span class="res-ic">${icon(k, 40)}</span><div><small>Richting ${i + 1} · ${pct(k)}%</small><h4>${esc(g.naam)}</h4></div></div>` +
        `<p class="r-uitleg">${vt(g.uitleg)}</p>` +
        (p ? `<figure class="persona-groot"><blockquote>${vt(p.tekst)}</blockquote><figcaption><strong>${esc(p.naam)}</strong> · ${esc(p.studie)} <small>(voorbeeld)</small></figcaption></figure>` : "") +
        `<p class="r-sub"><strong>Wat kun je ermee?</strong> ${g.kunJe.slice(0, 2).map(vt).join(" · ")}</p>` +
        `<div class="mini">${knoppen.map((f) => `<button type="button" data-fam="${f}">${famNaam(f)}</button>`).join("")}</div>` +
        `<details class="meer"><summary>Meer over ${esc(g.naam)}</summary>` +
        `<h5>Wat de opleidingen gemeen hebben</h5><ul>${g.gemeen.map((t) => `<li>${vt(t)}</li>`).join("")}</ul>` +
        (p2 ? `<h5>Nog een student</h5><p><strong>${esc(p2.naam)}</strong>, ${esc(p2.studie)}: ${vt(p2.tekst)}</p>` : "") +
        `<h5>Studies uitgelegd</h5><div class="mini">${STUDIES.filter((s) => s.gebied === k).map((s) => `<button type="button" data-id="${s.id}">${esc(s.naam)}</button>`).join("")}</div>` +
        `<h5>Om over te praten</h5><ul>${g.praat.map((t) => `<li>${vt(t)}</li>`).join("")}</ul></details></article>`;
    }).join("") + `</div>`;

    const sel = fams.filter((f) => SELECTIE[f]);
    if (sel.length && toel === 2) h += `<p class="praat">Je gaf aan liever geen toelatingsexamen, auditie of portfolio te willen. Let op bij ${sel.map((f) => `<strong>${famNaam(f)}</strong>`).join(" en ")}: ${sel.map((f) => esc(SELECTIE[f])).join(" ")}</p>`;

    h += `<div class="res-rij">` +
      `<div><h5>${ouder ? "Sterke punten" : "Jouw kwaliteiten"}</h5>${kw.length ? `<div class="tags">${kw.map((t) => `<span class="tag2">${esc(t)}</span>`).join("")}</div>` : `<p class="count">Nog niet uitgesproken; dat ontdek je vaak in de praktijk.</p>`}</div>` +
      `<div><h5>${ouder ? "Wat voor je kind telt" : "Wat voor jou telt"}</h5>${dr.length ? `<div class="tags">${dr.map((t) => `<span class="tag2">${esc(t)}</span>`).join("")}</div>` : `<p class="count">Nog niet uitgesproken.</p>`}</div>` +
      `<div class="ook"><h5>Ook het bekijken waard</h5><p><strong>${esc(GEBIEDEN[rank[2]].naam)}</strong>: <button type="button" class="linkbtn" data-gebied="${rank[2]}">bekijk de opleidingen</button></p></div>` +
      `</div>`;

    h += `<details class="meer"><summary>Alle scores en jouw route op de campus</summary><div class="bars">` +
      rank.map((k) => `<div class="bar"><span>${esc(GEBIEDEN[k].naam)}</span><span class="track"><span class="fill" style="width:${pct(k)}%;display:block"></span></span><span>${pct(k)}%</span></div>`).join("") +
      `</div><div class="kaartwrap" id="uitslagKaart" style="margin-top:8px"></div></details>`;
    h += `<details class="meer"><summary>${ouder ? "Tips voor jou als ouder" : "Tips voor jou en wie met je meedenkt"}</summary><ul>` +
      (ouder
        ? ["Laat je kind de Padvinder ook zelf doen en vergelijk de uitslagen.", "Stel vragen in plaats van adviezen te geven. “Wat spreekt je hieraan aan?” werkt beter dan “Dit past bij jou”.", "Plan samen een meeloopdag of open dag."]
        : ["Laat iemand die je goed kent (ouder, mentor, oom of tante) de Padvinder ook over jou invullen. Bekijk samen waar het verschilt.", "Kies twee of drie opleidingen en zoek een open dag of meeloopdag op.", "Je hoeft nu niets te beslissen. Dit is een eerste richting."]
      ).map((t) => `<li>${vt(t)}</li>`).join("") + `</ul></details>`;
    h += `<p class="count" style="margin-top:14px">De Padvinder is geen goedgekeurde of wetenschappelijk getoetste test, maar een hulpmiddel voor persoonlijk inzicht op basis van interesses, kwaliteiten en waarden. Bespreek je uitslag met iemand die je goed kent, of met je mentor of decaan.</p>`;

    bewaar("padvinder", { top, fams, toel, datum: new Date().toISOString().slice(0, 10) });
    padvinder = lees("padvinder", null);
    const box = $("#uitslag");
    box.innerHTML = h;
    speelPadAf();
    $("#padOpnieuw").addEventListener("click", speelPadAf);
    renderPlan();
    box.hidden = false;
    const uk = $("#uitslagKaart");
    uk.innerHTML = buildMap() + `<div class="kaartleg"><span>Jouw route: de rode paadjes</span><span>Klik op een faculteit voor de opleidingen</span></div>`;
    highlightMap(uk, top);
    highlightMap($("#kaartKaart"), top);
    box.querySelectorAll(".mini button").forEach((b) =>
      b.addEventListener("click", () => (b.dataset.fam ? openFamily(b.dataset.fam) : openDetail(b.dataset.id)))
    );
    $("#aanpassen").addEventListener("click", () => {
      box.hidden = true;
      $(".testgrid").hidden = false;
      toStep(0);
      scrollNaar(0);
    });
    $("#opnieuw").addEventListener("click", () => {
      bewaar("antwoorden", null);
      form.reset();
      cur = 0;
      buildQuiz();
      box.hidden = true;
      $(".testgrid").hidden = false;
      scrollNaar(0);
    });
    $(".testgrid").hidden = true;
    box.classList.remove("verschijnt");
    void box.offsetWidth;
    box.classList.add("verschijnt");
    box.focus({ preventScroll: true });
    // Naar het begin van de uitslag, niet naar de top van de pagina
    scrollNaar(box.getBoundingClientRect().top + window.scrollY - onderKop());
  }

  /* ---------- Schoolvak -> studie ---------- */
  // Vakken als knoppen; het gekozen vak opent breed in één paneel eronder
  $("#vakkenLijst").innerHTML = VAKKEN.map((v, i) => `<button type="button" class="vakknop" data-vak="${i}" aria-pressed="false">${esc(v[0])}</button>`).join("");
  function toonVak(i) {
    const v = VAKKEN[i];
    if (!v) return;
    document.querySelectorAll("#vakkenLijst .vakknop").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vak === String(i))));
    const oj = VAKKEN_OVERJOU[v[0]];
    const tags = (l) => `<div class="tags">${l.map((t) => `<span class="tag2">${esc(t)}</span>`).join("")}</div>`;
    $("#vakPaneel").innerHTML =
      `<div class="vak-kol"><h3>${esc(v[0])}</h3>` +
      (oj ? `<h4>Je bent waarschijnlijk goed in</h4>${tags(oj[0])}<h4>Je bent waarschijnlijk geïnteresseerd in</h4>${tags(oj[1])}` : "") +
      `<h4>Wat je er waarschijnlijk écht leuk aan vindt</h4><p>${vt(v[1])}</p></div>` +
      `<div class="vak-kol"><h4>Wat kun je ermee?</h4><ul class="vakwerk beroepen">${v[5].map(beroepLi).join("")}</ul>` +
      `<h4>Waar dat terugkomt</h4><p>${vt(v[2])}</p>` +
      `<p class="vak-let"><strong>Anders dan je misschien denkt:</strong> ${vt(v[3])}</p>` +
      `<p><button type="button" class="btn" data-fams="${esc(v[4])}">Bekijk die opleidingen</button></p></div>`;
    $("#vakPaneel").hidden = false;
    // Minder bekende studies die bij het gekozen vak passen
    $("#nieuwSub").textContent = `Minder bekende opleidingen die passen bij ${v[0]}.`;
    // Studies waarbij dit vak als eerste staat komen bovenaan
    $("#nieuwLijst").innerHTML = NIEUW.filter((n) => n[2].includes(v[0]))
      .sort((a, b) => a[2].indexOf(v[0]) - b[2].indexOf(v[0])).slice(0, 6)
      .map((n) => `<div class="nw"><strong>${vt(n[0])}</strong><span>${vt(n[1])}</span></div>`).join("");
    bewaar("vak", i);
  }
  $("#vakkenLijst").addEventListener("click", (e) => { const b = e.target.closest("[data-vak]"); if (b) toonVak(Number(b.dataset.vak)); });
  $("#vakPaneel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-fams]");
    if (b) openFamily(b.dataset.fams.split(",")[0].trim());
  });
  toonVak(lees("vak", 0));

  /* ---------- Vertaler en woordenlijst ---------- */
  VERTAAL.forEach((v) => {
    const b = el("button", { type: "button", class: "flip", "aria-pressed": "false", "aria-label": `${v[0]}: draai om voor de vertaling` },
      `<span class="flip-in"><span class="front"><small>Engelse naam</small><strong lang="en">${esc(v[0])}</strong><em>Klik om om te draaien ↻</em></span>` +
      `<span class="back"><small>Letterlijk</small><span class="letterlijk">${esc(v[1])}</span><small>Wat het echt is</small><strong>${esc(v[2])}</strong><span class="uitleg">${vt(v[3])}</span></span></span>`);
    b.addEventListener("click", () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")));
    $("#vertaalLijst").appendChild(b);
  });
  // Engelse studienaam intypen: alleen echte opleidingen (Engelse naam uit DUO, of opleiding met alleen een Engelse naam)
  const nlVan = (o) => (Object.hasOwn(ENGELSE_NAAM_NL, o.n) ? ENGELSE_NAAM_NL[o.n] : o.n);
  const engIndex = new Map();
  OPLEIDINGEN.forEach((o) => {
    const en = o.e && norm(o.e) !== norm(o.n) ? o.e : Object.hasOwn(ENGELSE_NAAM_NL, o.n) ? o.n : "";
    if (!en) return;
    const k = norm(en);
    if (!engIndex.has(k)) engIndex.set(k, { en, items: [] });
    if (!engIndex.get(k).items.includes(o)) engIndex.get(k).items.push(o);
  });
  const engNamen = [...engIndex.entries()].sort((a, b) => a[1].en.localeCompare(b[1].en, "en"));
  $("#vertaalNamen").innerHTML = engNamen.map(([, x]) => `<option value="${esc(x.en)}">`).join("");
  let vtTreffers = [];
  function engKaart(x, i) {
    const nl = [...new Set(x.items.map(nlVan))];
    const zelfde = nl.length === 1 && norm(nl[0]) === norm(x.en);
    return `<div class="vt-kaart"><small>Engelse naam</small><strong lang="en">${esc(x.en)}</strong>` +
      `<small>In het Nederlands</small><strong class="vt-nl">${nl.map(esc).join(" of ")}</strong>${zelfde ? `<span class="vt-noot">Dit woord gebruiken we in het Nederlands ook.</span>` : ""}` +
      `<small>${x.items.length === 1 ? "De opleiding" : "De opleidingen"}</small><div class="mini">${x.items.map((o, j) =>
        `<button type="button" data-vt="${i}:${j}">${esc(o.n)} <small style="color:var(--muted)">${o.l.map((n) => NIV_LABEL[n]).join(", ")} · ${o.i.length} ${o.i.length === 1 ? "school" : "scholen"}</small></button>`).join("")}</div></div>`;
  }
  function renderVertaalZoek() {
    const ruw = $("#vertaalZoek").value.trim();
    const q = norm(ruw).replace(/\s+/g, " ");
    const uit = $("#vertaalUitslag");
    if (!q) { vtTreffers = []; uit.innerHTML = ""; return; }
    const exact = engIndex.get(q);
    const w = q.split(" ");
    vtTreffers = exact ? [exact] : q.length < 3 ? [] : engNamen.filter(([k]) => w.every((x) => k.includes(x)))
      .sort((a, b) => b[0].startsWith(q) - a[0].startsWith(q) || a[0].length - b[0].length).map(([, x]) => x);
    if (q.length < 3 && !exact) { uit.innerHTML = ""; return; }
    if (!vtTreffers.length) {
      uit.innerHTML = `<p class="vt-geen"><strong>${esc(ruw)}</strong> is geen bestaande Engelse studienaam in Nederland. We zoeken in de officiële lijst van DUO. Kies een naam uit de lijst die verschijnt als je typt.</p>`;
      return;
    }
    const meer = vtTreffers.length - 4;
    vtTreffers = vtTreffers.slice(0, 4);
    uit.innerHTML = `<div class="vt-lijst">${vtTreffers.map(engKaart).join("")}</div>` +
      (meer > 0 ? `<p class="vt-geen">En nog ${meer} ${meer === 1 ? "naam" : "namen"} met dit woord. Typ verder om te kiezen.</p>` : "");
  }
  $("#vertaalZoek").addEventListener("input", renderVertaalZoek);
  $("#vertaalUitslag").addEventListener("click", (e) => {
    const b = e.target.closest("[data-vt]");
    if (!b) return;
    const [i, j] = b.dataset.vt.split(":").map(Number);
    const o = vtTreffers[i].items[j];
    openOpleiding(o, FAMILIES.find((f) => f.id === o.f));
  });
  // zelfde adressen als tools/build_begrippen.py
  const woordSlug = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " en ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const woordFilter = { thema: "", zoek: "" };
  function renderWoorden() {
    const z = woordFilter.zoek.trim().toLowerCase();
    const lijst = WOORDEN.filter((w) => (!woordFilter.thema || w[0] === woordFilter.thema) && (!z || (w[1] + " " + w[2]).toLowerCase().includes(z)))
      .sort((x, y) => x[1].localeCompare(y[1], "nl"));
    $("#woordenLijst").innerHTML = lijst.map((w) => `<div class="woord"><strong><a href="begrippen/${woordSlug(w[1])}/">${esc(w[1])}</a></strong><p>${vt(w[2])}</p></div>`).join("");
    $("#woordGeen").hidden = lijst.length > 0;
  }
  $("#woordZoek").addEventListener("input", (e) => { woordFilter.zoek = e.target.value; renderWoorden(); });
  $("#woordThema").addEventListener("click", (e) => {
    const b = e.target.closest("[data-thema]");
    if (!b) return;
    woordFilter.thema = b.dataset.thema;
    document.querySelectorAll("#woordThema .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderWoorden();
  });
  renderWoorden();

  /* ---------- Landkaart ---------- */
  const REG = {
    weten: [170, 112, 1],
    tech: [700, 100, 2],
    zorg: [790, 290, 3],
    mens: [410, 235, 4],
    creatief: [185, 345, 5],
    bedrijf: [620, 385, 6]
  };
  const START = [470, 556];
  const COL = { zorg: "#e85d04", weten: "#2d6a4f", tech: "#1d4ed8", mens: "#7c3aed", creatief: "#b8860b", bedrijf: "#374151" };
  const PATHS = {
    creatief: "M470 538 C380 532 305 490 292 445 S238 408 215 396",
    mens: "M470 538 C535 505 490 452 438 425 S345 345 400 296",
    bedrijf: "M470 538 C545 546 612 522 616 470 S618 450 620 445",
    zorg: "M470 538 C620 566 765 505 796 425 S770 372 792 350",
    tech: "M470 538 C525 480 515 425 535 365 S610 260 665 205 S697 180 698 160",
    weten: "M470 538 C425 485 520 425 468 362 S335 338 304 300 S252 242 218 205 S190 190 176 172"
  };
  const DECOR = ["M40 500C100 460 170 505 235 470S330 430 372 458", "M880 400C830 440 860 500 810 540", "M560 150C600 120 640 150 660 118"];
  // Pictogrammen (64x64, lijnen), één kleur
  const ICONS = {
    zorg: `<path d="M32 54C10 38 6 22 17 15c7-4 13 0 15 5 2-5 8-9 15-5 11 7 7 23-15 39Z"/><path d="M12 33h12l5-9 6 17 5-8h12"/>`,
    weten: `<path d="M12 9h16M14 9v34a6 6 0 0 0 12 0V9M14 28h12"/><path d="M36 9h16M38 9v34a6 6 0 0 0 12 0V9M38 22h12"/><circle cx="20" cy="36" r="1.8"/><circle cx="44" cy="33" r="1.8"/><circle cx="43" cy="39" r="1.2"/><path d="M6 56h52"/>`,
    tech: `<path d="M21 19 8 32l13 13M43 19l13 13-13 13M37 14 27 50"/>`,
    mens: `<circle cx="23" cy="21" r="8"/><path d="M8 54c0-14 30-14 30 0"/><circle cx="44" cy="25" r="6.5"/><path d="M36 54c1-9 22-11 24 0"/>`,
    creatief: `<path d="m10 54 4-14L42 12l10 10-28 28Z"/><path d="m36 18 10 10M14 40l10 10"/><path d="M8 58h26"/>`,
    bedrijf: `<path d="M14 52V40M26 52V32M38 52V24M50 52V14"/><path d="M8 58h50"/><path d="m10 30 14-8 10 6 18-20M44 8h8v8"/>`
  };
  function icon(k, s) {
    return `<svg class="ik" viewBox="0 0 64 64" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
  }
  function building(k) {
    const [cx, cy, n] = REG[k];
    return `<g class="reg" style="--c:${COL[k]}" data-gebied="${k}" tabindex="0" role="button" aria-label="Faculteit ${esc(GEBIEDEN[k].naam)}: bekijk opleidingen">` +
      `<circle class="disc" cx="${cx}" cy="${cy}" r="58"/><circle class="ring" cx="${cx}" cy="${cy}" r="52"/>` +
      `<g class="ico" transform="translate(${cx - 36} ${cy - 36}) scale(1.125)" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g>` +
      `<g class="bnr"><circle cx="${cx - 46}" cy="${cy - 46}" r="13"/><text x="${cx - 46}" y="${cy - 41}">${n}</text></g>` +
      `<text class="nm" x="${cx}" y="${cy - 74}">${esc(GEBIEDEN[k].naam)}</text><text class="tel" x="${cx}" y="${cy + 82}"></text></g>`;
  }
  function tree(x, y, i) {
    const r = 11 + (i % 3) * 3;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6dad6" fill-opacity=".95" stroke="#c4aea7" stroke-width="1.3"/><circle cx="${x - 2}" cy="${y - 3}" r="${r * 0.45}" fill="#f0e8e5" fill-opacity=".95"/>`;
  }
  function buildMap() {
    const TREES = [[30, 40], [64, 66], [330, 60], [360, 36], [540, 70], [570, 44], [870, 50], [846, 78], [34, 215], [66, 238], [880, 200], [868, 470], [840, 500], [880, 540], [60, 420], [100, 450], [330, 560], [364, 584], [560, 590], [250, 580], [420, 120], [900, 330]];
    const trees = TREES.map(([x, y], i) => tree(x, y, i)).join("");
    let contours = "";
    [[200, 70, 30], [200, 70, 60], [200, 70, 95], [720, 560, 50], [720, 560, 95], [720, 560, 140], [880, 300, 40], [880, 300, 80]].forEach(([cx, cy, r]) => {
      contours += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.6}" ry="${r}"/>`;
    });
    let roads = DECOR.map((d) => `<path d="${d}" fill="none" stroke="#d62828" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8"/>`).join(""), regs = "";
    Object.keys(REG).forEach((k) => { roads += `<path class="roadedge" d="${PATHS[k]}"/>`; });
    Object.keys(REG).forEach((k) => {
      roads += `<path class="road" data-g="${k}" d="${PATHS[k]}"/>`;
      regs += building(k);
    });
    const pond = `<path d="M40 586C30 566 70 556 112 562S176 580 150 598S52 606 40 586Z" fill="#d3e2f8" stroke="#8aa6d8" stroke-width="1.3"/><path d="M62 580H128M72 588H118" stroke="#8aa6d8" stroke-opacity=".6" stroke-width=".9"/>`;
    return `<svg viewBox="0 0 900 616" role="group" aria-label="Plattegrond van de campus met zes faculteiten">` +
      `<defs><linearGradient id="gras" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#f7f3f1"/><stop offset="1" stop-color="#ece4e1"/></linearGradient></defs><rect width="900" height="616" fill="url(#gras)"/>` +
      `<g fill="#e7dedb" opacity=".55"><ellipse cx="320" cy="60" rx="190" ry="36"/><ellipse cx="760" cy="470" rx="170" ry="40"/><ellipse cx="90" cy="250" rx="110" ry="34"/><ellipse cx="520" cy="590" rx="160" ry="22"/></g>` +
      `<g fill="none" stroke="#d62828" stroke-opacity=".10" stroke-width="1">${contours}</g>` +
      pond + trees + roads + regs +
      `<g class="hier" transform="translate(${START[0]} ${START[1]})"><rect x="-70" y="-16" width="140" height="32" rx="4" fill="#14213d"/><text y="5" text-anchor="middle" fill="#f4f1ea">HOOFDINGANG</text></g>` +
      `<g transform="translate(850 52)"><circle r="24" fill="none" stroke="#14213d" stroke-width="1.2"/><path d="M0 -20L5 -4L20 0L5 4L0 20L-5 4L-20 0L-5 -4Z" fill="#14213d"/><path d="M0 -20L5 -4L-5 -4Z" fill="#d62828"/><text y="-31" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="13" fill="#14213d">N</text></g>` +
      `</svg>` +
      `<div class="kaartlijst">${Object.keys(REG).map((k) => `<button type="button" style="--c:${COL[k]}" data-gebied="${k}">${icon(k, 40)}<small>Faculteit ${REG[k][2]}</small><strong>${esc(GEBIEDEN[k].naam)}</strong><span>${vt(GEBIEDEN[k].uitleg.split(". ")[0])}.</span><em class="tel" hidden></em></button>`).join("")}</div>`;
  }
  // Zoekresultaten op de campus: faculteiten met treffers lichten op, de rest wordt stil
  function zoekOpKaart(root, tel) {
    const actief = tel !== null;
    root.classList.toggle("zoekend", actief);
    root.querySelectorAll("[data-gebied]").forEach((g) => {
      const n = actief ? tel[g.dataset.gebied] || 0 : 0;
      g.classList.toggle("gevonden", n > 0);
      const t = g.querySelector(".tel");
      t.textContent = n ? n + (n === 1 ? " opleiding" : " opleidingen") : "";
      if (t.tagName === "EM") t.hidden = !n;
    });
  }
  function highlightMap(root, top) {
    root.querySelectorAll("[data-gebied]").forEach((g) => g.classList.remove("top1", "top2"));
    root.querySelectorAll(".road,.roadmid").forEach((p) => p.classList.remove("hot", "hotmid"));
    top.forEach((k, i) => {
      root.querySelectorAll(`[data-gebied="${k}"]`).forEach((g) => g.classList.add("top" + (i + 1)));
      root.querySelectorAll(`.road[data-g="${k}"]`).forEach((p) => p.classList.add("hot"));
      root.querySelectorAll(`.roadmid[data-g="${k}"]`).forEach((p) => p.classList.add("hotmid"));
    });
  }
  function openRegion(k) {
    state.gebied = k;
    // Tijdens het zoeken blijft de zoekterm staan: dan zie je de treffers van die faculteit
    renderChips();
    renderList();
    // Soepel naar de lijst, zodat je ziet dat je vanaf de kaart naar beneden gaat
    go("opleidingen", "alle", true);
  }

  /* ---------- Schermen: steeds één onderwerp tegelijk ---------- */
  const TEGELS = {
    test: ["#/test", "Welke kant op?", "Doe de Padvinder, in 5 minuten"],
    weetal: ["#/weetal", "Wat een onzin!", "Ik weet allang wat ik wil"],
    samen: ["#/samen", "Samen vergelijken", "Jouw Padvinder naast die van je ouder"],
    sterren: ["#/sterren", "Sterrenkaart", "Verken vrij, van wat je leuk vindt tot opleidingen"],
    metro: ["#/metro", "Metrokaart", "Alle routes van school naar werk"],
    droom: ["#/droom", "Later word ik de nieuwe…", "Van droombaan naar echte banen"],
    te: ["#/te", "Mensen vinden mij te…", "Je minpunt is ergens een kracht"],
    opleidingen: ["#/opleidingen", "Alle opleidingen", "Mbo, hbo en wo in gewone taal"],
    opendagen: ["#/opendagen", "Open dagen", "En een dag meelopen"],
    plan: ["#/plan", "Mijn stappenplan", "Van nu tot je eerste studiedag"],
    profiel: ["#/profiel", "Mijn profiel", "Je klas, profiel en vakken, anoniem"],
    ouders: ["#/ouders", "Voor ouders", "Zo voer je het gesprek"],
    route: ["#route", "Hoe kom ik daar?", "Aanmelden, toelating, inschrijven"],
    toelating: ["#toelating", "Word ik toegelaten?", "Loting, selectie, portfolio"],
    leerwerk: ["#leerwerk", "Leren én werken?", "Bbl, duaal of deeltijd: op elk niveau"],
    planb: ["#planb", "Plan B", "Wat als je niet wordt aangenomen?"],
    geld: ["#geld", "Wie betaalt wat?", "Collegegeld, DUO, een kamer"],
    opties: ["#opties", "Buitenland, tussenjaar, Defensie of politie?", "En later nog switchen"],
    eerlijk: ["#eerlijk", "Waarom misschien níet?", "De vragen die een open dag overslaat"],
    niveaus: ["#niveaus", "Mbo, hbo of wo?", "Drie paden, geen doodlopende"],
    vakken: ["#vakken", "Mijn lievelingsvak", "Wat zegt het over jou, wat kun je ermee?"],
    vertaal: ["#vertaal", "Business wát?", "Engelse studienamen vertaald"],
    woorden: ["#woorden", "Moeilijke woorden", "Van LOB tot propedeuse"],
  };
  // Icoon per tegel (lijnstijl, 24x24) en soort: ontdekken, regelen of naslag
  const ICOON = {
    test: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    weetal: '<path d="M12 3v18M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
    samen: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13.5 20a4 4 0 0 1 8 0"/>',
    sterren: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    metro: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h6a4 4 0 0 1 0 8h-2a4 4 0 0 0 0 8"/><path d="M17 18h-6"/>',
    droom: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
    te: '<path d="M12 21s-7-4.5-9-9.5A5 5 0 0 1 12 6a5 5 0 0 1 9 5.5c-2 5-9 9.5-9 9.5z"/>',
    opleidingen: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
    opendagen: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    plan: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    profiel: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    ouders: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    route: '<path d="M4 20V4l6 3 6-3 4 2v14l-4-2-6 3-6-3"/><path d="M10 7v13M16 4v14"/>',
    toelating: '<path d="M3 21h18M5 21V10l7-6 7 6v11"/><path d="M10 21v-6h4v6"/>',
    leerwerk: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    planb: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    geld: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5a3.5 3.5 0 1 0 0 7M7.5 11h5M7.5 13.5h5"/>',
    opties: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    eerlijk: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    niveaus: '<path d="M4 20V14h4v6M10 20V9h4v11M16 20V4h4v16"/>',
    vakken: '<path d="M4 19V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13"/>',
    vertaal: '<path d="M4 5h8M8 3v2M6 5c0 4 2.5 7 6 8M10 5c0 3-2.5 7-6 8M13 21l4-9 4 9M14.5 18h5"/>',
    woorden: '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="17.5" cy="16.5" r="2.5"/><path d="m19.5 18.5 2 2"/>',
  };
  const SOORT = { plan: "regel", profiel: "regel", opendagen: "regel", route: "regel", toelating: "regel", geld: "regel", planb: "regel", leerwerk: "regel", opties: "regel", opleidingen: "naslag", niveaus: "naslag", vertaal: "naslag", woorden: "naslag", eerlijk: "naslag" };
  const icoonHtml = (k) => (ICOON[k] ? `<span class="ticoon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICOON[k]}</svg></span>` : "");
  // De starttegels staan los in index.html: zoek de sleutel op via de link
  const tegelSleutel = (href) => Object.keys(TEGELS).find((k) => TEGELS[k][0] === href);
  const versierTegel = (a) => {
    const k = tegelSleutel(a.getAttribute("href"));
    if (!k || a.querySelector(".ticoon")) return;
    a.insertAdjacentHTML("afterbegin", icoonHtml(k));
    if (SOORT[k]) a.classList.add("s-" + SOORT[k]);
  };
  document.querySelectorAll(".tegel").forEach(versierTegel);
  const tegelHtml = (k) => { const [h, t, sub] = TEGELS[k]; return `<a class="tegel${SOORT[k] ? " s-" + SOORT[k] : ""}" href="${h}">${icoonHtml(k)}<strong>${t}</strong><span>${sub}</span></a>`; };
  const VERDER = {
    test: ["samen", "sterren", "droom", "plan"], weetal: ["opleidingen", "toelating", "samen", "plan"], droom: ["sterren", "te", "test", "vakken"], te: ["droom", "sterren", "test", "vakken"],
    opleidingen: ["sterren", "vertaal", "opendagen", "plan"], opendagen: ["eerlijk", "plan", "ouders", "geld"], plan: ["profiel", "planb", "metro", "geld"], profiel: ["plan", "opleidingen", "vakken", "metro"],
    uitleg: ["metro", "plan", "test", "ouders"], ouders: ["samen", "metro", "plan", "test"], samen: ["ouders", "plan", "sterren", "opendagen"],
    sterren: ["test", "droom", "metro", "opleidingen"], metro: ["planb", "plan", "toelating", "sterren"],
  };
  // In de volgorde van een studiekeuze: eerst oriënteren, dan kritisch kijken, dan aanmelden en regelen; de woordenlijst als naslag achteraan
  const UITLEG = ["niveaus", "leerwerk", "vakken", "vertaal", "eerlijk", "route", "toelating", "planb", "geld", "opties", "woorden"];
  $("#uitlegTegels").innerHTML = UITLEG.map(tegelHtml).join("");
  const VIEWS = { weetal: ["weetal"], samen: ["samen"], start: ["ontdek"], droom: ["droom"], te: ["te"], sterren: ["sterren"], metro: ["metro"], test: ["test"], opleidingen: ["gids", "kaart", "alle"], opendagen: ["opendagen"], plan: ["plan"], profiel: ["profiel"], uitleg: ["uitlegmenu", "route", "toelating", "planb", "leerwerk", "geld", "opties", "eerlijk", "niveaus", "vakken", "vertaal", "woorden"], ouders: ["ouders"] };
  let view = "";
  function go(v, target, zacht = false) {
    if (!VIEWS[v]) v = "start";
    // Uitleg: één onderwerp tegelijk; de onderwerptegels alleen op het overzicht
    const los = v === "uitleg" && UITLEG.includes(target);
    document.querySelectorAll("main > section").forEach((s) => (s.hidden = !VIEWS[v].includes(s.id) || (v === "uitleg" && UITLEG.includes(s.id) && s.id !== target)));
    $("#uitlegmenu").hidden = !VIEWS[v].includes("uitlegmenu") || los;
    // Binnen hetzelfde scherm soepel scrollen; een nieuw scherm begint meteen bovenaan
    if (v === view) zacht = true;
    if (v !== view) {
      view = v;
      $("#verder").hidden = !VERDER[v];
      if (VERDER[v]) $("#verderTegels").innerHTML = VERDER[v].map(tegelHtml).join("");
      $(".hero").hidden = v !== "start";
      document.querySelectorAll(".tabs a").forEach((a) => a.setAttribute("aria-current", a.dataset.view === v ? "page" : "false"));
    }
    if (v === "samen") renderSamen();
    if (v === "profiel") renderProfiel();
    const adres = los ? "#" + target : "#/" + v;
    if (location.hash !== adres) history.replaceState(null, "", adres);
    const t = target && document.getElementById(target);
    scrollNaar(t ? t.getBoundingClientRect().top + window.scrollY - onderKop() : 0, zacht);
  }
  // Soepel waar het kan, direct als iemand liever geen beweging ziet
  function scrollNaar(top, zacht = true) {
    const soepel = zacht && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: soepel ? "smooth" : "instant" });
  }
  // Ruimte onder de vaste menubalk, die op desktop twee regels hoog is
  function onderKop() { return ($(".topbar")?.offsetHeight || 64) + 20; }
  function route() {
    if ($("#detail").open) $("#detail").close();
    let h = location.hash.replace(/^#\/?/, "");
    if (h.startsWith("opl?")) {
      const naam = new URLSearchParams(h.slice(4)).get("n");
      history.replaceState(null, "", "#/opleidingen");
      h = "opleidingen";
      setTimeout(() => { const o = OPLEIDINGEN.find((x) => x.n === naam); if (o) openOpleiding(o, FAMILIES.find((f) => f.id === o.f)); });
    }
    if (h.startsWith("samen?")) {
      const q = new URLSearchParams(h.slice(6));
      [["l", "leerling"], ["o", "ouder"]].forEach(([p, rol]) => { const u = q.get(p) && vanCode(q.get(p)); if (u) bewaar("uitslag_" + rol, u); });
      history.replaceState(null, "", "#/samen");
      h = "samen";
    }
    if (VIEWS[h]) return go(h);
    const v = Object.keys(VIEWS).find((k) => VIEWS[k].includes(h));
    go(v || "start", v ? h : null);
  }
  window.addEventListener("hashchange", route);
  $("#kaartKaart").innerHTML = buildMap() +
    `<div class="kaartleg"><span>Jouw route (na de test)</span><span>Paadje naar een faculteit: via mbo, hbo of wo</span><span>Klik op een faculteit</span></div>`;
  document.addEventListener("click", (e) => {
    const fo = e.target.closest("[data-famopen]");
    if (fo) { $("#detail").close(); openFamily(fo.dataset.famopen); return; }
    const be = e.target.closest("[data-beroep]");
    if (be) {
      e.preventDefault();
      $("#detail").close();
      Object.assign(state, { zoek: be.dataset.beroep, niveau: "", gebied: "", vorm: "" });
      $("#zoek").value = be.dataset.beroep;
      renderChips();
      renderList();
      go("opleidingen", "alle");
      return;
    }
    const g = e.target.closest("[data-gebied]");
    if (g) openRegion(g.dataset.gebied);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target.closest && e.target.closest("[data-gebied]");
    if (g) { e.preventDefault(); openRegion(g.dataset.gebied); }
  });

  /* ---------- Open dagen ---------- */
  const OD = typeof OPEN_DAGEN === "object" ? OPEN_DAGEN : {};
  const vandaag = new Date().toISOString().slice(0, 10);
  const fmt = (d, opt) => new Date(d + "T12:00:00").toLocaleDateString("nl-NL", opt);
  const veiligeUrl = (u) => (u && /^https?:\/\//.test(u) ? u : "");
  let odSoort = "";
  let odNiveau = "";
  // Welke soort onderwijs biedt een school aan (uit de opleidingen); ad telt als hbo
  const instNiv = {};
  if (typeof INST_NIV === "object") Object.keys(INST_NIV).forEach((k) => (instNiv[k] = new Set(INST_NIV[k])));
  if (typeof MBO_INSTS === "object") MBO_INSTS.forEach((k) => (instNiv[k] = instNiv[k] || new Set()).add("mbo"));
  if (typeof OD_MERK === "object") Object.values(OD_MERK).forEach((k) => (instNiv[k] = instNiv[k] || new Set()).add("mbo"));
  function komend(inst) {
    const e = OD[inst] || (typeof OD_MERK === "object" && OD[OD_MERK[inst]]);
    return e && Array.isArray(e.dagen) ? e.dagen.filter((d) => d.datum && (d.eind || d.datum) >= vandaag).sort((a, b) => a.datum.localeCompare(b.datum)) : [];
  }
  function schoolRegel(inst, opleiding, afst) {
    const k = komend(inst)[0];
    const odE = OD[inst] || (typeof OD_MERK === "object" && OD[OD_MERK[inst]]);
    const site = veiligeUrl(odE && odE.site);
    const domein = (typeof DOMEINEN === "object" && DOMEINEN[inst]) || (site ? new URL(site).hostname.replace(/^www[.]/, "") : "");
    const direct = opleiding && typeof MBO_URL === "object" && veiligeUrl(MBO_URL[`${opleiding}|${inst}`]);
    const zoek = direct || "https://duckduckgo.com/?q=" + encodeURIComponent(opleiding ? `${opleiding} ${domein ? "site:" + domein : inst}` : inst);
    let r = `<strong>${esc(inst)}</strong>`;
    if (afst) r += ` <span class="afst">${afst.adres ? esc(afst.adres) + ", " : ""}${esc(afst.pl)} · ${afstandTekst(afst.d)}</span>`;
    if (opleiding) r += ` <a href="${esc(zoek)}" target="_blank" rel="noopener">opleiding bekijken ↗</a> · <a href="${esc("https://duckduckgo.com/?q=" + encodeURIComponent(`meeloopdag ${opleiding} ${domein ? "site:" + domein : inst}`))}" target="_blank" rel="noopener">meeloopdag zoeken ↗</a>`;
    if (k) r += `<br><span class="od-next">Eerstvolgende ${esc(k.soort || "open dag")}: ${fmt(k.datum, { weekday: "short", day: "numeric", month: "long" })}${k.plaats ? ", " + esc(k.plaats) : ""}</span>`;
    if (site) r += ` · <a href="${esc(site)}" target="_blank" rel="noopener">open dagen ↗</a>`;
    return `<li>${r}</li>`;
  }
  // Ov-route naar de open dag (vanaf je woonplaats als die bekend is)
  function routeLink(r) {
    const doel = `${r.inst}${r.plaats ? ", " + r.plaats : instPlek[r.inst] ? ", " + instPlek[r.inst].pl : ""}`;
    const p = new URLSearchParams({ api: "1", destination: doel, travelmode: "transit" });
    if (thuis) p.set("origin", thuis.naam);
    return "https://www.google.com/maps/dir/?" + p.toString();
  }
  // Scholen met meer locaties: waar is de open dag van jouw opleiding?
  const instLocs = {};
  if (typeof LOC === "object") Object.values(LOC).forEach((l) => l.forEach(([inst, pl]) => { (instLocs[inst] = instLocs[inst] || new Set()).add(pl); }));
  function locatieWaarschuwing(r) {
    const n = instLocs[r.inst] ? instLocs[r.inst].size : 0;
    if (n < 2 || /online/i.test(r.soort || "")) return "";
    return `<span class="od-loc">${r.plaats ? "Deze open dag is in " + esc(r.plaats) + ". " : ""}Let op: deze school zit op ${n} locaties (${[...instLocs[r.inst]].slice(0, 6).map(esc).join(", ")}${n > 6 ? ", …" : ""}). Check vooraf waar jouw opleiding is.</span>`;
  }
  function renderOpenDagen() {
    const q = $("#odZoek").value.trim().toLowerCase();
    const rows = [];
    Object.keys(OD).forEach((inst) => komend(inst).forEach((d) => rows.push(Object.assign({ inst, site: OD[inst].site }, d))));
    rows.sort((a, b) => a.datum.localeCompare(b.datum) || a.inst.localeCompare(b.inst));
    rows.forEach((r) => {
      const p = instPlek[r.inst];
      const viaNaam = r.plaats && WP.find((w) => w.naam.toLowerCase() === String(r.plaats).toLowerCase());
      const loc = viaNaam || p;
      r.km = thuis && loc && !/online/i.test(r.soort || "") ? km(thuis, loc) : null;
    });
    const f = rows.filter((r) => (!q || (r.inst + " " + (r.plaats || "")).toLowerCase().includes(q)) &&
      (!odNiveau || (instNiv[r.inst] && instNiv[r.inst].has(odNiveau))) &&
      (!odSoort || (odSoort === "meeloop" ? /meeloop|proefstud/i.test(r.soort || "") : odSoort === "online" ? /online/i.test(r.soort || "") : odSoort === "dichtbij" ? r.km !== null && r.km <= 50 : !/online/i.test(r.soort || ""))));
    let h = "", maand = "";
    f.forEach((r) => {
      const m = fmt(r.datum, { month: "long", year: "numeric" });
      if (m !== maand) { if (maand) h += "</div>"; h += `<h3 class="od-maand">${m}</h3><div class="od-groep">`; maand = m; }
      const link = veiligeUrl(r.aanmelden) || veiligeUrl(r.site);
      h += `<div class="od-rij"><div class="od-datum"><b>${fmt(r.datum, { day: "numeric" })}</b><span>${fmt(r.datum, { weekday: "short" })}</span></div>` +
        `<div class="od-info"><strong>${esc(r.inst)}</strong>${locatieWaarschuwing(r)}<span>${esc(r.soort || "open dag")}${r.plaats ? " · " + esc(r.plaats) : ""}${r.km !== null ? " · " + afstandTekst(r.km) : ""}${r.tijd ? " · " + esc(r.tijd) : ""}${r.eind && r.eind !== r.datum ? " · t/m " + fmt(r.eind, { day: "numeric", month: "short" }) : ""}</span></div>` +
        `<div class="od-knoppen">` +
        (link ? `<a class="btn ghost od-link" href="${esc(link)}" target="_blank" rel="noopener">${veiligeUrl(r.aanmelden) ? "Aanmelden" : "Info"} ↗</a>` : "") +
        (!/online/i.test(r.soort || "") ? `<a class="od-route" href="${esc(routeLink(r))}" target="_blank" rel="noopener">Route ↗</a>` : "") +
        `</div></div>`;
    });
    if (maand) h += "</div>";
    $("#odLijst").innerHTML = h || (odNiveau === "mbo"
      ? '<p class="empty">Open dagen van het mbo staan er nog niet in. Kijk op de website van het mbo-college in je buurt, of vraag het je mentor of decaan.</p>'
      : '<p class="empty">Geen open dagen gevonden. Probeer een andere school of stad.</p>');
    const scholen = new Set(f.map((r) => r.inst)).size;
    $("#odAantal").textContent = `${f.length} ${f.length === 1 ? "datum" : "data"} bij ${scholen} ${scholen === 1 ? "school" : "scholen"}`;
  }
  $("#odZoek").addEventListener("input", renderOpenDagen);
  document.querySelectorAll("#odNiveau .chip").forEach((b) => b.addEventListener("click", () => {
    odNiveau = b.dataset.n;
    document.querySelectorAll("#odNiveau .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderOpenDagen();
  }));
  document.querySelectorAll("#odChips .chip").forEach((b) => b.addEventListener("click", () => {
    odSoort = b.dataset.s;
    document.querySelectorAll("#odChips .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderOpenDagen();
  }));

  /* ---------- Stappenplan ---------- */
  $("#routeLijst").innerHTML = ROUTE.map((r) => `<li><span class="r-wanneer">${esc(r[0])}</span><strong>${esc(r[1])}</strong><p>${vt(r[2])}</p></li>`).join("");

  /* ---------- Woonplaats-invoer ---------- */
  $("#odWoon").innerHTML = woonInput("woonOd");
  $("#woonLijst").innerHTML = WP.map((w) => `<option value="${esc(wpLabel(w))}"></option>`).join("");
  document.addEventListener("change", (e) => {
    if (e.target.matches && e.target.matches(".woon input")) zetThuis(e.target.value);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-oplnaam]");
    if (!b) return;
    const x = OPLEIDINGEN.find((y) => y.n === b.dataset.oplnaam);
    if (x) openOpleiding(x, FAMILIES.find((ff) => ff.id === x.f));
  });

  /* ---------- Gespreksgids ouders ---------- */
  $("#gesprekLijst").innerHTML = GESPREK.map((g) => `<div class="gk"><h4>${esc(g[0])}</h4><p>${vt(g[1])}</p><strong>Vraag bijvoorbeeld</strong><ul>${g[2].map((v) => `<li>${esc(v)}</li>`).join("")}</ul><strong>Liever niet</strong><ul class="niet">${g[3].map((v) => `<li>${esc(v)}</li>`).join("")}</ul></div>`).join("");
  $("#gesprekLastig").innerHTML = GESPREK_LASTIG.map((g) => `<div class="gk"><h4>${esc(g[0])}</h4><p>${vt(g[1])}</p></div>`).join("");

  $("#odTips").innerHTML = OPENDAG_TIPS.map((t) => `<div class="odtip"><h4>${esc(t[0])}</h4><ul>${t[1].map((p) => `<li>${vt(p)}</li>`).join("")}</ul></div>`).join("");

  /* ---------- Mijn stappenplan ---------- */
  // Alleen een waarde van de verwachte soort; kapotte of oude opslag geeft de standaardwaarde
  const soortVan = (v) => (Array.isArray(v) ? "array" : typeof v);
  const tekstLijst = (x) => Array.isArray(x) && x.every((s) => typeof s === "string");
  const antwoordVorm = (v) => soortVan(v.vals) === "object" && v.vals !== null && (v.kind == null || tekstLijst(v.kind));
  // Padvinder: ook ids die (na een update van de site) niet meer bestaan, gelden als kapot
  const VORM_CHECK = { padvinder: (v) => tekstLijst(v.top) && v.top.every((k) => Object.hasOwn(GEBIEDEN, k)) && tekstLijst(v.fams) && v.fams.every((f) => FAMILIES.some((x) => x.id === f)), antwoorden: antwoordVorm, uitslag_leerling: antwoordVorm, uitslag_ouder: antwoordVorm };
  function lees(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      if (v === null) return d;
      const soort = d !== null ? soortVan(d) : k === "hbo_waarom" ? "number" : "object";
      return soortVan(v) === soort && (!VORM_CHECK[k] || VORM_CHECK[k](v)) ? v : d;
    } catch (e) { return d; }
  }
  function bewaar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  let favorieten = lees("favorieten", []);
  let afgevinkt = lees("afgevinkt", {});
  let padvinder = lees("padvinder", null);
  // Bewaarde Padvinder-uitslag ook na herladen op de campus laten zien
  if (padvinder) highlightMap($("#kaartKaart"), padvinder.top);
  const isFav = (n) => favorieten.includes(n);
  const KLASSEN = [["", "Kies…", 0], ["vmbo3", "Vmbo 3", 1], ["vmbo4", "Vmbo 4", 0], ["havo4", "Havo 4", 1], ["havo5", "Havo 5", 0], ["vwo4", "Vwo 4", 2], ["vwo5", "Vwo 5", 1], ["vwo6", "Vwo 6", 0], ["mbo4", "Mbo 4, laatste jaar", 0], ["anders", "Iets anders of een tussenjaar", 0]];
  const nu = new Date();
  const basisJaar = nu.getFullYear() + (nu.getMonth() >= 7 ? 1 : 0);
  const datumTekst = (d) => d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  function startJaar() { const k = KLASSEN.find((x) => x[0] === lees("klas", "")); return basisJaar + (k ? k[2] : 0); }

  function favOpleidingen() { return favorieten.map((n) => OPLEIDINGEN.find((o) => o.n === n)).filter(Boolean); }

  // Open dagen bij de dichtstbijzijnde scholen van je lijst
  function openDagenVoorLijst() {
    const out = [];
    const gezien = new Set();
    favOpleidingen().forEach((o) => {
      const per = dichtsteBij(o.n);
      const scholen = thuis ? o.i.slice().sort((x, y) => ((per[x] || {}).d ?? 1e9) - ((per[y] || {}).d ?? 1e9)).slice(0, 3) : o.i.slice(0, 3);
      scholen.forEach((inst) => {
        const k = komend(inst).find((d) => !/online/i.test(d.soort || "")) || komend(inst)[0];
        if (!k || gezien.has(inst + k.datum)) return;
        gezien.add(inst + k.datum);
        out.push({ inst, opl: o.n, d: per[inst], dag: k, site: OD[inst] && OD[inst].site });
      });
    });
    return out.sort((x, y) => x.dag.datum.localeCompare(y.dag.datum));
  }

  function planStappen() {
    const sj = startJaar();
    const fav = favOpleidingen();
    const fams = [...new Set(fav.map((o) => o.f))];
    const selectie = fams.filter((f) => SELECTIE[f]);
    const verst = thuis && fav.length ? Math.max(...fav.map((o) => { const v = Object.values(dichtsteBij(o.n)).map((x) => x.d); return v.length ? Math.min(...v) : 0; })) : null;
    const od = openDagenVoorLijst();
    const klas = lees("klas", "");
    const mboRoute = klas.startsWith("vmbo") || (fav.length > 0 && fav.every((o) => o.l.length === 1 && o.l[0] === "mbo"));
    const st = [];
    st.push({ id: "padvinder", wanneer: "Nu", titel: "Ontdek wat bij je past", tekst: padvinder ? `Gedaan: je Padvinder wees op <strong>${esc(GEBIEDEN[padvinder.top[0]].naam)}</strong> en <strong>${esc(GEBIEDEN[padvinder.top[1]].naam)}</strong>.` : `Doe de Padvinder (± 5 minuten). <a href="#/test">Start de Padvinder →</a>`, klaar: !!padvinder });
    st.push({ id: "lijst", wanneer: "Nu", titel: "Zet 2 of 3 opleidingen op je lijst", tekst: fav.length ? `Op je lijst: ${fav.map((o) => `<strong>${esc(o.n)}</strong>`).join(", ")}.` : `Open een opleiding en klik op “+ Zet op mijn lijst”. <a href="#/opleidingen">Naar de opleidingen →</a>`, klaar: fav.length >= 2 });
    st.push({ id: "profiel", wanneer: "Nu", titel: "Check of je de juiste vooropleiding en het juiste profiel hebt", tekst: fav.length && profielIngevuld() ? `<ul class="plan-od pf-lijst">${fav.map((o) => `<li>${profielTeken(o, o.f) || ""} <strong>${esc(o.n)}</strong></li>`).join("")}</ul>Open een opleiding voor de details. <a href="#/profiel">Mijn profiel →</a>` : fams.length ? fams.map((f) => `<strong>${esc((FAMILIES.find((x) => x.id === f) || {}).naam || f)}</strong>: ${vt(FAM_EXTRA[f].profiel)}`).join("<br>") : "Dit vul je aan zodra er opleidingen op je lijst staan. Twijfel je? Vraag het je decaan." });
    st.push({ id: "opendag", wanneer: "Najaar en voorjaar", titel: "Ga naar open dagen", tekst: od.length ? `<ul class="plan-od">${od.slice(0, 8).map((x) => `<li><strong>${fmt(x.dag.datum, { weekday: "short", day: "numeric", month: "long" })}</strong>: ${esc(x.inst)}${x.d ? ` (${esc(x.d.pl)}, ${Math.round(x.d.d)} km)` : ""}, voor ${esc(x.opl)}${x.site ? ` · <a href="${esc(veiligeUrl(x.site))}" target="_blank" rel="noopener">info ↗</a>` : ""}</li>`).join("")}</ul>Bereid je voor met de tips bij <a href="#/opendagen">Open dagen</a>.` : `Zet opleidingen op je lijst en vul je woonplaats in, dan zie je hier de open dagen dichtbij. Of bekijk alle <a href="#/opendagen">open dagen</a>.` });
    st.push({ id: "meeloop", wanneer: "Vóór je je aanmeldt", titel: "Loop een dag mee", tekst: "Een open dag laat de mooie kant zien. Op een meeloopdag zit je een dag echt in de lessen en praat je met studenten. Doe het bij je top 2 of 3, liefst samen met iemand, zodat je achteraf kunt napraten. Vraag je mentor om vrij: dat mag bijna altijd." + (fav.length ? `<br>${fav.slice(0, 3).map((o) => `<a href="${esc("https://duckduckgo.com/?q=" + encodeURIComponent("meeloopdag " + o.n))}" target="_blank" rel="noopener">Meeloopdag ${esc(o.n)} ↗</a>`).join(" · ")}` : "") + ` <a href="#/opendagen">Zo regel je het →</a>` });
    if (selectie.length && !mboRoute) st.push({ id: "fixus", wanneer: `Vóór 15 januari ${sj}`, titel: "Aanmelden voor opleidingen met selectie of loting", tekst: selectie.map((f) => `<strong>${esc(FAMILIES.find((x) => x.id === f).naam)}</strong>: ${esc(SELECTIE[f])}`).join("<br>") + "<br>Check bij de opleiding de precieze datum en wat je moet inleveren.", datum: new Date(sj, 0, 15) });
    st.push({ id: "digid", wanneer: "Ruim op tijd", titel: "Vraag een DigiD aan", tekst: mboRoute ? "Die heb je nodig voor DUO, bijvoorbeeld voor je studentenreisproduct. Aanvragen kost een paar dagen, want je krijgt een brief met een code." : "Die heb je nodig voor Studielink en DUO. Aanvragen kost een paar dagen, want je krijgt een brief met een code." });
    if (mboRoute) st.push({ id: "leerwerk", wanneer: "Vóór je je aanmeldt", titel: "Kies: vooral leren (bol) of vooral werken (bbl)?", tekst: "Veel mbo-opleidingen kun je op twee manieren volgen, met hetzelfde diploma. Bij bol ga je vooral naar school, bij bbl werk je bij een leerbedrijf en ga je één dag naar school. Kies je bbl? Zoek dan op tijd een leerbedrijf: dat doe je meestal zelf, bijvoorbeeld via <a href='https://leerbanenmarkt.nl' target='_blank' rel='noopener'>leerbanenmarkt.nl</a> of <a href='https://www.stagemarkt.nl' target='_blank' rel='noopener'>stagemarkt.nl</a>. <a href='#leerwerk'>Wat past bij jou? →</a>" });
    if (mboRoute) st.push({ id: "aanmelden", wanneer: `Vóór 1 april ${sj}`, titel: "Aanmelding: bij de mbo-school", tekst: "Je meldt je aan via de website van de mbo-school zelf, niet via Studielink. Doe je dat vóór 1 april, dan heb je toelatingsrecht: de school moet je dan toelaten als je aan de vooropleidingseisen voldoet. Je mag je bij meer opleidingen aanmelden. Bewaar de bevestiging: je mentor of decaan vraagt soms om een kopie. Opleidingen vergelijken kan ook op <a href='https://www.kiesmbo.nl/home' target='_blank' rel='noopener'>kiesmbo.nl</a>.", datum: new Date(sj, 3, 1) });
    else st.push({ id: "aanmelden", wanneer: `Vóór 1 mei ${sj}`, titel: "Aanmelding: via Studielink", tekst: "Dan heb je recht op een studiekeuzecheck en word je in principe toegelaten als je aan de eisen voldoet. Je mag je voor meer opleidingen aanmelden.", datum: new Date(sj, 4, 1) });
    if (!mboRoute) st.push({ id: "toelating", wanneer: `Voorjaar ${sj}`, titel: "Toelating: word je toegelaten?", tekst: (selectie.length ? `Voor je lijst geldt: ${selectie.map((f) => `<strong>${esc(FAMILIES.find((x) => x.id === f).naam)}</strong>: ${esc(SELECTIE[f])}`).join(" ")}<br>` : "Voor de opleidingen op je lijst geldt meestal: juiste vooropleiding en op tijd aangemeld, dan mag je beginnen.<br>") + `Andere vormen: loting, portfolio, auditie, aanvullende eisen. <a href="#toelating">Lees wat die betekenen →</a>` });
    st.push({ id: "planb", wanneer: mboRoute ? `Vóór 1 april ${sj}` : `Vóór 1 mei ${sj}`, titel: "Zet een Plan B klaar", tekst: (selectie.length && !mboRoute ? `Voor ${selectie.map((f) => `<strong>${esc(FAMILIES.find((x) => x.id === f).naam)}</strong>`).join(" en ")} is er vaak selectie of loting. Zet ook een opleiding zonder selectie op je lijst en meld je daar ook voor aan.` : "Meld je voor meer dan één opleiding aan, dan heb je altijd iets achter de hand.") + ` <a href="#planb">Wat als je niet wordt aangenomen? →</a>` });
    if (mboRoute) st.push({ id: "check", wanneer: `Voorjaar ${sj}`, titel: "Toelating: het intakegesprek", tekst: "Na je aanmelding nodigt de school je uit voor een intake: een gesprek over wie je bent, wat je wilt en wat je nodig hebt. Soms hoort er een opdracht of test bij. Het is geen examen. Voor sommige opleidingen gelden extra eisen, zoals een sporttest of een medische keuring." });
    else st.push({ id: "check", wanneer: `Mei – juni ${sj}`, titel: "Doe de studiekeuzecheck", tekst: "Een opdracht, vragenlijst of gesprek. Het is een advies, geen examen." });
    if (mboRoute) st.push({ id: "duo", wanneer: `Zomer ${sj}`, titel: "Geld en reizen regelen", tekst: "Ben je jonger dan 18, dan vraag je bij DUO een studentenreisproduct aan voor het ov. Vanaf je 18e kun je studiefinanciering krijgen en betaal je lesgeld (bij bol). Verdienen je ouders weinig? Dan kun je vaak een aanvullende beurs krijgen. <a href='#geld'>Wie betaalt wat? →</a>" });
    else st.push({ id: "duo", wanneer: `Vóór 1 juni ${sj}`, titel: "Geld regelen bij DUO", tekst: "Vraag minstens drie maanden voor de start studiefinanciering aan bij DUO. Verdienen je ouders weinig of hebben ze geen inkomen? Dan kun je vaak een aanvullende beurs krijgen. Je studentenreisproduct vraag je ook bij DUO aan. <a href='#geld'>Wie betaalt wat? →</a>", datum: new Date(sj, 5, 1) });
    if (mboRoute) st.push({ id: "inschrijving", wanneer: `Voor de start ${sj}`, titel: "Inschrijving: de onderwijsovereenkomst", tekst: "Ben je toegelaten, dan teken je een onderwijsovereenkomst met de school (ben je jonger dan 18, dan tekent ook je ouder of verzorger). Bij bbl heb je ook een leerbaan nodig. Die zoek je meestal zelf, bijvoorbeeld via <a href='https://leerbanenmarkt.nl' target='_blank' rel='noopener'>leerbanenmarkt.nl</a>." });
    else st.push({ id: "inschrijving", wanneer: `Vóór 31 augustus ${sj}`, titel: "Inschrijving: maak het definitief", tekst: "Ben je toegelaten, dan schrijf je je definitief in via Studielink en regel je de betaling van het collegegeld (meestal met een machtiging). Pas dan sta je echt ingeschreven.", datum: new Date(sj, 7, 31) });
    if (verst !== null && verst > 60) {
      st.push({ id: "wonen", wanneer: `Voorjaar en zomer ${sj}`, titel: "Kamer zoeken en regelen", tekst: `Een opleiding op je lijst is ongeveer ${Math.round(verst)} km van huis; dan gaan de meeste studenten op kamers.<ul class="plan-od">${KAMER_CHECKLIST.map((k) => `<li><strong>${esc(k[0])}:</strong> ${vt(k[1])}</li>`).join("")}</ul>Liever niet verhuizen? Kijk bij de opleiding naar <strong>alternatieven dichterbij</strong>.` });
    } else {
      st.push({ id: "wonen", wanneer: `Zomer ${sj}`, titel: "Reizen met het ov", tekst: verst !== null ? `De opleidingen op je lijst zijn vanuit huis te doen (tot ± ${Math.round(verst)} km, ± ${reistijd(verst)} min). Vraag je studentenreisproduct aan bij DUO en maak de reis een keer op een gewone schooldag.` : "Vul je woonplaats in, dan kijkt de site of reizen met het ov of op kamers gaan het handigst is." });
    }
    if (lees("optie_buitenland", false)) st.push({ id: "buitenland", wanneer: `Uiterlijk winter ${sj - 1}`, titel: "Studeren in het buitenland voorbereiden", tekst: vt(OPTIES[0][1]) });
    if (lees("optie_tussenjaar", false)) st.push({ id: "tussenjaar", wanneer: "Voor je eindexamen", titel: "Tussenjaar plannen", tekst: vt(OPTIES[1][1]) });
    if (lees("optie_defensie", false)) st.push({ id: "defensie", wanneer: `Uiterlijk najaar ${sj - 1}`, titel: "Solliciteren bij Defensie", tekst: vt(OPTIES[2][1]) + " Begin dus ruim een half jaar voor je wilt starten, en meld je voor de zekerheid ook bij een gewone opleiding aan." });
    if (lees("optie_politie", false)) st.push({ id: "politie", wanneer: `Uiterlijk najaar ${sj - 1}`, titel: "Solliciteren bij de politie", tekst: vt(OPTIES[3][1]) + " Begin dus ruim een half jaar voor je wilt starten, en meld je voor de zekerheid ook bij een gewone opleiding aan." });
    st.push({ id: "zorg", wanneer: "Zodra je 18 wordt", titel: "Zorgverzekering en zorgtoeslag", tekst: "Vanaf je 18e moet je zelf een zorgverzekering hebben. Met een laag inkomen kun je zorgtoeslag krijgen." });
    st.push({ id: "start", wanneer: `September ${sj}`, titel: "Je eerste studiedag", tekst: "De introductieweek helpt je je weg te vinden. Vragen? Elke opleiding heeft studieadviseurs bij wie je terechtkunt.", datum: new Date(sj, 8, 1) });
    return st;
  }

  function renderPlan() {
    setTimeout(renderBewaard);
    const sel = $("#planKlas");
    if (!sel.options.length) sel.innerHTML = KLASSEN.map((k) => `<option value="${k[0]}">${esc(k[1])}</option>`).join("");
    sel.value = lees("klas", "");
    $("#planWoon").innerHTML = woonInput("woonPlan");
    const fav = favOpleidingen();
    $("#planLijst").innerHTML = `<h3>Mijn lijst</h3>` + (fav.length
      ? `<div class="mini">${fav.map((o) => `<span class="favitem"><button type="button" data-oplnaam="${esc(o.n)}">${esc(o.n)}</button><button type="button" class="favweg" data-fav="${esc(o.n)}" aria-label="Haal ${esc(o.n)} van je lijst">✕</button></span>`).join("")}</div>`
      : `<p class="count">Nog leeg. Open een opleiding en klik op “+ Zet op mijn lijst”.${padvinder ? " Tip: begin bij de groepen uit je Padvinder: " + (padvinder.fams || []).map((f) => `<button type="button" class="linkbtn" data-fam="${f}">${esc((FAMILIES.find((x) => x.id === f) || {}).naam || f)}</button>`).join(", ") : ""}</p>`);
    $("#planLijst").querySelectorAll("[data-fam]").forEach((b) => b.addEventListener("click", () => openFamily(b.dataset.fam)));
    renderProfielLijst();
    $("#planStappen").innerHTML = planStappen().map((x) => {
      const af = x.klaar || afgevinkt[x.id];
      return `<li class="${af ? "af" : ""}"><span class="r-wanneer">${esc(x.wanneer)}</span><label class="vink"><input type="checkbox" data-stap="${x.id}" ${af ? "checked" : ""} ${x.klaar ? "disabled" : ""}><strong>${esc(x.titel)}</strong></label><p>${x.tekst}</p></li>`;
    }).join("");
  }

  $("#planKlas").addEventListener("change", (e) => { bewaar("klas", e.target.value); renderPlan(); });
  [["optBuitenland", "optie_buitenland"], ["optTussenjaar", "optie_tussenjaar"], ["optDefensie", "optie_defensie"], ["optPolitie", "optie_politie"]].forEach(([id, k]) => {
    $("#" + id).checked = lees(k, false);
    $("#" + id).addEventListener("change", (e) => { bewaar(k, e.target.checked); renderPlan(); });
  });
  document.addEventListener("change", (e) => {
    const c = e.target.closest && e.target.closest("[data-stap]");
    if (!c) return;
    afgevinkt[c.dataset.stap] = c.checked;
    bewaar("afgevinkt", afgevinkt);
    c.closest("li").classList.toggle("af", c.checked);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-fav]");
    if (!b) return;
    const n = b.dataset.fav;
    favorieten = isFav(n) ? favorieten.filter((x) => x !== n) : favorieten.concat(n);
    bewaar("favorieten", favorieten);
    if (huidigeOpl && $("#detail").open && huidigeOpl[0].n === n) openOpleiding(huidigeOpl[0], huidigeOpl[1]);
    renderPlan();
  });
  $("#planHulp").innerHTML = [
    ["Je decaan of mentor", "Helpen bij studiekeuze is hun werk, en het kost je niets. Vraag om een gesprek; neem je Padvinder-uitslag en je lijst mee."],
    ["Studenten zelf", "Op open dagen en meeloopdagen lopen studenten rond om je vragen te beantwoorden. Vraag wat ze vooraf hadden willen weten."],
    ["De opleiding", "Elke opleiding heeft voorlichters of studieadviseurs die je mag mailen of bellen, ook over toelating en geld."],
    ["DUO", "Voor studiefinanciering, aanvullende beurs en je studentenreisproduct. Twijfel je over geld? Bel of mail hen; je hoeft het niet alleen uit te zoeken."],
    ["Iemand die je vertrouwt", "Een oom of tante, trainer, buurvrouw of oudere vriend die gestudeerd heeft. Laat diegene de Padvinder ook over jou invullen."]
  ].map((h) => `<div class="gk licht"><h4>${esc(h[0])}</h4><p>${vt(h[1])}</p></div>`).join("");
  $("#planPrint").addEventListener("click", () => { document.body.classList.add("print-plan"); window.print(); setTimeout(() => document.body.classList.remove("print-plan"), 500); });
  $("#planAgenda").addEventListener("click", () => {
    const d8 = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const ev = [];
    planStappen().filter((x) => x.datum).forEach((x) => ev.push([d8(x.datum), x.titel]));
    openDagenVoorLijst().forEach((x) => ev.push([x.dag.datum.replace(/-/g, ""), `${x.dag.soort || "Open dag"} ${x.inst}`]));
    const regels = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wat studeer je eigenlijk//NL"];
    ev.forEach(([d, t], i) => regels.push("BEGIN:VEVENT", `UID:wsje-${i}-${d}@watstudeerje`, `DTSTAMP:${d8(new Date())}T000000Z`, `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${t.replace(/[,;]/g, " ")}`, "END:VEVENT"));
    regels.push("END:VCALENDAR");
    const url = URL.createObjectURL(new Blob([regels.join("\r\n")], { type: "text/calendar" }));
    const l = document.createElement("a");
    l.href = url;
    l.download = "mijn-stappenplan.ics";
    l.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- Toelating, geld, kamers, opties ---------- */
  const kaartjes = (lijst) => lijst.map((x) => `<div class="gk licht"><h4>${esc(x[0])}</h4><p>${vt(x[1])}</p></div>`).join("");
  $("#toelatingLijst").innerHTML = kaartjes(TOELATING);
  $("#geldLijst").innerHTML = kaartjes(GELD);
  $("#optiesLijst").innerHTML = kaartjes(OPTIES);
  $("#eerlijkLijst").innerHTML = KANTTEKENINGEN.map((k) => `<div class="gk licht"><h4>${esc(k[0])}</h4><p>${vt(k[1])}</p><ul>${k[2].map((p) => `<li>${vt(p)}</li>`).join("")}</ul></div>`).join("");
  $("#kamerLijst").innerHTML = KAMER_CHECKLIST.map((k) => `<li><span class="r-wanneer">${esc(k[0])}</span><p>${vt(k[1])}</p></li>`).join("");

  /* ---------- Koelkastversie: doorstroomschema op één A4 ---------- */
  function koelkastHtml() {
    const sj = startJaar();
    const fav = favOpleidingen();
    const metSelectie = fav.some((o) => SELECTIE[o.f]);
    const vak = (t) => `<span class="kk-vak"></span>${t}`;
    const stap = (titel, wanneer, extra) => `<div class="kk-stap"><strong>${titel}</strong><span>${wanneer}</span>${extra ? `<em>${extra}</em>` : ""}<i class="kk-vink"></i></div>`;
    const pijl = `<div class="kk-pijl">→</div>`;
    const rijen = fav.map((o) => {
      const per = dichtsteBij(o.n);
      const scholen = thuis ? o.i.slice().sort((x, y) => ((per[x] || {}).d ?? 1e9) - ((per[y] || {}).d ?? 1e9)) : o.i;
      const inst = scholen[0];
      const p = per[inst];
      const od = komend(inst).find((d) => !/online/i.test(d.soort || "")) || komend(inst)[0];
      const sel = SELECTIE[o.f];
      return `<tr><td>${vak("")}<strong>${esc(o.n)}</strong></td><td>${esc(inst || "")}${p ? `<br><small>${esc(p.pl)}, ${Math.round(p.d)} km</small>` : ""}</td><td>${od ? fmt(od.datum, { weekday: "short", day: "numeric", month: "short" }) : "zie site school"}</td><td>${sel ? esc(sel) : "Juiste vooropleiding is genoeg"}</td><td><strong>${sel ? "15 jan " + sj : "1 mei " + sj}</strong></td></tr>`;
    }).join("");
    return `<div class="kk-kop"><div><h1>Mijn route naar september ${sj}</h1><p>Naam: ______________________ &nbsp; Klas: ${esc((KLASSEN.find((k) => k[0] === lees("klas", "")) || ["", "______"])[1])}</p></div><div class="kk-merk">Wat studeer je eigenlijk?</div></div>` +
      `<div class="kk-flow">` +
      stap("1. Ontdekken", "nu", "Padvinder, mijn lijst") + pijl +
      stap("2. Open dagen", "najaar en voorjaar", "kijk, vraag, vergelijk") + pijl +
      stap("3. Aanmelding", metSelectie ? `vóór 15 jan (selectie)<br>vóór 1 mei ${sj}` : `vóór 1 mei ${sj}`, "via Studielink, met DigiD") + pijl +
      stap("4. Toelating", `voorjaar ${sj}`, "studiekeuzecheck, evt. selectie") + pijl +
      stap("5. Inschrijving", `vóór 31 aug ${sj}`, "collegegeld regelen") + pijl +
      stap("6. Start", `september ${sj}`, "introductieweek") +
      `</div>` +
      `<h2>Mijn opleidingen</h2>` +
      (rijen ? `<table class="kk-tabel"><thead><tr><th>Opleiding</th><th>School (dichtstbij)</th><th>Open dag</th><th>Toelating</th><th>Aanmelden vóór</th></tr></thead><tbody>${rijen}</tbody></table>` : `<p class="kk-leeg">Nog geen opleidingen op je lijst. Zet er 2 of 3 op je lijst en print opnieuw.<br><br>1. ______________________ &nbsp; 2. ______________________ &nbsp; 3. ______________________</p>`) +
      `<div class="kk-onder"><div><h2>Niet vergeten</h2><ul>` +
      [`DigiD aanvragen`, `Studiefinanciering bij DUO, vóór 1 juni ${sj}`, `Studentenreisproduct bij DUO`, `Reizen of een kamer zoeken`, `Zorgverzekering vanaf je 18e`].map((t) => `<li>${vak(t)}</li>`).join("") +
      `</ul></div><div><h2>Hulp nodig?</h2><p>Je decaan of mentor, studenten op open dagen, de studieadviseur van de opleiding en DUO helpen je graag. Je hoeft het niet alleen te doen.</p><p class="kk-url">${esc(location.origin + location.pathname)}</p></div></div>`;
  }
  $("#planKoelkast").addEventListener("click", () => {
    $("#koelkast").innerHTML = koelkastHtml();
    const st = document.createElement("style");
    st.id = "kkPagina";
    st.textContent = "@page{size:A4 landscape;margin:12mm}";
    document.head.appendChild(st);
    document.body.classList.add("print-koelkast");
    window.print();
    setTimeout(() => { document.body.classList.remove("print-koelkast"); st.remove(); }, 800);
  });

  /* ---------- Droombanen ---------- */
  const famNm = (f) => esc((FAMILIES.find((x) => x.id === f) || {}).naam || f);
  $("#droomLijst").innerHTML = DROOM.map((d, i) => `<button type="button" class="droom" data-droom="${i}"><small>Later word ik de nieuwe</small><strong>${esc(d[0])}</strong><span>${esc(d[1])}</span><em>Wat heb je nodig? →</em></button>`).join("");
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-droom]");
    if (!b) return;
    const d = DROOM[Number(b.dataset.droom)];
    huidigeOpl = null;
    $("#detailInhoud").innerHTML = `<div class="badges"><span class="badge gebied">Droombaan · knipoog</span></div><h2 id="dTitel">De nieuwe ${esc(d[0])}</h2><p class="eng">${esc(d[1])}</p>` +
      `<p class="praat">${vt(d[2])}</p>` +
      `<h3>Wat heb je ervoor nodig?</h3><p>${vt(d[3])}</p>` +
      `<h3>Nog meer banen in dit vak</h3><ul class="banen">${d[4].map(([baan, niv]) => `<li><strong>${vt(baan)}</strong> <span class="badge">${esc(niv)}</span></li>`).join("")}</ul>` +
      `<h3>Opleidingen bekijken</h3><div class="mini">${d[5].map((f) => `<button type="button" data-famopen="${f}">${famNm(f)}</button>`).join("")}</div>`;
    $("#detail").showModal();
  });

  /* ---------- Mensen vinden mij te … ---------- */
  $("#teChips").innerHTML = TE.map((t, i) => `<button type="button" class="chip" data-te="${i}" aria-pressed="false">te ${esc(t[0])}</button>`).join("");
  $("#teChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-te]");
    if (!b) return;
    const t = TE[Number(b.dataset.te)];
    bewaar("te", Number(b.dataset.te));
    document.querySelectorAll("#teChips .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const k = $("#teKaart");
    k.innerHTML = `<p class="te-kop"><span class="te-oud">Te ${esc(t[0])}?</span> <span class="te-nieuw">Nee: ${esc(t[1])}.</span></p><p>${vt(t[2])}</p><p><strong>Hier is het een kracht:</strong></p><div class="mini">${t[3].map((f) => `<button type="button" data-famopen="${f}">${famNm(f)}</button>`).join("")}</div>`;
    k.hidden = false;
  });

  if (TE[lees("te", -1)]) $(`#teChips [data-te="${lees("te", -1)}"]`).click();

  /* ---------- Bewaard op dit apparaat ---------- */
  const BEWAAR_SLEUTELS = ["woonplaats", "klas", "favorieten", "afgevinkt", "padvinder", "antwoorden", "optie_buitenland", "optie_tussenjaar", "optie_defensie", "optie_politie", "te", "vak", "profiel", "uitslag_leerling", "uitslag_ouder", "thema", "hbo_waarom"];
  function renderBewaard() {
    let wp = "";
    try { wp = localStorage.getItem("woonplaats") || ""; } catch (e) {}
    const klas = (KLASSEN.find((k) => k[0] && k[0] === lees("klas", "")) || [])[1];
    const ant = lees("antwoorden", null);
    const gedaan = ant ? Object.keys(ant.vals || {}).length : 0;
    const vinkjes = Object.values(lees("afgevinkt", {})).filter(Boolean).length;
    const te = TE[lees("te", -1)];
    const rij = (k, v) => `<li><span>${k}</span><strong>${v}</strong></li>`;
    $("#bewaardLijst").innerHTML =
      rij("Padvinder", padvinder ? `af, op ${esc(new Date(padvinder.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long" }))}` : gedaan ? `half af (${gedaan} vragen)` : "nog niet gedaan") +
      rij("Mijn lijst", `${favorieten.length} ${favorieten.length === 1 ? "opleiding" : "opleidingen"}`) +
      rij("Stappen afgevinkt", String(vinkjes)) +
      rij("Woonplaats", wp ? esc(wp) : "niet ingevuld") +
      rij("Klas", klas ? esc(klas) : "niet ingevuld") +
      rij("Profiel", profielIngevuld() ? "ingevuld" : "niet ingevuld") +
      (te ? rij("Mensen vinden mij te…", esc(te[0]) + " (" + esc(te[1]) + ")") : "");
  }
  $("#bewaarBestand").addEventListener("click", () => {
    const data = {};
    try { BEWAAR_SLEUTELS.forEach((k) => { const v = localStorage.getItem(k); if (v !== null) data[k] = v; }); } catch (e) {}
    const blob = new Blob([JSON.stringify({ app: "watstudeerje", versie: 1, datum: new Date().toISOString().slice(0, 10), data }, null, 1)], { type: "application/json" });
    const link = el("a", { href: URL.createObjectURL(blob), download: "wat-studeer-je-eigenlijk.json" });
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  $("#bewaarTerug").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (j.app !== "watstudeerje" || !j.data) throw new Error();
      BEWAAR_SLEUTELS.forEach((k) => (typeof j.data[k] === "string" ? localStorage.setItem(k, j.data[k]) : localStorage.removeItem(k)));
      location.reload();
    } catch (err) {
      alert("Dit bestand kan ik niet lezen. Kies het bestand dat je eerder op deze site hebt bewaard.");
    }
    e.target.value = "";
  });
  $("#bewaarWis").addEventListener("click", () => {
    if (!confirm("Alles wissen wat op dit apparaat is bewaard? Je lijst, je Padvinder en je plan zijn dan weg.")) return;
    try { BEWAAR_SLEUTELS.forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    location.reload();
  });

  /* ---------- Mijn profiel (anoniem, alleen op dit apparaat) ---------- */
  const LEERWEGEN = [["bb", "Basis (bb)"], ["kb", "Kader (kb)"], ["gl", "Gemengd (gl)"], ["tl", "Theoretisch (tl)"]];
  const PROFIELEN_HV = [["NT", "Natuur & Techniek"], ["NG", "Natuur & Gezondheid"], ["EM", "Economie & Maatschappij"], ["CM", "Cultuur & Maatschappij"]];
  const PROFIELEN_VMBO = ["Bouwen, wonen en interieur", "Produceren, installeren en energie", "Mobiliteit en transport", "Maritiem en techniek", "Media, vormgeving en ICT", "Zorg en welzijn", "Economie en ondernemen", "Horeca, bakkerij en recreatie", "Dienstverlening en producten", "Groen"];
  const VAKKEN_HV = ["Wiskunde A", "Wiskunde B", "Wiskunde C", "Wiskunde D", "Natuurkunde", "Scheikunde", "Biologie", "NLT", "Informatica", "Economie", "Bedrijfseconomie", "Aardrijkskunde", "Geschiedenis", "Maatschappijwetenschappen", "Filosofie", "Duits", "Frans", "Spaans", "Latijn", "Grieks", "Kunst", "Muziek", "Tekenen", "Beeldende vorming", "Handvaardigheid", "BSM"];
  const VAKKEN_VMBO = ["Wiskunde", "Nask1 (natuurkunde)", "Nask2 (scheikunde)", "Biologie", "Economie", "Aardrijkskunde", "Geschiedenis", "Maatschappijkunde", "Duits", "Frans", "Spaans", "Kunstvakken", "Beeldende vorming", "Lichamelijke opvoeding"];
  // Praktijkvakken (beroepsgerichte keuzevakken) op het vmbo, ook buiten je eigen profiel
  const PRAKTIJK_VMBO = ["Techniek en installeren", "Bouwen en hout", "Voertuigen en mobiliteit", "Zorg en welzijn", "Kinderen en sport", "Economie en ondernemen", "Horeca, koken en bakken", "Media, vormgeving en ICT", "Groen en dieren", "Dienstverlening en veiligheid"];
  // Vakken die bij een profiel altijd horen (havo en vwo)
  const PROFIEL_VAKKEN = { NT: ["Wiskunde B", "Natuurkunde", "Scheikunde"], NG: ["Biologie", "Scheikunde"], EM: ["Economie", "Geschiedenis"], CM: ["Geschiedenis"] };
  // Per groep: welk profiel past, welke vakken vaak gevraagd worden (één van), en wat het wo extra vraagt. Indicatie, geen eis.
  const PROF_EIS = {
    gedrag: { een: ["Wiskunde A", "Wiskunde B"] },
    economie: { een: ["Wiskunde A", "Wiskunde B"], helpt: ["Economie"], wo: ["Wiskunde B"] },
    management: { helpt: ["Economie", "Wiskunde A"] },
    marketing: { helpt: ["Economie"] },
    natuur: { prof: ["NT", "NG"], wo: ["Wiskunde B", "Scheikunde"] },
    ict: { een: ["Wiskunde A", "Wiskunde B", "Wiskunde C"], wo: ["Wiskunde B"] },
    techniek: { prof: ["NT", "NG"], wo: ["Wiskunde B", "Natuurkunde"] },
    bouw: { prof: ["NT", "NG"], wo: ["Wiskunde B"] },
    groen: { prof: ["NT", "NG"] },
    zorg: { prof: ["NG", "NT"], wo: ["Scheikunde", "Biologie"] },
    therapie: { prof: ["NG", "NT"] },
  };
  let profiel = lees("profiel", {});
  const schoolSoort = () => { const k = lees("klas", ""); return k.startsWith("vmbo") ? "vmbo" : k.startsWith("havo") ? "havo" : k.startsWith("vwo") ? "vwo" : k.startsWith("mbo") ? "mbo" : k; };
  const profKort = (p) => (PROFIELEN_HV.find((x) => x[0] === p) || [p, p])[1];
  function bewaarProfiel() { bewaar("profiel", profiel); renderProfielSamen(); renderPlan(); renderList(); }
  // Klein vinkje of kruisje in de lijst met opleidingen, alleen als je profiel is ingevuld
  function profielTeken(o, famId) {
    if (!profielIngevuld()) return "";
    const c = profielCheck(o, famId, true);
    return c === "goed" ? `<span class="pf-ok" title="Past bij je profiel en vakken" aria-label="past bij je profiel">✓</span>` : c === "let" ? `<span class="pf-nee" title="Er ontbreekt iets in je profiel of vakken" aria-label="er ontbreekt iets">✗</span>` : "";
  }
  function profielIngevuld() { return !!(lees("klas", "") && ((profiel.prof || []).length || (profiel.vakken || []).length || profiel.leerweg || profiel.richting)); }

  function chipGroep(naam, label, opties, gekozen, extra = "") {
    return `<fieldset class="pf-groep"><legend>${label}</legend>${extra}<div class="chips">${opties.map(([w, t]) => `<button type="button" class="chip" data-pf="${naam}" data-w="${esc(w)}" aria-pressed="${gekozen.includes(w)}">${esc(t)}</button>`).join("")}</div></fieldset>`;
  }
  function renderProfiel() {
    const klas = lees("klas", "");
    const s = schoolSoort();
    let h = chipGroep("klas", "Ik zit nu in", KLASSEN.filter((k) => k[0]), [klas]);
    if (s === "vmbo") {
      h += chipGroep("leerweg", "Mijn leerweg", LEERWEGEN, [profiel.leerweg || ""]);
      h += chipGroep("vmboprof", "Mijn profiel", PROFIELEN_VMBO.map((p) => [p, p]), [profiel.richting || ""], `<p class="pf-hint">Zit je in de theoretische leerweg zonder profiel? Sla dit dan over.</p>`);
    }
    if (s === "havo" || s === "vwo") h += chipGroep("prof", "Mijn profiel", PROFIELEN_HV, profiel.prof || [], `<p class="pf-hint">Een combinatieprofiel, zoals N&amp;T met N&amp;G? Kies ze allebei.</p>`);
    if (s === "mbo") h += `<fieldset class="pf-groep"><legend>Mijn opleiding gaat over</legend><select id="pfRichting"><option value="">Kies…</option>${FAMILIES.map((f) => `<option value="${f.id}" ${profiel.richting === f.id ? "selected" : ""}>${esc(f.naam)}</option>`).join("")}</select></fieldset>`;
    const vakLijst = s === "vmbo" ? VAKKEN_VMBO : s === "havo" ? VAKKEN_HV.filter((v) => !["Wiskunde C", "Latijn", "Grieks"].includes(v)) : s === "vwo" ? VAKKEN_HV : [];
    if (s === "vmbo" && profiel.leerweg !== "tl") h += chipGroep("vak", "Mijn praktijkvakken", PRAKTIJK_VMBO.map((v) => [v, v]), profiel.vakken || [], `<p class="pf-hint">De beroepsgerichte vakken waarin je praktisch werkt. Ook keuzevakken buiten je eigen profiel tellen mee.</p>`);
    if (vakLijst.length) h += chipGroep("vak", "Mijn vakken", vakLijst.map((v) => [v, v]), profiel.vakken || [], `<p class="pf-hint">Nederlands en Engels heb je altijd. Klik de vakken aan die verder in je pakket zitten${s !== "vmbo" ? "; bij je profiel zetten we de vaste vakken alvast aan" : ""}.</p>`);
    h += `<fieldset class="pf-groep"><legend>Mijn lievelingsvak</legend><select id="pfLiefst"><option value="">Kies…</option>${VAKKEN.map((v, i) => `<option value="${i}" ${profiel.liefst && lees("vak", -1) === i ? "selected" : ""}>${esc(v[0])}</option>`).join("")}</select> <a href="#vakken">Wat zegt dat over jou? →</a></fieldset>`;
    h += `<fieldset class="pf-groep"><legend>Waar woon je?</legend>${woonInput("woonProfiel").replace("<span>Waar woon je?</span>", "")}<p class="pf-hint">Alleen je woonplaats, voor de afstand naar scholen. Geen adres.</p></fieldset>`;
    $("#profielForm").innerHTML = h;
    renderProfielSamen();
    renderProfielLijst();
  }
  // Alle opleidingen op je lijst, met een vinkje of kruisje als je profiel is ingevuld
  function renderProfielLijst() {
    const fav = favOpleidingen();
    $("#profielLijst").innerHTML = `<h3>Mijn opgeslagen opleidingen</h3>` + (fav.length
      ? `<ul class="pf-lijst">${fav.map((o) => `<li>${profielTeken(o, o.f)}<span class="favitem"><button type="button" data-oplnaam="${esc(o.n)}">${esc(o.n)}</button><button type="button" class="favweg" data-fav="${esc(o.n)}" aria-label="Haal ${esc(o.n)} van je lijst">✕</button></span>${profielIngevuld() ? `<span class="pf-reden">${esc(profielReden(o))}</span>` : ""}</li>`).join("")}</ul>`
      : `<p class="count">Nog leeg. Open een opleiding en klik op “+ Zet op mijn lijst”. <a href="#/opleidingen">Naar de opleidingen →</a></p>`);
  }
  function renderProfielSamen() {
    const s = schoolSoort();
    const klas = (KLASSEN.find((k) => k[0] && k[0] === lees("klas", "")) || [])[1];
    if (!klas) { $("#profielSamen").innerHTML = `<p class="count">Kies eerst waar je nu in zit.</p>`; return; }
    const delen = [esc(klas)];
    if (profiel.leerweg && s === "vmbo") delen.push(esc((LEERWEGEN.find((l) => l[0] === profiel.leerweg) || [])[1] || ""));
    if ((profiel.prof || []).length && (s === "havo" || s === "vwo")) delen.push(profiel.prof.map(profKort).map(esc).join(" + "));
    if (profiel.richting && s === "vmbo") delen.push(esc(profiel.richting));
    if (profiel.richting && s === "mbo") delen.push(esc((FAMILIES.find((f) => f.id === profiel.richting) || {}).naam || ""));
    let wat = "";
    if (s === "vmbo") wat = profiel.leerweg === "bb" ? "Met de basisberoepsgerichte leerweg kun je naar mbo niveau 2. Daarna kun je doorstromen naar niveau 3 en 4." : profiel.leerweg ? "Met deze leerweg kun je naar mbo niveau 3 of 4. Met gl of tl kun je ook naar de havo (vraag naar de eisen op je school)." : "Kies je leerweg, dan zie je naar welk mbo-niveau je kunt.";
    if (s === "havo") wat = "Met havo kun je naar het hbo of naar mbo 4. Naar het wo kan na je hbo-propedeuse.";
    if (s === "vwo") wat = "Met vwo kun je naar het wo, het hbo of mbo 4.";
    if (s === "mbo") wat = "Met een mbo-4-diploma kun je naar het hbo. Soms vraagt een hbo-opleiding een bepaald vak of een bijspijkercursus.";
    const vk = profiel.vakken || [];
    let passend = "";
    if ((s === "havo" || s === "vwo") && ((profiel.prof || []).length || vk.length)) {
      const streng = FAMILIES.filter((f) => { const E = PROF_EIS[f.id] || {}; return E.prof || E.een || E.wo; });
      const oordeel = (f) => profielCheck({ l: [s === "vwo" ? "wo" : "hbo"] }, f.id, true);
      const knop = (f) => `<button type="button" data-famopen="${f.id}">${esc(f.naam)}</button>`;
      const wel = streng.filter((f) => oordeel(f) === "goed");
      const niet = streng.filter((f) => oordeel(f) === "let");
      passend = `<p>De meeste groepen vragen geen vast profiel. Bij deze groepen vraagt men wel een bepaald profiel of vak:</p>` +
        (wel.length ? `<p><strong>Dat heb jij:</strong></p><div class="mini">${wel.map(knop).join("")}</div>` : "") +
        (niet.length ? `<p><strong>Daar mis je nog iets:</strong></p><div class="mini">${niet.map(knop).join("")}</div>` : "");
    }
    $("#profielSamen").innerHTML = `<h3>Jouw profiel</h3><p class="pf-kort">${delen.join(" · ")}${vk.length ? `<br><span class="count">Vakken: ${vk.map(esc).join(", ")}</span>` : ""}</p><p>${wat}</p>${passend}`;
  }
  // Eén zin bij een opgeslagen opleiding: kan het, en zo niet, wat ontbreekt er?
  function profielReden(o) {
    const p = profielCheck(o, o.f, "punten") || [];
    const mis = p.find((x) => x[0] === false);
    if (mis) return mis[1];
    const ok = p.find((x) => x[0] === true);
    return ok ? "Kan: " + ok[1].replace(/^[^:]+: /, "") : "";
  }
  // Past een opleiding bij je profiel? Html voor de detailweergave, "goed" / "let" als kaal = true, of de losse punten
  function profielCheck(o, famId, kaal) {
    const s = schoolSoort();
    if (!s || s === "anders") return kaal ? "" : `<div class="pf-check"><p><strong>Past dit bij jou?</strong> <a href="#/profiel">Vul je profiel in</a>, dan zie je hier of je klas, profiel en vakken passen. Anoniem en alleen op dit apparaat.</p></div>`;
    // Elk punt: [true = in orde, false = ontbreekt, null = ter info, tekst]
    const punten = [];
    if (s === "vmbo") {
      if (!o.l.includes("mbo")) punten.push([false, o.l.includes("hbo") ? "Niveau: vanaf het vmbo ga je eerst naar mbo 4 (of de havo). Daarna kun je naar het hbo." : "Niveau: dit is een universitaire opleiding. Vanaf het vmbo kom je er via mbo 4 en het hbo."]);
      else if (profiel.leerweg && o.mn && o.mn.length) {
        const max = profiel.leerweg === "bb" ? 2 : 4;
        if (Math.min(...o.mn) > max) punten.push([false, `Niveau ${o.mn.join(", ")}: met de basisberoepsgerichte leerweg begin je op niveau 2 en stroom je daarna door.`]);
        else punten.push([true, `Niveau ${o.mn.filter((n) => n <= max).join(" of ")} kun je met jouw leerweg direct doen.`]);
      } else if (!profiel.leerweg) punten.push([null, "Kies je leerweg in je profiel, dan zie je of je niveau past."]);
    } else if (s === "havo" || s === "mbo") {
      if (!o.l.some((n) => n !== "wo")) punten.push([false, s === "havo" ? "Diploma: met havo kun je niet direct naar het wo. Wel via een hbo-propedeuse." : "Diploma: vanaf het mbo ga je eerst naar het hbo. Met je hbo-propedeuse kun je daarna naar het wo."]);
      else if (s === "havo" && o.l.length === 1 && o.l[0] === "mbo") punten.push([true, "Diploma: met een havodiploma kun je naar mbo niveau 3 of 4. Sommige scholen hebben voor havisten een verkorte route."]);
      else punten.push([true, `Diploma: met ${s === "havo" ? "havo" : "mbo 4"} kun je je hiervoor aanmelden${o.l.includes("wo") ? " (de wo-variant via een hbo-propedeuse)" : ""}.`]);
    } else if (s === "vwo") punten.push([true, o.l.length === 1 && o.l[0] === "mbo" ? "Diploma: met een vwo-diploma kun je naar mbo niveau 3 of 4." : "Diploma: met vwo kun je je hiervoor aanmelden."]);
    if (s === "havo" || s === "vwo") {
      const E = PROF_EIS[famId] || {};
      const pr = profiel.prof || [];
      const vk = profiel.vakken || [];
      const ingevuld = pr.length || vk.length;
      const heeft = (v) => vk.includes(v) || pr.some((p) => (PROFIEL_VAKKEN[p] || []).includes(v));
      if (!ingevuld && (E.prof || E.een || E.wo)) punten.push([null, `Hier is je profiel of vakkenpakket belangrijk. Vul ze in bij je profiel, dan zie je of het klopt.`]);
      if (E.prof && pr.length) {
        if (pr.some((p) => E.prof.includes(p))) punten.push([true, `Profiel: ${pr.map(profKort).join(" + ")} past.`]);
        else punten.push([false, `Profiel: meestal is ${E.prof.map(profKort).join(" of ")} nodig. Een ontbrekend vak kun je soms bijwerken (een deficiëntie wegwerken).`]);
      }
      if (E.een && ingevuld) {
        const wel = E.een.filter(heeft);
        punten.push(wel.length ? [true, `Verplicht vak: ${E.een.join(" of ")}. Jij hebt ${wel.join(" en ")}.`] : [false, `Verplicht vak: ${E.een.join(" of ")}. Dat zit niet in je pakket.`]);
      }
      if (E.wo && o.l.includes("wo") && ingevuld) E.wo.forEach((v) => punten.push(heeft(v) ? [true, `Verplicht voor het wo: ${v} heb je.`] : [false, `Verplicht voor het wo: ${v}. Dat zit niet in je pakket.`]));
      (E.helpt || []).filter(heeft).forEach((v) => punten.push([true, `Handig: ${v} heb je.`]));
      if (!E.prof && !E.een && !E.wo) punten.push([true, "Profiel: meestal geen vast profiel of verplicht vak."]);
    }
    const letOp = punten.some((p) => p[0] === false);
    if (kaal === "punten") return punten;
    if (kaal) return letOp ? "let" : punten.some((p) => p[0]) ? "goed" : "";
    if (!punten.length) return "";
    const teken = (ok) => (ok === true ? `<span class="pf-ok" aria-label="in orde">✓</span>` : ok === false ? `<span class="pf-nee" aria-label="ontbreekt">✗</span>` : `<span class="pf-info" aria-hidden="true">i</span>`);
    return `<div class="pf-check ${letOp ? "pf-let" : "pf-goed"}"><p><strong>${letOp ? "Let op: niet alles is in orde" : "Jouw profiel en vakken: in orde"}</strong> <small>(<a href="#/profiel">wijzig je profiel</a>)</small></p><ul>${punten.map(([ok, t]) => `<li>${teken(ok)}<span>${esc(t)}</span></li>`).join("")}</ul><p class="count">Een indicatie. De precieze eisen verschillen per school: check ze altijd bij de opleiding zelf.</p></div>`;
  }
  $("#profielForm").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pf]");
    if (!b) return;
    const w = b.dataset.w;
    const soort = b.dataset.pf;
    if (soort === "klas") {
      const oud = schoolSoort();
      bewaar("klas", w);
      if (schoolSoort() !== oud) profiel = { liefst: profiel.liefst };
    }
    if (soort === "leerweg") profiel.leerweg = profiel.leerweg === w ? "" : w;
    if (soort === "vmboprof") profiel.richting = profiel.richting === w ? "" : w;
    if (soort === "prof") {
      const pr = profiel.prof || [];
      profiel.prof = pr.includes(w) ? pr.filter((x) => x !== w) : pr.concat(w).slice(-2);
      if (!pr.includes(w)) profiel.vakken = [...new Set((profiel.vakken || []).concat(PROFIEL_VAKKEN[w] || []))];
    }
    if (soort === "vak") { const vk = profiel.vakken || []; profiel.vakken = vk.includes(w) ? vk.filter((x) => x !== w) : vk.concat(w); }
    bewaarProfiel();
    renderProfiel();
  });
  $("#profielForm").addEventListener("change", (e) => {
    if (e.target.id === "pfRichting") { profiel.richting = e.target.value; bewaarProfiel(); }
    if (e.target.id === "pfLiefst") { profiel.liefst = e.target.value !== ""; if (profiel.liefst) toonVak(Number(e.target.value)); bewaarProfiel(); }
  });
  $("#profielPrint").addEventListener("click", () => { document.body.classList.add("print-profiel"); window.print(); setTimeout(() => document.body.classList.remove("print-profiel"), 500); });
  $("#profielWis").addEventListener("click", () => {
    if (!confirm("Je profiel wissen? Je klas, profiel en vakken zijn dan weg. Je lijst en je plan blijven staan.")) return;
    profiel = {};
    try { localStorage.removeItem("profiel"); localStorage.removeItem("klas"); } catch (e) {}
    renderPlan();
    renderProfiel();
  });

  /* ---------- Ouders: één onderwerp tegelijk, het gesprek eerst ---------- */
  $("#ouderTegels").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ouder]");
    if (!b) return;
    document.querySelectorAll("#ouderTegels [data-ouder]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelectorAll("#ouders .ouderpaneel").forEach((p) => (p.hidden = p.dataset.paneel !== b.dataset.ouder));
  });

  /* ---------- Plan B ---------- */
  $("#planbKnoppen").innerHTML = PLANB.map((p, i) => `<button type="button" class="vakknop" data-planb="${i}" aria-pressed="false">${esc(p[0])}</button>`).join("");
  function toonPlanB(i) {
    const p = PLANB[i];
    document.querySelectorAll("#planbKnoppen .vakknop").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.planb === String(i))));
    $("#planbPaneel").innerHTML = `<p class="planb-wanneer">${vt(p[1])}</p><ol class="planb-stappen">${p[2].map((t) => `<li>${vt(t)}</li>`).join("")}</ol>`;
  }
  $("#planbKnoppen").addEventListener("click", (e) => { const b = e.target.closest("[data-planb]"); if (b) toonPlanB(Number(b.dataset.planb)); });
  toonPlanB(0);

  $("#toonMeeloop").addEventListener("click", () => {
    const b = $('#odChips [data-s="meeloop"]');
    if (b.getAttribute("aria-pressed") !== "true") b.click();
    scrollNaar($("#odAantal").getBoundingClientRect().top + window.scrollY - onderKop());
  });

  /* ---------- Leren of werken: korte check ---------- */
  const LW = [
    ["Ik wil nu al geld verdienen.", "bbl"],
    ["Ik leer het best door het gewoon te doen.", "bbl"],
    ["Ik wil graag een vaste werkplek en collega's.", "bbl"],
    ["Ik wil eerst rustig het vak leren voordat ik ga werken.", "bol"],
    ["Ik wil via stages verschillende bedrijven leren kennen.", "bol"],
    ["Ik weet nog niet precies welk beroep ik wil.", "bol"],
    ["Eigenlijk ben ik wel klaar met school.", "klaar"],
  ];
  $("#lwStellingen").innerHTML = LW.map((x, i) => `<button type="button" class="lw-zin" data-lw="${i}" aria-pressed="false">${esc(x[0])}</button>`).join("");
  $("#lwStellingen").addEventListener("click", (e) => {
    const k = e.target.closest("[data-lw]");
    if (!k) return;
    k.setAttribute("aria-pressed", String(k.getAttribute("aria-pressed") !== "true"));
    const aan = [...document.querySelectorAll("#lwStellingen [aria-pressed=true]")].map((x) => LW[Number(x.dataset.lw)][1]);
    // "Klaar met school" telt als werken-en-leren, met een verwijzing naar de uitleg over de kwalificatieplicht
    const klaar = aan.includes("klaar");
    const bbl = aan.filter((x) => x !== "bol").length, bol = aan.length - bbl;
    const klaarTekst = klaar ? ` <button type="button" class="linkbtn" data-klaar>Ik ben klaar met school: wat mag en kan ik? →</button>` : "";
    $("#lwUitslag").innerHTML = (!aan.length ? "Klik een paar zinnen aan."
      : bbl > bol ? `<strong>Werken en leren lijkt goed bij je te passen.</strong> Op het mbo heet dat bbl, op het hbo duaal of deeltijd, en op de universiteit kijk je naar deeltijd of de Open Universiteit. <button type="button" class="linkbtn" data-vorm="bbl">Bbl-opleidingen →</button> <button type="button" class="linkbtn" data-vorm="werk" data-niveau="hbo">Hbo naast je werk →</button>`
      : bol > bbl ? `<strong>Vooral leren lijkt goed bij je te passen:</strong> bol op het mbo, voltijd op het hbo en de universiteit. Met stages zie je toch al veel van het werk. <button type="button" class="linkbtn" data-vorm="bol">Bol-opleidingen →</button>`
      : "<strong>Allebei kan.</strong> Vraag op een open dag hoe een week eruitziet als je vooral leert, en als je werkt en leert.") + klaarTekst;
  });
  $("#lwUitslag").addEventListener("click", (e) => {
    if (e.target.closest("[data-klaar]")) scrollNaar($("#klaarmetleren").getBoundingClientRect().top + window.scrollY - onderKop());
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-vorm]");
    if (!b) return;
    state.zoek = "";
    $("#zoek").value = "";
    state.gebied = "";
    state.niveau = b.dataset.niveau || (b.dataset.vorm === "werk" ? "hbo" : "mbo");
    state.vorm = b.dataset.vorm;
    renderChips();
    renderList();
    go("opleidingen", "alle");
  });

  /* ---------- Printen: elk scherm en elke kaart ---------- */
  function printMet(klasse) {
    const dicht = [...document.querySelectorAll("main details:not([open])")];
    dicht.forEach((d) => (d.open = true));
    document.body.classList.add(klasse);
    window.print();
    setTimeout(() => { document.body.classList.remove(klasse); dicht.forEach((d) => (d.open = false)); }, 600);
  }
  $("#printPagina").addEventListener("click", () => printMet("print-scherm"));
  $("#printDialoog").addEventListener("click", () => printMet("print-dialoog"));

  /* ---------- Levend pad ----------
     Tijdens de test groeit het pad alleen omhoog, zonder richting: zo stuurt het je antwoorden niet.
     Bij de uitslag wordt het echte pad, met alle bochten, opnieuw getekend. */
  const PAD_ORDE = ["creatief", "mens", "zorg", "bedrijf", "tech", "weten"];
  const PAD_KORT = { creatief: "Creatief", mens: "Mens", zorg: "Zorg", bedrijf: "Bedrijf", tech: "Techniek", weten: "Wetenschap" };
  const padKnoop = (k) => { const i = PAD_ORDE.indexOf(k); return [30 + i * 56, 78 + (i - 2.5) ** 2 * 5]; };
  let padX = [];
  let padLengte = 0;
  // vloeiende lijn door alle punten (Catmull-Rom als Bézier)
  function vloeiend(pts) {
    const f = (v) => v.toFixed(1);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = pts[i], p3 = pts[i + 1] || p2;
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }
  function tekenPad() {
    const box = $("#levendPad");
    if (!box) return;
    if (!box.querySelector("svg")) {
      box.innerHTML = `<svg viewBox="0 0 340 420" role="img" aria-label="Jouw pad groeit met elk antwoord">` +
        `<g id="lpKnopen">${PAD_ORDE.map((k) => { const [nx, ny] = padKnoop(k); return `<circle class="lp-leeg" cx="${nx}" cy="${ny}" r="5"/>`; }).join("")}</g>` +
        `<path id="lpVoet" class="lp-voet" d=""/><path id="lpPad" class="lp-pad" d=""/>` +
        `<circle class="lp-start" cx="170" cy="392" r="5"/><text class="lp-jij" x="170" y="414">jij</text>` +
        `<g id="lpKop" class="lp-kop" style="transform:translate(170px,392px)"><circle class="lp-ring" r="7"/><circle r="6"/></g></svg>` +
        `<figcaption id="lpTekst"></figcaption>`;
    }
    const sets = [...form.querySelectorAll("fieldset.q")].filter((f) => f.querySelector("input[type=radio]"));
    const n = sets.filter((f) => f.querySelector("input:checked")).length;
    const tot = Math.max(sets.length, 1);
    // het echte pad bijhouden voor de uitslag
    const { score, max } = bereken();
    const ratio = (k) => (max[k] ? score[k] / max[k] : 0);
    let sw = 0, sx = 0;
    PAD_ORDE.forEach((k) => { const w = ratio(k) ** 3 + 0.0001; sw += w; sx += w * padKnoop(k)[0]; });
    const doel = 170 + (sx / sw - 170) * Math.min(1, (n / tot) * 1.6);
    padX = padX.slice(0, n);
    for (let i = 0; i < n; i++) if (padX[i] == null) padX[i] = 170 + ((doel - 170) * (i + 1)) / n;
    // rustig bijsturen: elk antwoord buigt het pad maar een stukje
    if (n) padX[n - 1] = (padX[n - 2] ?? 170) + (doel - (padX[n - 2] ?? 170)) * 0.5;
    // zichtbaar is alleen een neutraal kronkelpad omhoog, zonder richting
    const pts = [[170, 392]];
    for (let i = 0; i < n; i++) pts.push([170 + 16 * Math.sin((i + 1) * 1.15), 392 - ((i + 1) / tot) * 262]);
    const d = vloeiend(pts);
    const [kx, ky] = pts[pts.length - 1];
    $("#lpVoet").setAttribute("d", d);
    const pad = $("#lpPad");
    pad.setAttribute("d", d);
    try {
      const L = pad.getTotalLength();
      pad.style.transition = "none";
      pad.style.strokeDasharray = `${L} ${L}`;
      pad.style.strokeDashoffset = String(Math.max(0, L - padLengte));
      pad.getBoundingClientRect();
      pad.style.transition = "stroke-dashoffset .6s ease";
      pad.style.strokeDashoffset = "0";
      padLengte = L;
    } catch (e) {}
    $("#lpKop").style.transform = `translate(${kx}px,${ky}px)`;
    $("#lpTekst").textContent = !n ? "Je pad begint hier. Waar het heen gaat, zie je pas aan het eind." : n >= tot ? "Klaar. Bekijk je uitslag: daar zie je waar je pad heen ging." : "Je pad groeit met elk antwoord. Waar het heen gaat, zie je aan het eind.";
  }
  // Bij de uitslag: het echte pad opnieuw tekenen, met bochten en splitsing
  function speelPadAf() {
    const box = $("#padReplay");
    if (!box) return;
    const { score, max, rank } = bereken();
    const ratio = (k) => (max[k] ? score[k] / max[k] : 0);
    const tot = Math.max(padX.length, 1);
    const pts = [[170, 392], ...padX.map((px, i) => [px, 392 - ((i + 1) / tot) * 262])];
    const d = vloeiend(pts);
    const [kx, ky] = pts[pts.length - 1];
    const top2 = rank.slice(0, 2);
    const duur = 2.8;
    box.innerHTML = `<svg viewBox="0 0 340 420" role="img" aria-label="Zo liep jouw pad: van jij naar ${top2.map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}">` +
      `<path class="lp-voet" d="${d}"/><path class="lp-pad rp-pad" d="${d}" pathLength="1" style="animation-duration:${duur}s"/>` +
      top2.map((k) => { const [nx, ny] = padKnoop(k); return `<path class="lp-vork" style="animation-delay:${duur}s" d="M${kx.toFixed(1)} ${ky.toFixed(1)} C${kx.toFixed(1)} ${(ky - 40).toFixed(1)} ${nx} ${ny + 40} ${nx} ${ny}"/>`; }).join("") +
      PAD_ORDE.map((k, i) => {
        const [nx, ny] = padKnoop(k);
        const r = 4 + ratio(k) * 9;
        return `<g class="lp-knoop${top2.includes(k) ? " gekozen" : ""}" style="animation-delay:${top2.includes(k) ? duur + 0.6 : 0}s"><circle cx="${nx}" cy="${ny}" r="${r.toFixed(1)}"/><text x="${nx}" y="${(ny - r - (i % 2 ? 20 : 7)).toFixed(1)}">${PAD_KORT[k]}</text></g>`;
      }).join("") +
      `<circle class="lp-start" cx="170" cy="392" r="5"/><text class="lp-jij" x="170" y="414">jij</text>` +
      `<circle class="rp-kop" r="6"><animateMotion dur="${duur}s" fill="freeze" path="${d}"/></circle></svg>`;
  }

  /* ---------- Sterrenkaart: vrij verkennen ---------- */
  const GEB = Object.keys(GEBIEDEN);
  const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const gebHoek = {}, famHoek = {};
  GEB.forEach((k, i) => (gebHoek[k] = -Math.PI / 2 + (i * 2 * Math.PI) / GEB.length));
  GEB.forEach((k) => {
    const fs = FAMILIES.filter((f) => f.gebied === k);
    const spread = ((2 * Math.PI) / GEB.length) * 0.78;
    fs.forEach((f, j) => (famHoek[f.id] = gebHoek[k] + (fs.length > 1 ? -spread / 2 + (spread * j) / (fs.length - 1) : 0)));
  });
  const STER_START = [-640, -400, 1280, 800];
  const ster = { open: null, vb: STER_START.slice(), sleep: null, bewogen: false };
  const stofHtml = (() => {
    let s = 7, h = "";
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 260; i++) h += `<circle cx="${(rnd() * 2400 - 1200).toFixed(0)}" cy="${(rnd() * 2400 - 1200).toFixed(0)}" r="${(rnd() * 1.6 + 0.3).toFixed(1)}" style="opacity:${(rnd() * 0.6 + 0.15).toFixed(2)}"/>`;
    return h;
  })();
  const kortNaam = (t, n) => (t.length > n ? t.slice(0, n - 1) + "…" : t);
  const famOpls = (id) => OPLEIDINGEN.filter((o) => o.f === id).sort((a, b) => b.i.length - a.i.length);
  function tekenSter() {
    const mijn = (lees("padvinder", null) || {}).top || [];
    let lijnen = "", knopen = "";
    GEB.forEach((k) => {
      const [x, y] = polar(170, gebHoek[k]);
      lijnen += `<line class="st-l1${mijn.includes(k) ? " mijn" : ""}" x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    });
    // open groep: waaier ver genoeg naar buiten dat hij voorbij het eigen label begint
    const WAAIER_R = 600, WAAIER_STAP = 0.065;
    const openF = ster.open && FAMILIES.find((x) => x.id === ster.open);
    const waaierHalf = openF ? (Math.min(famOpls(openF.id).length, 13) / 2) * WAAIER_STAP + 0.06 : 0;
    FAMILIES.forEach((f) => {
      const [x1, y1] = polar(170, gebHoek[f.gebied]);
      const [x2, y2] = polar(330, famHoek[f.id]);
      lijnen += `<line class="st-l2${ster.open === f.id ? " aan" : ""}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      const links = Math.cos(famHoek[f.id]) < -0.2, rechts = Math.cos(famHoek[f.id]) > 0.2;
      const [lx, ly] = polar(350, famHoek[f.id]);
      // labels van buurgroepen die onder de open waaier vallen, verbergen
      const onderWaaier = openF && f !== openF && Math.abs(Math.atan2(Math.sin(famHoek[f.id] - famHoek[openF.id]), Math.cos(famHoek[f.id] - famHoek[openF.id]))) < waaierHalf;
      knopen += `<g class="st-k st-fam${ster.open === f.id ? " open" : ""}${onderWaaier ? " stil" : ""}" data-ster="fam:${f.id}" tabindex="0" role="button" aria-label="${esc(f.naam)}"><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="9"/>` +
        `<text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="${links ? "end" : rechts ? "start" : "middle"}">${esc(kortNaam(f.naam, 26))}</text></g>`;
    });
    if (ster.open) {
      const f = FAMILIES.find((x) => x.id === ster.open);
      const alle = famOpls(f.id);
      const toon = alle.slice(0, 12);
      const stap = WAAIER_STAP;
      const items = toon.map((o) => ["opl", o]).concat(alle.length > toon.length ? [["meer", alle.length - toon.length]] : []);
      items.forEach(([soort, o], j) => {
        const a = famHoek[f.id] + (j - (items.length - 1) / 2) * stap;
        const [x1, y1] = polar(330, famHoek[f.id]);
        const [x2, y2] = polar(WAAIER_R, a);
        const graden = (a * 180) / Math.PI;
        const links = Math.cos(a) < 0;
        const [tx, ty] = polar(WAAIER_R + 14, a);
        lijnen += `<line class="st-l3" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="animation-delay:${j * 25}ms"/>`;
        const label = soort === "opl" ? `${esc(kortNaam(o.n, 34))} <tspan class="st-niv">${o.l.join(" · ")}</tspan>` : `+ ${o} meer opleidingen`;
        knopen += `<g class="st-k st-opl${soort === "meer" ? " meer" : ""}" data-ster="${soort === "opl" ? "opl:" + OPLEIDINGEN.indexOf(o) : "meer:" + f.id}" tabindex="0" role="button" style="animation-delay:${j * 25}ms">` +
          `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${soort === "opl" ? 5 : 7}"/>` +
          `<text transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${(links ? graden + 180 : graden).toFixed(1)})" text-anchor="${links ? "end" : "start"}" dy="4">${label}</text></g>`;
      });
    }
    GEB.forEach((k) => {
      const [x, y] = polar(170, gebHoek[k]);
      knopen += `<g class="st-k st-geb${mijn.includes(k) ? " mijn" : ""}" data-ster="geb:${k}" tabindex="0" role="button" aria-label="${esc(GEBIEDEN[k].naam)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20"/>` +
        `<text x="${x.toFixed(1)}" y="${(y + 40).toFixed(1)}" text-anchor="middle">${esc(GEBIEDEN[k].naam)}</text></g>`;
    });
    knopen += `<g class="st-k st-jij" data-ster="jij" tabindex="0" role="button" aria-label="Terug naar het midden"><circle cx="0" cy="0" r="30"/><text x="0" y="6" text-anchor="middle">jij</text></g>`;
    $("#sterSvg").innerHTML = `<g class="st-stof">${stofHtml}</g>${lijnen}${knopen}`;
    $("#sterSvg").setAttribute("viewBox", ster.vb.join(" "));
  }
  function sterNaar(doel, ms = 480) {
    const van = ster.vb.slice(), t0 = performance.now();
    const stap = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - (1 - p) ** 3;
      ster.vb = van.map((v, i) => v + (doel[i] - v) * e);
      $("#sterSvg").setAttribute("viewBox", ster.vb.join(" "));
      if (p < 1) requestAnimationFrame(stap);
    };
    requestAnimationFrame(stap);
  }
  const sterKader = (cx, cy, w) => { const h = w * (ster.vb[3] / ster.vb[2]); return [cx - w / 2, cy - h / 2, w, h]; };
  function sterInfo(html) { $("#sterInfo").innerHTML = html; }
  const STER_UITLEG = `<p><strong>Zo werkt het:</strong> in het midden sta jij, daaromheen de zes gebieden en de groepen opleidingen. Klik op een ster om hem open te klappen. Slepen en zoomen kan ook.</p>`;
  function sterKlik(code) {
    const [soort, id] = code.split(":");
    if (soort === "jij") {
      ster.open = null;
      tekenSter();
      sterNaar(STER_START);
      const mijn = (lees("padvinder", null) || {}).top;
      sterInfo(STER_UITLEG + (mijn ? `<p><strong>Rood</strong> zijn de richtingen uit jouw Padvinder: ${mijn.slice(0, 2).map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}.</p>` : `<p><a href="#/test">Doe de Padvinder</a>, dan kleuren jouw richtingen rood.</p>`));
    } else if (soort === "geb") {
      const fs = FAMILIES.filter((f) => f.gebied === id);
      const [x, y] = polar(260, gebHoek[id]);
      sterNaar(sterKader(x, y, 760));
      sterInfo(`<p class="st-soort">Gebied</p><h3>${esc(GEBIEDEN[id].naam)}</h3><p>${vt(GEBIEDEN[id].uitleg)}</p><div class="mini">${fs.map((f) => `<button type="button" data-sterfam="${f.id}">${esc(f.naam)}</button>`).join("")}</div>`);
    } else if (soort === "fam") {
      ster.open = ster.open === id ? null : id;
      tekenSter();
      const f = FAMILIES.find((x) => x.id === id);
      if (ster.open) {
        const [x, y] = polar(520, famHoek[id]);
        sterNaar(sterKader(x, y, 1180));
      }
      const dromen = DROOM.map((d, i) => [d, i]).filter(([d]) => d[5].includes(id));
      sterInfo(`<p class="st-soort">Groep opleidingen</p><h3>${esc(f.naam)}</h3><p>${vt(f.uitleg)}</p>` +
        `<p><button type="button" class="btn" data-famopen="${id}">Bekijk alle ${famOpls(id).length} opleidingen</button></p>` +
        (dromen.length ? `<h4>Droombanen in deze hoek</h4><div class="mini">${dromen.map(([d, i]) => `<button type="button" data-droom="${i}">De nieuwe ${esc(d[0])}</button>`).join("")}</div>` : ""));
    } else if (soort === "opl") {
      const o = OPLEIDINGEN[Number(id)];
      openOpleiding(o, FAMILIES.find((x) => x.id === o.f));
    } else if (soort === "meer") {
      openFamily(id);
    }
  }
  (() => {
    const svg = $("#sterSvg");
    svg.addEventListener("pointerdown", (e) => { ster.sleep = [e.clientX, e.clientY]; ster.bewogen = false; });
    window.addEventListener("pointermove", (e) => {
      if (!ster.sleep) return;
      const dx = e.clientX - ster.sleep[0], dy = e.clientY - ster.sleep[1];
      if (!ster.bewogen && Math.hypot(dx, dy) < 5) return;
      if (!ster.bewogen) svg.setPointerCapture?.(e.pointerId);
      ster.bewogen = true;
      const s = ster.vb[2] / svg.clientWidth;
      ster.vb[0] -= dx * s;
      ster.vb[1] -= dy * s;
      ster.sleep = [e.clientX, e.clientY];
      svg.setAttribute("viewBox", ster.vb.join(" "));
    });
    window.addEventListener("pointerup", () => (ster.sleep = null));
    const zoom = (f, cx, cy) => {
      const [x, y, w, h] = ster.vb;
      const nw = Math.min(2600, Math.max(320, w * f)), k = nw / w;
      const px = cx == null ? x + w / 2 : cx, py = cy == null ? y + h / 2 : cy;
      ster.vb = [px - (px - x) * k, py - (py - y) * k, nw, h * k];
      svg.setAttribute("viewBox", ster.vb.join(" "));
    };
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, ster.vb[0] + ((e.clientX - r.left) / r.width) * ster.vb[2], ster.vb[1] + ((e.clientY - r.top) / r.height) * ster.vb[3]);
    }, { passive: false });
    svg.addEventListener("click", (e) => {
      if (ster.bewogen) return;
      const k = e.target.closest("[data-ster]");
      if (k) sterKlik(k.dataset.ster);
    });
    svg.addEventListener("keydown", (e) => {
      const k = e.target.closest("[data-ster]");
      if (k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); sterKlik(k.dataset.ster); }
    });
    $("#sterIn").addEventListener("click", () => zoom(1 / 1.3));
    $("#sterUit").addEventListener("click", () => zoom(1.3));
    $("#sterReset").addEventListener("click", () => sterKlik("jij"));
    $("#sterInfo").addEventListener("click", (e) => { const b = e.target.closest("[data-sterfam]"); if (b) sterKlik("fam:" + b.dataset.sterfam); });
  })();

  /* ---------- Metrokaart: alle routes ---------- */
  const LIJNEN = {
    vwo: ["Vwo", "M70 90 H770 L880 200 V250"],
    havo: ["Havo", "M70 250 H880"],
    vmbo: ["Vmbo", "M70 410 H770 L880 300 V250"],
  };
  // id: [naam, x, y, lijn, uitleg, niveau-knop]
  const STATIONS = {
    vmbo: ["Vmbo", 70, 410, "vmbo", "Vier leerwegen: basis, kader, gemengd en theoretisch. Na je diploma ga je meestal naar het mbo."],
    vmbod: ["Vmbo-diploma", 170, 410, "vmbo", "Daarmee kun je naar mbo 2, 3 of 4. Met een diploma van de gemengde of theoretische leerweg kun je ook naar havo 4."],
    mbo2: ["Mbo 2", 320, 410, "vmbo", "Basisberoep, 1 tot 2 jaar. Je leert een vak, zoals kok, verkoper of monteur. Met de basisberoepsgerichte leerweg begin je hier; daarna kun je doorstromen naar mbo 3 of 4.", "mbo"],
    mbo3: ["Mbo 3", 430, 410, "vmbo", "Vakopleiding, 2 tot 3 jaar. Je werkt zelfstandig in je vak. Met kader, gemengd of theoretisch kun je hier direct beginnen: je hoeft niet eerst mbo 2 te doen.", "mbo"],
    mbo4: ["Mbo 4", 540, 410, "vmbo", "Middenkader of specialist, 3 tot 4 jaar. Direct te kiezen met kader, gemengd of theoretisch, en ook met een havo- of vwo-diploma. Daarna kun je gaan werken of doorstromen naar het hbo.", "mbo"],
    havo: ["Havo", 70, 250, "havo", "Vijf jaar. Een voorbereiding op het hbo."],
    havo4: ["Havo 4", 170, 250, "havo", "Hier stap je in als je met een vmbo-diploma doorstroomt."],
    havod: ["Havodiploma", 290, 250, "havo", "Daarmee kun je naar het hbo, naar mbo 4 of naar vwo 5."],
    hbop: ["Hbo, 1e jaar", 540, 250, "havo", "Het eerste jaar heet de propedeuse. Haal je die, dan kun je ook doorstromen naar de universiteit.", "hbo"],
    hbob: ["Hbo-bachelor", 700, 250, "havo", "Meestal 4 jaar. Praktijkgericht, met stages.", "hbo"],
    vwo: ["Vwo", 70, 90, "vwo", "Zes jaar, atheneum of gymnasium. Een voorbereiding op de universiteit."],
    vwo5: ["Vwo 5", 290, 90, "vwo", "Hier stap je in als je met een havodiploma doorstroomt."],
    vwod: ["Vwo-diploma", 400, 90, "vwo", "Daarmee kun je naar de universiteit, maar ook naar het hbo of het mbo."],
    wob: ["Wo-bachelor", 540, 90, "vwo", "3 jaar aan de universiteit. Theoretischer, met veel onderzoek.", "wo"],
    wom: ["Wo-master", 700, 90, "vwo", "1 tot 2 jaar. De meeste studenten aan de universiteit doen er een master achteraan.", "wo"],
    werk: ["Aan het werk", 880, 250, "alle", "Alle lijnen komen hier uit. Geen enkele route is doodlopend."],
    later: ["Later nog leren", 640, 470, "alle", "In deeltijd, via bbl naast je werk of met een cursus. Je kunt altijd weer instappen."],
  };
  const OVERSTAP = [
    ["vmbod", "havo4", "Doorstromen naar de havo"],
    ["havod", "vwo5", "Doorstromen naar het vwo"],
    ["mbo4", "hbop", "Met mbo 4 naar het hbo"],
    ["havod", "mbo4", "Met je havodiploma naar mbo 4"],
    ["vwod", "hbop", "Met je vwo-diploma naar het hbo"],
    ["hbop", "wob", "Met je propedeuse naar de universiteit"],
    ["hbob", "wom", "Via een schakeljaar naar een wo-master"],
  ];
  const overstapIds = new Set(OVERSTAP.flatMap((o) => [o[0], o[1]]));
  // Routes per startlijn: [naam, stations, uitleg]
  const ROUTES = {
    vmbo: [
      ["Een vak leren en gaan werken", "Vak leren en werken", ["vmbo", "vmbod", "mbo2", "mbo3", "werk"], "Op mbo 2 of 3 leer je in 1 tot 3 jaar een vak, zoals kok, monteur of verzorgende. Daarna ga je aan het werk."],
      ["Mbo 4 en dan werken", "Mbo 4 en werken", ["vmbo", "vmbod", "mbo4", "werk"], "Mbo 4 is het hoogste mbo-niveau: 3 tot 4 jaar. Je wordt specialist of leidinggevende."],
      ["Via mbo 4 naar het hbo", "Via mbo 4 naar hbo", ["vmbo", "vmbod", "mbo4", "hbop", "hbob", "werk"], "Met een mbo 4-diploma kun je naar het hbo. Veel hbo-studenten komen van het mbo."],
      ["Via de havo", "Via de havo", ["vmbo", "vmbod", "havo4", "havod", "hbop", "hbob", "werk"], "Met een diploma van de gemengde of theoretische leerweg kun je naar havo 4. Daarna kun je naar het hbo."],
      ["Stap voor stap: mbo 2, 3 en 4", "Stap voor stap", ["vmbo", "vmbod", "mbo2", "mbo3", "mbo4", "werk"], "Begin je op mbo 2, bijvoorbeeld na de basisberoepsgerichte leerweg? Met je diploma kun je daarna door naar mbo 3 en mbo 4. Elke stap is een eigen diploma."],
    ],
    havo: [
      ["Hbo en dan werken", "Hbo", ["havo", "havod", "hbop", "hbob", "werk"], "De meest gekozen route: 4 jaar hbo, praktijkgericht en met stages."],
      ["Hbo en daarna een wo-master", "Hbo, dan wo-master", ["havo", "havod", "hbop", "hbob", "wom", "werk"], "Na je hbo-bachelor kun je via een schakeljaar een master aan de universiteit doen."],
      ["Met je propedeuse naar de universiteit", "Via propedeuse naar wo", ["havo", "havod", "hbop", "wob", "wom", "werk"], "Haal je het eerste hbo-jaar, dan kun je vaak doorstromen naar een universiteit."],
      ["Eerst nog vwo", "Eerst vwo", ["havo", "havod", "vwo5", "vwod", "wob", "wom", "werk"], "Met je havodiploma kun je naar vwo 5. Daarna kun je direct naar de universiteit."],
      ["Mbo 4 na de havo", "Mbo 4", ["havo", "havod", "mbo4", "werk"], "Liever direct een vak leren? Met je havodiploma kun je naar mbo 4. Sommige scholen hebben voor havisten een verkorte route. Daarna kun je alsnog naar het hbo."],
    ],
    vwo: [
      ["Universiteit: bachelor en master", "Bachelor en master", ["vwo", "vwod", "wob", "wom", "werk"], "3 jaar bachelor en 1 tot 2 jaar master. De meeste studenten aan de universiteit doen allebei."],
      ["Alleen een bachelor, dan werken", "Alleen bachelor", ["vwo", "vwod", "wob", "werk"], "Na je bachelor mag je ook gaan werken, en later eventueel nog een master doen."],
      ["Naar het hbo", "Hbo", ["vwo", "vwod", "hbop", "hbob", "werk"], "Met je vwo-diploma kun je ook naar het hbo: praktischer, met stages. Daarna kun je via een schakeljaar nog een wo-master doen."],
    ],
  };
  // Vanuit het vmbo naar het hbo: eerst even stilstaan bij het waarom
  const HBO_WAAROM = [
    ["Ik wil een beroep waarvoor het hbo nodig is", "Sterke reden. Zoek uit welke hbo-opleiding daar precies bij hoort, en of er ook een mbo 4-opleiding is die er dichtbij komt."],
    ["Ik wil nog meer leren, het vak boeit me", "Mooi. Op het hbo werk je meer met theorie, verslagen en zelfstandig plannen. Vraag op een open dag hoe een gewone studieweek eruitziet."],
    ["Ik wil later meer verdienen", "Gemiddeld verdien je met hbo meer, maar goede vakmensen van het mbo zijn ook hard nodig en verdienen vaak prima. Kijk vooral naar het werk dat je wilt doen."],
    ["Anderen verwachten het van me", "Goed dat je dit merkt. Praat erover: wat wil jij zelf? Een route kiezen voor een ander houd je minder lang vol."],
    ["Ik weet het nog niet", "Dat is prima. Kies eerst iets wat je nu leuk vindt. De weg naar het hbo blijft open, ook later."],
  ];
  function hboWaarom() {
    const gekozen = lees("hbo_waarom", null);
    const a = HBO_WAAROM[gekozen];
    return `<div class="m-waarom"><p class="st-soort">Even stilstaan</p><h4>Waarom wil je naar het hbo?</h4>` +
      `<div class="chips">${HBO_WAAROM.map(([t], i) => `<button type="button" class="chip" data-waarom="${i}" aria-pressed="${gekozen === i}">${esc(t)}</button>`).join("")}</div>` +
      `<p class="m-waarom-antw" aria-live="polite">${a ? vt(a[1]) : "Er is geen goed of fout antwoord. Het helpt wel om je reden te kennen."}</p></div>`;
  }
  let metroRoute = null;
  // pad door de stations van een route, met de bochten naar "werk"
  function routePad(ids) {
    const p = [];
    ids.forEach((id, i) => {
      const [, x0, y] = STATIONS[id];
      const x = i === 0 && ["vmbo", "havo", "vwo"].includes(id) ? x0 + 50 : x0; // begin naast het lijnbordje
      if (id === "werk" && p.length) {
        const [, py] = p[p.length - 1];
        if (py === 410) p.push([770, 410], [880, 300]);
        if (py === 90) p.push([770, 90], [880, 200]);
      }
      p.push([x, y]);
    });
    return "M" + p.map(([x, y]) => `${x} ${y}`).join(" L");
  }
  function toonRoutes() {
    const lijst = ROUTES[metroLijn] || [];
    $("#metroRoutes").innerHTML = lijst.length ? `<span class="m-kies-label">Jouw routes</span>` + lijst.map((r, i) => `<button type="button" class="chip" data-route="${i}" aria-pressed="${metroRoute === i}">${r[1]}</button>`).join("") : "";
  }
  function kiesRoute(i) {
    metroRoute = i;
    const r = ROUTES[metroLijn][i];
    tekenMetro();
    $("#metroInfo").innerHTML = `<p class="st-soort">Route</p><h3>${r[0]}</h3><p>${vt(r[3])}</p><p class="m-volgorde">${r[2].filter((id) => !["vmbo", "havo", "vwo"].includes(id)).map((id) => STATIONS[id][0]).join(" → ")}</p>` +
      (metroLijn === "vmbo" && r[2].includes("hbop") ? hboWaarom() : "") +
      `<p class="count">Klik op een station op de kaart voor meer uitleg.</p>`;
  }
  let metroLijn = "alle";
  function tekenMetro() {
    let h = `<path class="m-later" d="M880 266 C950 300 950 470 800 470 H470 C435 470 430 445 430 424"/>`;
    OVERSTAP.forEach(([a, b], i) => { const A = STATIONS[a], B = STATIONS[b]; h += `<line class="m-over" data-metro="ov${i}" x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}"/>`; });
    Object.entries(LIJNEN).forEach(([k, [, d]]) => (h += `<path class="m-lijn l-${k}" d="${d}"/>`));
    const route = metroLijn !== "alle" && metroRoute != null ? ROUTES[metroLijn][metroRoute] : null;
    if (route) {
      const d = routePad(route[2]);
      h += `<path class="m-route" d="${d}"/>`;
    }
    Object.entries(STATIONS).forEach(([id, [naam, x, y, lijn]]) => {
      if (id === "later") { h += `<g class="m-st m-tekst" data-metro="${id}" tabindex="0" role="button"><text x="${x}" y="${y - 10}" text-anchor="middle">Later nog leren ↺</text></g>`; return; }
      const eind = ["vmbo", "havo", "vwo"].includes(id);
      if (eind) { h += `<g class="m-st m-eind l-${lijn}${route && route[2].includes(id) ? " op-route" : ""}" data-metro="${id}" tabindex="0" role="button"><rect x="${x - 50}" y="${y - 20}" width="100" height="40" rx="20"/><text x="${x}" y="${y + 7}" text-anchor="middle">${naam}</text></g>`; return; }
      const r = id === "werk" ? 17 : overstapIds.has(id) ? 10 : 8;
      const tx = id === "werk" ? x + 26 : x + 13, ty = id === "werk" ? y + 7 : y - 16;
      h += `<g class="m-st l-${lijn}${overstapIds.has(id) ? " m-ov" : ""}${id === "werk" ? " m-werk" : ""}${route && route[2].includes(id) ? " op-route" : ""}" data-metro="${id}" tabindex="0" role="button"><circle cx="${x}" cy="${y}" r="${r}"/><text x="${tx}" y="${ty}">${naam}</text></g>`;
    });
    const svg = $("#metroSvg");
    svg.innerHTML = h;
    svg.setAttribute("class", "metro-svg kies-" + metroLijn + (route ? " heeft-route" : ""));
    toonRoutes();
    document.querySelectorAll("#metroLijnen .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lijn === metroLijn)));
  }
  function metroInfo(code) {
    let html;
    if (code.startsWith("ov")) {
      const [a, b, t] = OVERSTAP[Number(code.slice(2))];
      html = `<p class="st-soort">Doorstromen</p><h3>${t}</h3><p>Van <strong>${STATIONS[a][0]}</strong> naar <strong>${STATIONS[b][0]}</strong>. Vaak gelden er extra eisen, zoals een bepaald vak of een gemiddeld cijfer. Check het bij de school of opleiding.</p>`;
    } else {
      const [naam, , , , tekst, niv] = STATIONS[code];
      html = `<p class="st-soort">Station</p><h3>${naam}</h3><p>${vt(tekst)}</p>` + (niv ? `<p><button type="button" class="btn" data-metroniv="${niv}">Bekijk ${niv}-opleidingen</button></p>` : "");
    }
    $("#metroInfo").innerHTML = html;
  }
  (() => {
    const k = lees("klas", "");
    metroLijn = k.startsWith("vmbo") || k === "mbo4" ? "vmbo" : k.startsWith("havo") ? "havo" : k.startsWith("vwo") ? "vwo" : "alle";
    $("#metroLijnen").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lijn]");
      if (!b) return;
      metroLijn = b.dataset.lijn;
      if (ROUTES[metroLijn]) kiesRoute(0);
      else { metroRoute = null; tekenMetro(); }
    });
    $("#metroRoutes").addEventListener("click", (e) => { const b = e.target.closest("[data-route]"); if (b) kiesRoute(Number(b.dataset.route)); });
    const kies = (e) => { const g = e.target.closest("[data-metro]"); if (g) metroInfo(g.dataset.metro); };
    $("#metroSvg").addEventListener("click", kies);
    $("#metroSvg").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kies(e); } });
    $("#metroInfo").addEventListener("click", (e) => {
      const w = e.target.closest("[data-waarom]");
      if (w) {
        bewaar("hbo_waarom", Number(w.dataset.waarom));
        $("#metroInfo .m-waarom").outerHTML = hboWaarom();
        $(`#metroInfo [data-waarom="${w.dataset.waarom}"]`).focus();
        return;
      }
      const b = e.target.closest("[data-metroniv]");
      if (!b) return;
      state.zoek = "";
      $("#zoek").value = "";
      state.gebied = "";
      state.niveau = b.dataset.metroniv;
      renderChips();
      renderList();
      go("opleidingen", "alle");
    });
  })();
  tekenSter();
  sterKlik("jij");
  if (ROUTES[metroLijn]) kiesRoute(0); else tekenMetro();

  /* ---------- Samen vergelijken: leerling en ouder ---------- */
  const ROLNAAM = { leerling: "Leerling", ouder: "Ouder" };
  const ANTW_NAMEN = () => [...VRAGEN.map((_, i) => "q" + i), ...KWAL.map((_, i) => "k" + i), ...DRIJF.map((_, i) => "d" + i)];
  // Compacte code voor in een deellink: geen namen, alleen antwoordcijfers
  function naarCode(u) {
    const gk = Object.keys(GEBIEDEN);
    const cijfers = ANTW_NAMEN().map((n) => (u.vals[n] != null ? u.vals[n] : "x")).join("");
    const pz = u.vals.pz == null ? "x" : u.vals.pz === "" ? "n" : String(gk.indexOf(u.vals.pz));
    const t0 = u.vals.t0 != null ? u.vals.t0 : "x";
    const kind = (u.kind || []).reduce((m, v) => m + 2 ** Number(v), 0).toString(36);
    return `1${cijfers}~${pz}${t0}~${kind}`;
  }
  function vanCode(c) {
    const m = /^1([0-4x]+)~([0-9nx])([0-4x])~([0-9a-z]+)$/.exec(c || "");
    const namen = ANTW_NAMEN();
    if (!m || m[1].length !== namen.length) return null;
    const vals = {};
    namen.forEach((n, i) => { if (m[1][i] !== "x") vals[n] = m[1][i]; });
    const gk = Object.keys(GEBIEDEN);
    if (m[2] === "n") vals.pz = ""; else if (m[2] !== "x") vals.pz = gk[Number(m[2])];
    if (m[3] !== "x") vals.t0 = m[3];
    const bits = parseInt(m[4], 36) || 0;
    const kind = KIND.map((_, i) => String(i)).filter((i) => bits & (2 ** Number(i)));
    return { vals, kind, datum: new Date().toISOString().slice(0, 10), gedeeld: true };
  }
  const deelLink = (rol) => { const u = lees("uitslag_" + rol, null); return u ? `${location.origin}${location.pathname}#/samen?${rol === "ouder" ? "o" : "l"}=${naarCode(u)}` : ""; };
  // Het pad van een uitslag nabootsen, antwoord voor antwoord
  function padVan(u) {
    const namen = ["pz", ...ANTW_NAMEN(), "t0"].filter((n) => u.vals[n] != null);
    const tot = Math.max(namen.length, 1), xs = [], deel = {};
    namen.forEach((n, i) => {
      deel[n] = u.vals[n];
      const { score, max } = scoreVan(deel, u.kind || []);
      let sw = 0, sx = 0;
      PAD_ORDE.forEach((k) => { const w = (max[k] ? score[k] / max[k] : 0) ** 3 + 0.0001; sw += w; sx += w * padKnoop(k)[0]; });
      const doel = 170 + (sx / sw - 170) * Math.min(1, ((i + 1) / tot) * 1.6);
      const vorig = xs[i - 1] ?? 170;
      xs.push(vorig + (doel - vorig) * 0.5);
    });
    return [[170, 392], ...xs.map((x, i) => [x, 392 - ((i + 1) / tot) * 262])];
  }
  function deelKnoppen(rol) {
    const link = deelLink(rol);
    if (!link) return "";
    const ander = rol === "ouder" ? "je kind" : "je ouder";
    const tekst = `Ik heb de Padvinder gedaan op Wat studeer je eigenlijk? Doe jij hem ook? Dan zien we samen waar we hetzelfde over denken: ${link}`;
    return `<div class="samen-deel"><button type="button" class="btn" data-kopieer="${esc(link)}">Kopieer de link voor ${ander}</button><a class="btn ghost" href="${esc("https://wa.me/?text=" + encodeURIComponent(tekst))}" target="_blank" rel="noopener">Stuur via WhatsApp ↗</a></div>`;
  }
  function renderSamen() {
    const box = $("#samenInhoud");
    const L = lees("uitslag_leerling", null), O = lees("uitslag_ouder", null);
    if (!L || !O) {
      const heeft = L ? "leerling" : O ? "ouder" : "";
      const mist = heeft === "leerling" ? "ouder" : "leerling";
      box.innerHTML = `<div class="samen-stap">` +
        (heeft
          ? `<p class="st-soort">Nog één nodig</p><h3>De ${ROLNAAM[heeft].toLowerCase()} is klaar. Nu de ${ROLNAAM[mist].toLowerCase()}.</h3><p>Op dit apparaat: start de Padvinder en kies "${mist === "ouder" ? "Ik ben ouder" : "Ik ben leerling"}". Op een ander apparaat: stuur deze link. Wie hem opent en de Padvinder doet, ziet daarna de vergelijking.</p><p><button type="button" class="btn" data-samenrol="${mist}">Doe de Padvinder als ${ROLNAAM[mist].toLowerCase()}</button></p>${deelKnoppen(heeft)}`
          : `<p class="st-soort">Zo werkt het</p><h3>Twee keer de Padvinder, één vergelijking</h3><ol class="planb-stappen"><li>De leerling doet de Padvinder als leerling.</li><li>Een ouder doet hem ook, en kiest "Ik ben ouder". Dat kan op hetzelfde apparaat of op een ander, via een link.</li><li>Hier zie je daarna in één oogopslag waar jullie hetzelfde zien, en waar jullie over kunnen praten.</li></ol><p><button type="button" class="btn" data-samenrol="leerling">Begin als leerling</button> <button type="button" class="btn ghost" data-samenrol="ouder">Begin als ouder</button></p>`) +
        `<p class="count">De antwoorden blijven op dit apparaat of zitten in de link zelf. Ze gaan niet naar een server.</p></div>`;
      return;
    }
    const rL = scoreVan(L.vals, L.kind || []), rO = scoreVan(O.vals, O.kind || []);
    const pct = (r, k) => Math.round((r.score[k] / r.max[k]) * 100);
    const tL = rL.rank.slice(0, 2), tO = rO.rank.slice(0, 2);
    const eens = tL.filter((k) => tO.includes(k));
    // twee paden in één tekening
    const pL = padVan(L), pO = padVan(O);
    const vork = (pts, top, cls) => { const [kx, ky] = pts[pts.length - 1]; return top.map((k) => { const [nx, ny] = padKnoop(k); return `<path class="${cls}" d="M${kx.toFixed(1)} ${ky.toFixed(1)} C${kx.toFixed(1)} ${(ky - 40).toFixed(1)} ${nx} ${ny + 40} ${nx} ${ny}"/>`; }).join(""); };
    const svg = `<svg viewBox="0 0 340 430" role="img" aria-label="Twee paden: leerling naar ${tL.map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}, ouder naar ${tO.map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}">` +
      `<path class="sm-pad sm-o" d="${vloeiend(pO)}" pathLength="1"/><path class="sm-pad sm-l" d="${vloeiend(pL)}" pathLength="1"/>` +
      vork(pO, tO, "sm-vork sm-o") + vork(pL, tL, "sm-vork sm-l") +
      PAD_ORDE.map((k, i) => { const [nx, ny] = padKnoop(k); const beide = tL.includes(k) && tO.includes(k); return `<g class="lp-knoop${beide ? " gekozen" : tL.includes(k) || tO.includes(k) ? " half" : ""}"><circle cx="${nx}" cy="${ny}" r="${beide ? 11 : 7}"/><text x="${nx}" y="${(ny - (beide ? 11 : 7) - (i % 2 ? 20 : 7)).toFixed(1)}">${PAD_KORT[k]}</text></g>`; }).join("") +
      `<circle class="lp-start" cx="170" cy="392" r="5"/><text class="lp-jij" x="170" y="414">start</text></svg>` +
      `<p class="sm-legenda"><span class="sm-l-l"></span>Leerling <span class="sm-l-o"></span>Ouder</p>`;
    // gespreksstof: waar de antwoorden het verst uit elkaar liggen
    const tekstVan = (n) => { const lijst = n[0] === "q" ? VRAGEN : n[0] === "k" ? KWAL : DRIJF; return lijst[Number(n.slice(1))][1]; };
    const verschil = ANTW_NAMEN().filter((n) => L.vals[n] != null && O.vals[n] != null)
      .map((n) => ({ n, d: Number(L.vals[n]) - Number(O.vals[n]) })).filter((x) => Math.abs(x.d) >= 2)
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 5);
    const STARTERS_HOOG = ["Leerling: waar merk je dat aan jezelf? Ouder: heb je dat weleens gezien?", "Wanneer had de leerling dit voor het laatst? Vertel eens.", "Wat zou de ouder moeten zien om dit ook zo in te schatten?"];
    const STARTERS_LAAG = ["Ouder: waar zie je dat aan? Leerling: herken je dat?", "Wat ziet de ouder dat de leerling zelf (nog) niet ziet?", "Was dat vroeger anders dan nu?"];
    const stof = verschil.map((x, i) => `<li><p class="sm-vraag">${vt(tekstVan(x.n))}</p><p class="sm-antw"><span class="sm-tag sm-l">Leerling: ${ANTW[Number(L.vals[x.n])]}</span><span class="sm-tag sm-o">Ouder: ${ANTW[Number(O.vals[x.n])]}</span></p><p class="sm-praat">${(x.d > 0 ? STARTERS_HOOG : STARTERS_LAAG)[i % 3]}</p></li>`).join("");
    const pzL = L.vals.pz, pzO = O.vals.pz;
    const persoon = (k) => (k && PERSONAS[k] ? esc(PERSONAS[k][0].naam) : "niemand");
    const kindL = new Set(L.kind || []), kindO = new Set(O.kind || []);
    const kindVerschil = KIND.map((k, i) => [k[1], kindL.has(String(i)), kindO.has(String(i))]).filter(([, a, b]) => a !== b).slice(0, 4);
    const bars = Object.keys(GEBIEDEN).sort((a, b) => pct(rL, b) + pct(rO, b) - pct(rL, a) - pct(rO, a)).map((k) =>
      `<div class="sm-bar"><span class="sm-naam">${esc(GEBIEDEN[k].naam)}</span><span class="sm-sporen"><span class="sm-spoor"><span class="sm-l" style="width:${pct(rL, k)}%"></span></span><span class="sm-spoor"><span class="sm-o" style="width:${pct(rO, k)}%"></span></span></span><span class="sm-pct">${pct(rL, k)}%<br>${pct(rO, k)}%</span></div>`).join("");
    box.innerHTML =
      `<div class="samen-boven"><figure class="samen-pad">${svg}</figure><div>` +
      `<p class="st-soort">In één oogopslag</p><h3>${eens.length === 2 ? "Jullie zien dezelfde twee richtingen" : eens.length ? `Jullie zien allebei ${esc(GEBIEDEN[eens[0]].naam)}` : "Jullie zien andere richtingen"}</h3>` +
      `<p>${eens.length ? `Allebei: <strong>${eens.map((k) => esc(GEBIEDEN[k].naam)).join("</strong> en <strong>")}</strong>. ` : ""}` +
      `Leerling: ${tL.map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}. Ouder: ${tO.map((k) => esc(GEBIEDEN[k].naam)).join(" en ")}.` +
      `${eens.length < 2 ? " Waar het verschilt, valt het meest te bespreken." : ""}</p>` +
      `<div class="sm-bars">${bars}</div><p class="sm-legenda"><span class="sm-l-l"></span>Leerling <span class="sm-l-o"></span>Ouder</p></div></div>` +
      `<h3 class="sm-kop">Gespreksstof</h3><p class="count">Er is geen goed of fout. Een verschil betekent alleen: hier valt iets te bespreken.</p>` +
      (stof ? `<ol class="sm-stof">${stof}</ol>` : `<p>Jullie antwoorden lijken veel op elkaar. Praat dan over de vraag: wat maakt die richting zo passend?</p>`) +
      `<div class="sm-klein">` +
      (pzL !== pzO ? `<div><h4>Herkenning</h4><p>De leerling herkende zich in <strong>${persoon(pzL)}</strong>, de ouder zag het kind eerder als <strong>${persoon(pzO)}</strong>. Lees samen beide verhalen: wat klopt er van allebei?</p></div>` : "") +
      (kindVerschil.length ? `<div><h4>Waar word je blij van?</h4><ul>${kindVerschil.map(([t, a]) => `<li>${esc(t)}: ${a ? "alleen de leerling koos dit" : "alleen de ouder koos dit"}</li>`).join("")}</ul></div>` : "") +
      `</div>` +
      `<p class="samen-acties"><a class="btn" href="#/ouders">Tips voor het gesprek →</a> <button type="button" class="btn ghost" id="samenWis">Vergelijking wissen</button></p>`;
    $("#samenWis").addEventListener("click", () => {
      if (!confirm("Beide uitslagen voor de vergelijking wissen?")) return;
      try { localStorage.removeItem("uitslag_leerling"); localStorage.removeItem("uitslag_ouder"); } catch (e) {}
      renderSamen();
    });
  }
  document.addEventListener("click", (e) => {
    const k = e.target.closest("[data-kopieer]");
    if (k) {
      const oud = k.textContent, klaar = () => { k.textContent = "Gekopieerd ✓"; setTimeout(() => (k.textContent = oud), 2500); };
      (navigator.clipboard ? navigator.clipboard.writeText(k.dataset.kopieer) : Promise.reject()).then(klaar, () => prompt("Kopieer deze link:", k.dataset.kopieer));
      return;
    }
    const r = e.target.closest("[data-samenrol]");
    if (r) {
      location.hash = "#/test";
      const chip = document.querySelector(`.who .chip[data-who="${r.dataset.samenrol}"]`);
      if (chip && who !== r.dataset.samenrol) chip.click();
    }
  });

  /* ---------- Licht / donker ---------- */
  $("#thema").addEventListener("click", () => {
    const root = document.documentElement;
    const nuDonker = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = nuDonker ? "light" : "dark";
    try { localStorage.setItem("thema", root.dataset.theme); } catch (e) {}
  });

  /* ---------- Tegelgrids zonder eenzame laatste rij ---------- */
  // Valt de laatste rij korter uit, dan eerst één kolom minder als dat precies uitkomt;
  // anders delen de tegels op de laatste rij de volle breedte (via een fijner raster).
  const GRIDS = ".tegels,.cards,.nieuw,.opl,.gesprek-grid,.odtips-grid,.droom-grid,.personas,.flips,.woorden,.vakken,.bewaard-lijst";
  function balanceer() {
    document.querySelectorAll(GRIDS).forEach((g) => {
      const kids = [...g.children];
      g.style.gridTemplateColumns = "";
      kids.forEach((k) => (k.style.gridColumn = ""));
      if (!g.getClientRects().length) return;
      const zicht = kids.filter((k) => k.getClientRects().length);
      const n = zicht.length;
      let c = getComputedStyle(g).gridTemplateColumns.split(" ").length;
      if (n < 2 || c < 2) return;
      if (n < c) { g.style.gridTemplateColumns = `repeat(${n},minmax(0,1fr))`; return; }
      if (n % c && c > 2 && n % (c - 1) === 0) { g.style.gridTemplateColumns = `repeat(${c - 1},minmax(0,1fr))`; return; }
      const m = n % c;
      if (!m) return;
      g.style.gridTemplateColumns = `repeat(${c * m},minmax(0,1fr))`;
      zicht.forEach((k, i) => (k.style.gridColumn = `span ${i >= n - m ? c : m}`));
    });
  }
  let balansGepland = false;
  const planBalans = () => { if (!balansGepland) { balansGepland = true; setTimeout(() => { balansGepland = false; balanceer(); }, 30); } };
  new MutationObserver(planBalans).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] });
  let balansBreedte = 0;
  new ResizeObserver(() => { if (innerWidth !== balansBreedte) { balansBreedte = innerWidth; planBalans(); } }).observe(document.body);

  /* ---------- Init ---------- */
  const nc = $("#niveauChips");
  NIVEAUS.forEach((n) => chip(nc, n, "niveau", n));
  const anc = $("#alleNiveauChips");
  [...NIVEAUS, "ad"].forEach((n) => chip(anc, n === "ad" ? "associate degree" : n, "niveau", n));
  // De filterbalk plakt net onder de bovenbalk, hoe hoog die ook is
  const zetTopbar = () => document.documentElement.style.setProperty("--topbar-h", ($(".topbar") ? $(".topbar").offsetHeight : 0) + "px");
  zetTopbar();
  addEventListener("resize", zetTopbar);
  const vc = $("#vormChips");
  Object.keys(VORM_KORT).forEach((k) => chip(vc, VORM_KORT[k], "vorm", k));
  const gc = $("#gebiedChips");
  Object.keys(GEBIEDEN).forEach((k) => chip(gc, GEBIEDEN[k].naam, "gebied", k));
  $("#zoek").addEventListener("input", (e) => {
    state.zoek = e.target.value;
    renderList();
    if (state.zoek && view !== "opleidingen") go("opleidingen");
  });
  renderChips();
  renderList();
  buildQuiz();
  herstelAntwoorden();
  renderOpenDagen();
  renderPlan();
  route();
})();
