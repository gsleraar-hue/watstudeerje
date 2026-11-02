// Gebieden: uitleg + gespreksvragen voor ouders en kind
const GEBIEDEN = {
  zorg: {
    naam: "Zorg & gezondheid",
    uitleg: "Je wilt iets betekenen voor mensen die ziek, kwetsbaar of in beweging zijn. Je werkt graag dicht bij mensen en je voelt je verantwoordelijk.",
    praat: ["Wanneer hielp je laatst iemand en wat voelde dat als?", "Kun je tegen ziekte, pijn of verdriet van anderen, of valt dat zwaar?", "Wil je liever veel contact met patiënten, of meer op de achtergrond (onderzoek, techniek)?"]
  },
  bedrijf: {
    naam: "Bedrijf & economie",
    uitleg: "Je wilt snappen hoe organisaties werken, hoe je iets verkoopt, organiseert of laat groeien. Geld, mensen en plannen komen samen.",
    praat: ["Zou je zelf iets willen opzetten of liever in een grote organisatie werken?", "Wat vind je leuker: mensen overtuigen, cijfers analyseren of dingen organiseren?", "Welk bedrijf zou je graag van binnen willen zien?"]
  },
  tech: {
    naam: "Techniek & ICT",
    uitleg: "Je wilt dingen bouwen, programmeren of slimmer maken. Je houdt van logica, puzzels en zien dat iets echt werkt.",
    praat: ["Wat heb je laatst gemaakt of uitgezocht uit eigen nieuwsgierigheid?", "Wil je zelf bouwen, of bedenken wat anderen nodig hebben?", "Zit je liever veel achter een scherm, of juist met je handen aan iets?"]
  },
  creatief: {
    naam: "Creatief & media",
    uitleg: "Je wilt iets maken: beelden, verhalen, ontwerpen, content. Je bedenkt graag nieuwe dingen en laat graag iets zien.",
    praat: ["Wat heb je gemaakt waar je trots op bent?", "Wil je zelf maken, of anderen aansturen die maken?", "Hoe ga je om met kritiek op iets wat je zelf bedacht hebt?"]
  },
  mens: {
    naam: "Mens & maatschappij",
    uitleg: "Je wilt begrijpen waarom mensen doen wat ze doen en helpen als het misgaat, in gezinnen, scholen, organisaties of de rechtszaal.",
    praat: ["Wie in je omgeving help je vaak met problemen, en hoe doe je dat?", "Wil je liever één-op-één helpen of grotere systemen veranderen?", "Hoe zou je omgaan met mensen die jouw hulp niet willen?"]
  },
  weten: {
    naam: "Natuur & wetenschap",
    uitleg: "Je wilt weten hoe dingen écht in elkaar zitten, van cellen tot klimaat. Je vindt uitzoeken, bewijzen en dieper graven fijn.",
    praat: ["Welke vraag laat je niet los, ook al hoef je er niets mee?", "Vind je het leuk om lang aan één probleem te werken zonder snel resultaat?", "Zou je later in een lab, buiten of op een kantoor werken?"]
  }
};

// Opwarmvraag: waar word je blij van, vroeger en nu? [gebied, tekst]
const KIND = [
  ["tech", "Iets bouwen, in elkaar zetten of repareren"],
  ["tech", "Gamen of iets met computers doen"],
  ["creatief", "Tekenen, schrijven, filmen of foto's maken"],
  ["creatief", "Muziek maken, dansen of optreden"],
  ["bedrijf", "Iets verkopen, ruilen of geld verdienen"],
  ["bedrijf", "Dingen organiseren of de leiding nemen"],
  ["zorg", "Voor iemand zorgen, mensen of dieren"],
  ["zorg", "Sporten en bewegen"],
  ["weten", "Uitzoeken hoe iets werkt, ‘waarom?’ vragen"],
  ["weten", "Buiten zijn in de natuur"],
  ["mens", "Iemand iets uitleggen of leren"],
  ["mens", "Vrienden helpen of ruzies oplossen"]
];

// Stellingen: [gebied, leerling-tekst, ouder-tekst]
const VRAGEN = [
  ["tech", "Ik zoek graag zelf uit hoe iets werkt of kan het repareren.", "Mijn kind zoekt graag zelf uit hoe iets werkt of kan het repareren."],
  ["zorg", "Ik help graag als iemand zich slecht voelt.", "Mijn kind helpt graag als iemand zich slecht voelt."],
  ["creatief", "Ik maak graag dingen: tekenen, filmen, schrijven, ontwerpen of muziek.", "Mijn kind maakt graag dingen: tekenen, filmen, schrijven, ontwerpen of muziek."],
  ["bedrijf", "Ik vind het leuk om iets te organiseren of te verkopen.", "Mijn kind vindt het leuk om iets te organiseren of te verkopen."],
  ["weten", "Ik wil weten waaróm dingen zo zijn, ook al hoef ik er niets mee.", "Mijn kind wil weten waaróm dingen zo zijn, ook al hoeft het er niets mee."],
  ["mens", "Vrienden vragen mij om raad over hun problemen.", "Vrienden vragen mijn kind om raad over hun problemen."],
  ["tech", "Ik werk graag met computers, code of data.", "Mijn kind werkt graag met computers, code of data."],
  ["bedrijf", "Ik let op geld, deals en hoe een bedrijf winst maakt.", "Mijn kind let op geld, deals en hoe een bedrijf winst maakt."],
  ["zorg", "Ik ben geïnteresseerd in het lichaam, gezondheid en sport.", "Mijn kind is geïnteresseerd in het lichaam, gezondheid en sport."],
  ["creatief", "Ik let op hoe iets eruitziet en vind dat het mooi moet zijn.", "Mijn kind let op hoe iets eruitziet en vindt dat het mooi moet zijn."],
  ["weten", "Ik vind proefjes, onderzoek en natuur of scheikunde interessant.", "Mijn kind vindt proefjes, onderzoek en natuur of scheikunde interessant."],
  ["mens", "Ik vind eerlijkheid, regels en hoe mensen samenleven belangrijk.", "Mijn kind vindt eerlijkheid, regels en hoe mensen samenleven belangrijk."]
];

// Kwaliteiten en waarden (wat voor jou telt): [naam, leerling-tekst, ouder-tekst, gewicht per gebied]
const KWAL = [
  ["Analytisch denken", "Ik kan goed logisch nadenken en een probleem in stukjes hakken.", "Mijn kind kan goed logisch nadenken en een probleem in stukjes hakken.", { tech: 1, weten: 1, bedrijf: 0.4 }],
  ["Creatief denken", "Ik bedenk makkelijk nieuwe ideeën en oplossingen.", "Mijn kind bedenkt makkelijk nieuwe ideeën en oplossingen.", { creatief: 1, tech: 0.3, bedrijf: 0.3 }],
  ["Inlevingsvermogen", "Ik voel goed aan hoe anderen zich voelen.", "Mijn kind voelt goed aan hoe anderen zich voelen.", { zorg: 1, mens: 1 }],
  ["Praktisch en handig", "Ik doe liever dingen met mijn handen dan alleen praten of lezen.", "Mijn kind doet liever dingen met de handen dan alleen praten of lezen.", { tech: 0.6, zorg: 0.4, creatief: 0.3 }],
  ["Leiding nemen en organiseren", "Ik neem makkelijk de leiding en regel dingen.", "Mijn kind neemt makkelijk de leiding en regelt dingen.", { bedrijf: 1, mens: 0.4 }],
  ["Nauwkeurig en doorzetten", "Ik werk nauwkeurig en zet door tot het af is.", "Mijn kind werkt nauwkeurig en zet door tot het af is.", { weten: 1, zorg: 0.5, tech: 0.4 }],
  ["Uitleggen en overtuigen", "Ik kan goed uitleggen of mensen overtuigen.", "Mijn kind kan goed uitleggen of mensen overtuigen.", { bedrijf: 0.6, mens: 0.8, creatief: 0.5 }]
];
const DRIJF = [
  ["Mensen helpen", "Ik wil dat mijn werk mensen echt helpt.", "Mijn kind wil dat het werk mensen echt helpt.", { zorg: 1, mens: 1 }],
  ["Goed verdienen en doorgroeien", "Ik wil later goed verdienen en carrière maken.", "Mijn kind wil later goed verdienen en carrière maken.", { bedrijf: 1, tech: 0.5 }],
  ["Vrijheid", "Ik wil zelf bepalen hoe en wanneer ik werk.", "Mijn kind wil zelf bepalen hoe en wanneer het werkt.", { creatief: 0.8, bedrijf: 0.6, weten: 0.3 }],
  ["Uitdaging en blijven leren", "Ik wil steeds nieuwe dingen leren en grenzen verleggen.", "Mijn kind wil steeds nieuwe dingen leren en grenzen verleggen.", { weten: 1, tech: 0.8 }],
  ["Iets eigens maken", "Ik wil iets maken dat van mij is.", "Mijn kind wil iets maken dat van hem of haar is.", { creatief: 1, tech: 0.3 }],
  ["Zekerheid", "Ik wil een stabiele baan met een zekere toekomst.", "Mijn kind wil een stabiele baan met een zekere toekomst.", { zorg: 0.8, tech: 0.5, mens: 0.4, bedrijf: 0.3 }],
  ["Samenwerken", "Ik werk het liefst in een team.", "Mijn kind werkt het liefst in een team.", { zorg: 0.6, mens: 0.6, bedrijf: 0.5 }]
];

// Wat hebben de opleidingen in een richting gemeen en wat kun je ermee
Object.assign(GEBIEDEN.zorg, {
  gemeen: ["Je werkt direct met mensen en hun lichaam of gezondheid.", "Je leert veel over het lichaam, hygiëne en veilig werken, met veel stage.", "Je moet tegen emoties, onregelmatige uren en verantwoordelijkheid kunnen."],
  kunJe: ["Werken in ziekenhuis, thuiszorg, verpleeghuis of praktijk", "Doorgroeien naar specialist, leidinggevende of docent", "Werken in de sport, revalidatie of preventie", "Zeer goede kans op werk, want de vraag naar zorgmedewerkers is groot"]
});
Object.assign(GEBIEDEN.bedrijf, {
  gemeen: ["Je leert hoe organisaties werken: geld, mensen, klanten en strategie.", "Veel groepsopdrachten, casussen en presenteren.", "Je kunt later vrij breed werken, maar moet zelf een specialisatie kiezen."],
  kunJe: ["Werken als adviseur, manager, marketeer of financieel specialist", "Eigen bedrijf beginnen", "Werken bij banken, verzekeraars, handelsbedrijven of overheid", "Internationaal werken, vooral bij Engelstalige opleidingen"]
});
Object.assign(GEBIEDEN.tech, {
  gemeen: ["Je leert problemen oplossen met logica, wiskunde en een systematische aanpak.", "Je bouwt zelf dingen: software, prototypes of ontwerpen.", "Je werkt vaak in projecten en teams."],
  kunJe: ["Software developer, data-analist, security specialist", "Ingenieur, ontwerper of projectleider in industrie en bouw", "Werken bij start-ups, grote techbedrijven of de overheid", "Zeer goede kans op werk, want technisch talent is schaars"]
});
Object.assign(GEBIEDEN.creatief, {
  gemeen: ["Je maakt veel zelf en bouwt een portfolio op.", "Je leert ontwerpen, vertellen en presenteren, en krijgt feedback op je werk.", "Je werkt vaak voor echte opdrachtgevers."],
  kunJe: ["Werken als ontwerper, maker, contentspecialist of communicatieadviseur", "Zzp'er of eigen studio", "Werken bij bureaus, mediabedrijven of in de marketing van organisaties", "Let op: de concurrentie is groot, dus een goed portfolio en netwerk zijn belangrijk"]
});
Object.assign(GEBIEDEN.mens, {
  gemeen: ["Je leert waarom mensen doen wat ze doen, en hoe samenlevingen werken.", "Veel lezen, schrijven, gesprekken voeren en onderzoeken.", "Je leert argumenten onderbouwen en met verschillende mensen omgaan."],
  kunJe: ["Werken als leraar, jurist, psycholoog, maatschappelijk werker of beleidsadviseur", "Werken bij overheid, scholen, hulpverlening of organisaties", "Doorgroeien naar coach, onderzoeker of leidinggevende", "Soms is een master of vervolgopleiding nodig voor het beroep (bijvoorbeeld psycholoog of advocaat)"]
});
Object.assign(GEBIEDEN.weten, {
  gemeen: ["Je leert onderzoek doen: een vraag stellen, meten en onderbouwen.", "Veel theorie, practica en wetenschappelijk schrijven.", "Meestal een master erna om echt in je vak te komen."],
  kunJe: ["Onderzoeker aan een universiteit of bij een bedrijf", "Werken in een lab, bij een adviesbureau of bij de overheid", "Beleid en duurzaamheid, gezondheid of voeding", "Doorstromen naar vele andere masters"]
});

// Schoolvak -> wat het echt is. [vak, wat je er écht leuk aan vindt, waar het terugkomt, let op, studies, wat kun je ermee]
const VAKKEN_OVERJOU = {"Wiskunde": [["logisch redeneren", "abstract denken", "doorzetten bij een lastige som"], ["puzzels en patronen", "precies weten hoe het zit"]], "Natuurkunde": [["rekenen met formules", "verbanden zien", "een probleem stap voor stap oplossen"], ["hoe dingen werken", "techniek en energie"]], "Scheikunde": [["nauwkeurig werken", "experimenteren", "goed observeren"], ["stoffen en reacties", "onderzoek in een lab"]], "Biologie": [["onthouden en verbanden leggen", "zorgvuldig waarnemen"], ["het lichaam en gezondheid", "natuur en dieren"]], "Economie": [["met cijfers redeneren", "afwegen en keuzes maken"], ["geld en handel", "hoe bedrijven en de maatschappij werken"]], "Nederlands": [["goed formuleren", "lezen en analyseren", "argumenteren"], ["taal en verhalen", "mensen overtuigen of informeren"]], "Engels en andere talen": [["snel oppikken van een taal", "communiceren", "je verplaatsen in een ander"], ["andere landen en culturen", "reizen en internationaal werken"]], "Geschiedenis": [["veel informatie verwerken", "kritisch bronnen lezen", "verbanden leggen over tijd"], ["mensen en macht", "waarom de wereld is zoals hij is"]], "Aardrijkskunde": [["kaarten en data lezen", "grote systemen overzien"], ["landschap en klimaat", "steden en hoe mensen ruimte gebruiken"]], "Maatschappijleer en wetenschappen": [["meningen onderbouwen", "verschillende kanten zien"], ["politiek en recht", "eerlijkheid en samenleven"]], "Tekenen, CKV en kunst": [["creatief denken", "ruimtelijk en visueel denken", "iets afmaken tot het klopt"], ["vormgeving en beeld", "iets eigens maken"]], "Informatica": [["logisch en stapsgewijs denken", "fouten opsporen", "zelf iets uitzoeken"], ["computers en technologie", "iets bouwen dat werkt"]]};
// [vak, plezier, waar het terugkomt, let op, groepen, beroepen]
const VAKKEN = [
  ["Wiskunde", "Puzzelen, logisch redeneren, patronen zien.", "Informatica, data science, techniek, economie en econometrie gebruiken dit veel.", "Studie wiskunde zelf is iets heel anders: bewijzen en abstracte theorie, nauwelijks rekenen.", "ict, techniek, economie, natuur", ["Data-analist: patronen vinden in cijfers", "Actuaris: risico's berekenen voor verzekeraars en pensioenfondsen", "Softwareontwikkelaar", "Econometrist bij een bank of het CBS", "Ingenieur", "Leraar wiskunde"]],
  ["Natuurkunde", "Snappen hoe dingen werken en dat uitrekenen.", "Techniek, werktuigbouwkunde, elektrotechniek en bouwkunde zijn vooral toegepaste natuurkunde.", "Natuurkunde als studie is veel theoretischer dan het schoolvak.", "techniek, bouw, natuur", ["Ingenieur in energie, bouw of techniek", "Onderzoeker bij een universiteit of bedrijf", "Medisch beeldspecialist, bijvoorbeeld bij MRI-scans", "Meteoroloog: het weer voorspellen", "Energieadviseur", "Leraar natuurkunde"]],
  ["Scheikunde", "Experimenteren en stoffen begrijpen.", "Biomedische wetenschappen, chemische technologie, voeding en farmacie.", "Veel studies zijn lab en onderzoek, minder proefjes doen en meer rapporten schrijven.", "natuur, techniek, zorg", ["Laborant of analist in een laboratorium", "Onderzoeker bij een farmaceutisch bedrijf", "Procestechnoloog in de industrie", "Apotheker (via de studie farmacie)", "Forensisch onderzoeker bij het NFI", "Voedingsmiddelentechnoloog"]],
  ["Biologie", "Levende dingen, het lichaam en de natuur.", "Zorg, geneeskunde, biomedisch, diergeneeskunde of milieu. Het zijn heel verschillende werelden.", "Geneeskunde en biologie zijn niet hetzelfde: arts of onderzoeker?", "zorg, natuur, groen", ["Arts, verpleegkundige of fysiotherapeut", "Dierenarts of dierverzorger", "Ecoloog of natuurbeheerder", "Onderzoeker in een biomedisch lab", "Diëtist of voedingsdeskundige", "Leraar biologie"]],
  ["Economie", "Snappen waarom prijzen veranderen en hoe geld werkt.", "Economie, bedrijfskunde, marketing, financiën en bestuurskunde gebruiken dit.", "Bedrijfskunde gaat veel meer over mensen en organisaties dan het schoolvak.", "economie, management, marketing", ["Accountant: de cijfers van bedrijven controleren", "Financieel adviseur bij een bank", "Econoom bij de overheid of De Nederlandsche Bank", "Belastingadviseur", "Ondernemer met een eigen bedrijf", "Marketeer"]],
  ["Nederlands", "Lezen, schrijven, taal en verhalen.", "Communicatie, journalistiek, rechten, taalstudies en onderwijs. Bijna elke studie vraagt goed schrijven.", "Taal als studie is vooral taalkunde en literatuur analyseren.", "communicatie, talen, recht", ["Journalist of redacteur", "Tekstschrijver of communicatieadviseur", "Leraar Nederlands", "Redacteur bij een uitgeverij", "Jurist: rechten draait om lezen en formuleren", "Logopedist"]],
  ["Engels en andere talen", "Taal, andere landen en culturen.", "Internationale studies, vertaler, culturele studies, internationaal ondernemen.", "Veel studies zijn al Engelstalig. Dan is Engels een middel, geen vak.", "talen, management, communicatie", ["Vertaler of tolk", "Leraar Engels of een andere taal", "Werken bij een internationaal bedrijf", "Diplomaat of medewerker bij een ambassade", "Werken in toerisme of de hotelwereld", "Ondertitelaar voor films en series"]],
  ["Geschiedenis", "Verhalen over mensen, macht en waarom dingen zo gekomen zijn.", "Politiek, rechten, journalistiek, bestuurskunde, archeologie, cultuurwetenschappen.", "Als studie is het veel bronnen lezen en schrijven.", "talen, gedrag, recht", ["Leraar geschiedenis", "Archivaris: oude documenten bewaren en ontsluiten", "Museummedewerker of tentoonstellingsmaker", "Journalist of documentairemaker", "Beleidsmedewerker bij de overheid of een politieke partij", "Jurist of advocaat", "Erfgoedspecialist bij een gemeente"]],
  ["Aardrijkskunde", "Landen, klimaat, steden en hoe mensen ruimte gebruiken.", "Planologie, duurzaamheid, bouw, geografie en bestuur.", "Je leert veel meer met data en kaarten werken dan op school.", "bouw, natuur, groen", ["Planoloog: bedenken hoe een stad of wijk wordt ingericht", "Adviseur klimaat en duurzaamheid", "Kaartenmaker met data, bij gemeente of waterschap", "Waterbeheerder bij een waterschap", "Werken in de reisbranche", "Leraar aardrijkskunde"]],
  ["Maatschappijleer en wetenschappen", "Politiek, regels en hoe de samenleving werkt.", "Rechten, bestuurskunde, sociologie, psychologie en sociaal werk.", "Dit vak is een korte kennismaking, de studies zijn veel diepgaander.", "recht, gedrag, sociaal", ["Beleidsmedewerker bij een gemeente of ministerie", "Jurist of advocaat", "Medewerker van een politieke partij of Tweede Kamerlid", "Maatschappelijk werker", "Journalist", "Leraar maatschappijleer"]],
  ["Tekenen, CKV en kunst", "Zelf maken en vormgeven.", "Design, multimedia, architectuur, productontwerp en communicatie.", "Een goede opleiding vraagt ook onderzoek, samenwerken en presenteren.", "design, bouw, techniek", ["Grafisch ontwerper", "Architect of interieurontwerper", "Illustrator of striptekenaar", "Ontwerper van games of animaties", "Fotograaf of videomaker", "Kunstenaar of docent beeldende vorming"]],
  ["Informatica", "Zelf dingen bouwen en uitzoeken.", "Software, data, AI, security. Je kunt er veel mee.", "Op school kies je het vaak niet en de studie is veel breder dan programmeren.", "ict", ["Softwareontwikkelaar", "Specialist digitale beveiliging", "Data-analist", "Ontwikkelaar van games", "ICT-adviseur bij bedrijven", "Specialist in kunstmatige intelligentie"]]
];
// Minder bekende studies, per schoolvak getoond
const NIEUW = [
  // [naam, uitleg, vakken uit VAKKEN waar de studie bij past]
  ["Econometrie", "Economie met veel wiskunde: modellen bouwen om te voorspellen.", ["Wiskunde", "Economie"]],
  ["Actuariële wetenschappen", "Uitrekenen hoeveel risico verzekeraars en pensioenfondsen lopen.", ["Wiskunde", "Economie"]],
  ["Lucht- en ruimtevaarttechniek", "Vliegtuigen, raketten en satellieten ontwerpen.", ["Wiskunde", "Natuurkunde"]],
  ["Maritiem officier", "Varen op grote schepen, als stuurman of als werktuigkundige.", ["Natuurkunde", "Wiskunde", "Aardrijkskunde"]],
  ["Medische beeldvorming (MBRT)", "Scans maken in het ziekenhuis en patiënten bestralen.", ["Natuurkunde", "Biologie"]],
  ["Aardwetenschappen", "Hoe de aarde werkt: gesteenten, vulkanen, bodem en klimaat.", ["Aardrijkskunde", "Natuurkunde", "Scheikunde"]],
  ["Watermanagement", "Zorgen dat Nederland droge voeten en schoon water houdt.", ["Aardrijkskunde", "Natuurkunde", "Biologie"]],
  ["Forensisch onderzoek", "Sporen zoeken en onderzoeken op een plaats delict. Veel lab en praktijk.", ["Scheikunde", "Biologie"]],
  ["Conservering en restauratie", "Kunst en oude voorwerpen onderzoeken en herstellen.", ["Scheikunde", "Tekenen, CKV en kunst", "Geschiedenis"]],
  ["Farmacie", "Hoe medicijnen werken en hoe je ze maakt. Je wordt apotheker.", ["Scheikunde", "Biologie"]],
  ["Mondzorgkunde", "Gebitten gezond houden en behandelen, zelfstandig naast de tandarts.", ["Biologie", "Scheikunde"]],
  ["Voeding en diëtetiek", "Mensen helpen gezonder te eten, ook bij ziekte.", ["Biologie", "Scheikunde"]],
  ["Bio-informatica", "Met programmeren DNA en ziektes onderzoeken.", ["Biologie", "Informatica"]],
  ["Huidtherapie", "Mensen met huidproblemen behandelen, zoals littekens en acne.", ["Biologie"]],
  ["Logopedie", "Mensen helpen met praten, stem, slikken en taal.", ["Nederlands", "Biologie"]],
  ["Ergotherapie", "Mensen helpen om dagelijkse dingen weer zelf te kunnen.", ["Biologie", "Maatschappijleer en wetenschappen"]],
  ["Bos- en natuurbeheer", "Natuurgebieden onderhouden en beschermen. Je bent veel buiten.", ["Biologie", "Aardrijkskunde"]],
  ["Notarieel recht", "Huizenkoop, testamenten en erfenissen juridisch goed regelen.", ["Nederlands", "Economie"]],
  ["Fiscaal recht", "Alles over belastingen: regels uitzoeken en uitleggen.", ["Economie", "Nederlands"]],
  ["Hotelschool", "Gasten ontvangen en een hotel of restaurant leiden.", ["Economie", "Engels en andere talen"]],
  ["Toerisme", "Reizen en vrije tijd organiseren, overal ter wereld.", ["Aardrijkskunde", "Engels en andere talen", "Economie"]],
  ["Taalwetenschap", "Hoe taal werkt in je hoofd en waarom talen zo verschillen.", ["Nederlands", "Engels en andere talen"]],
  ["Tolk Nederlandse Gebarentaal", "Een taal leren met je handen en tolken voor doven.", ["Nederlands", "Engels en andere talen"]],
  ["Japanse of Chinese studies", "Een verre taal leren, en de cultuur en geschiedenis erachter.", ["Engels en andere talen", "Geschiedenis"]],
  ["Criminologie", "Waarom mensen misdaden plegen en hoe je dat voorkomt.", ["Maatschappijleer en wetenschappen", "Nederlands"]],
  ["Filosofie", "Grote vragen stellen over wat waar, goed en eerlijk is.", ["Nederlands", "Maatschappijleer en wetenschappen", "Geschiedenis"]],
  ["Archeologie", "Opgraven en uitzoeken hoe mensen vroeger leefden. Veel veldwerk.", ["Geschiedenis", "Aardrijkskunde"]],
  ["Kunstgeschiedenis", "Kunst bekijken, uitleggen en de verhalen erachter ontdekken.", ["Geschiedenis", "Tekenen, CKV en kunst"]],
  ["Religiewetenschappen", "Hoe geloof mensen en samenlevingen vormt, vroeger en nu.", ["Geschiedenis", "Maatschappijleer en wetenschappen"]],
  ["Culturele antropologie", "Onderzoeken hoe mensen in andere culturen leven. Vaak veldwerk.", ["Maatschappijleer en wetenschappen", "Aardrijkskunde", "Engels en andere talen"]],
  ["Planologie", "Bepalen waar huizen, wegen en natuur komen.", ["Aardrijkskunde", "Maatschappijleer en wetenschappen"]],
  ["Creatieve therapie", "Mensen helpen via tekenen, muziek, drama of bewegen.", ["Tekenen, CKV en kunst", "Maatschappijleer en wetenschappen"]],
  ["Industrieel productontwerpen", "Spullen ontwerpen die mooi zijn en goed werken.", ["Tekenen, CKV en kunst", "Natuurkunde"]],
  ["Interactieontwerp (CMD)", "Apps en websites ontwerpen die mensen makkelijk kunnen gebruiken.", ["Tekenen, CKV en kunst", "Informatica"]],
  ["Game development", "Games bedenken, ontwerpen en programmeren.", ["Informatica", "Tekenen, CKV en kunst"]],
  ["Cybersecurity", "Systemen beveiligen en hackers een stap voor zijn.", ["Informatica", "Wiskunde"]]
];

const STUDIES = [
  // ZORG
  { id: "verpleegkunde", naam: "Verpleegkunde", engels: "Nursing", niveau: ["mbo", "hbo"], gebied: "zorg",
    kort: "Je zorgt voor mensen die ziek of kwetsbaar zijn, in het ziekenhuis, thuis of in een verpleeghuis.",
    doe: "Je leert verzorgen, medicijnen toedienen, samenwerken met artsen en patiënten begeleiden. Veel stage in de praktijk.",
    kanJe: ["Verpleegkundige in het ziekenhuis", "Wijkverpleegkundige", "Verpleegkundig specialist (na een master)", "Leidinggevende in de zorg"],
    let: "mbo-verpleegkunde (mbo-4) en hbo-verpleegkunde zijn verschillende opleidingen. Het hbo is breder en meer gericht op leiding en vernieuwing.",
    praat: "Zou je het erg vinden om ook in de nacht of in het weekend te werken?" },
  { id: "fysio", naam: "Fysiotherapie", engels: "Physiotherapy", niveau: ["hbo"], gebied: "zorg",
    kort: "Je helpt mensen weer te bewegen na een blessure, operatie of bij een chronische klacht.",
    doe: "Je leert hoe het lichaam werkt, mensen onderzoeken, oefeningen opstellen en behandelen met je handen.",
    kanJe: ["Fysiotherapeut in een praktijk", "Sportfysiotherapeut", "Kinderfysiotherapeut", "Fysiotherapeut in een ziekenhuis of revalidatiecentrum"],
    let: "Er zijn veel aanmeldingen en vaak een loting of selectie. Maak een goed plan B.",
    praat: "Wil je liever mensen met een blessure helpen, of mensen die langdurig ziek zijn?" },
  { id: "sport", naam: "Sport & bewegen", engels: "Sports Studies / Human Movement", niveau: ["hbo", "wo"], gebied: "zorg",
    kort: "Je studeert hoe bewegen werkt, hoe je mensen gezond en fit houdt en hoe je sport organiseert of coacht.",
    doe: "Theorie over lichaam en gedrag, plus praktijk: trainen, coachen en projecten voor sportclubs of bedrijven.",
    kanJe: ["Sportcoach of trainer", "Beweegconsulent bij een gemeente", "Leefstijlcoach", "Onderzoeker"],
    let: "Het hbo is sterker in praktijk (coachen). Het wo is sterker in onderzoek naar bewegen.",
    praat: "Zou je ook werk leuk vinden waarin je weinig zelf sport, maar anderen begeleidt?" },

  // BEDRIJF
  { id: "ba", naam: "Bedrijfskunde", engels: "Business Administration", niveau: ["hbo", "wo"], gebied: "bedrijf",
    kort: "Je leert hoe een bedrijf of organisatie werkt: geld, mensen, marketing en strategie.",
    doe: "Vakken als marketing, financiën, organisatie en leiderschap. Veel groepsopdrachten en casussen van echte bedrijven.",
    kanJe: ["Manager of teamleider", "Adviseur", "Ondernemer", "Projectleider"],
    let: "Het is een brede opleiding. Je wordt geen specialist, maar je kunt veel kanten op. Kies later iets waar je goed in bent.",
    praat: "Wat voor bedrijf zou je graag eens van binnen willen zien?" },
  { id: "iba", naam: "Internationaal ondernemen", engels: "International Business (IBA)", niveau: ["hbo", "wo"], gebied: "bedrijf",
    kort: "Bedrijfskunde met de wereld als werkgebied: handelen, verkopen en samenwerken over grenzen heen.",
    doe: "Net als bedrijfskunde, maar Engelstalig, met andere culturen, internationaal recht en handel. Vaak een stuk of semester in het buitenland.",
    kanJe: ["Export- of inkoopmanager", "Internationaal marketeer", "Account manager voor buitenlandse klanten", "Consultant"],
    let: "De opleiding is vaak Engelstalig. Dat vraagt veel van je taalgevoel, ook bij de toetsen.",
    praat: "Zou je een half jaar in het buitenland willen studeren of werken?" },
  { id: "marketing", naam: "Marketing & commerciële economie", engels: "Marketing Management", niveau: ["hbo"], gebied: "bedrijf",
    kort: "Je bedenkt hoe een product bij de juiste klant terechtkomt en waarom iemand het koopt.",
    doe: "Onderzoek naar klanten, campagnes bedenken, social media, verkoop en prijzen bepalen.",
    kanJe: ["Marketeer", "Productmanager", "Accountmanager", "Social media of e-commerce specialist"],
    let: "Marketing is meer cijfers en onderzoek dan alleen creatief zijn.",
    praat: "Waarom koop jij iets? Wat zou jou kunnen overtuigen?" },
  { id: "hrm", naam: "Human Resource Management", engels: "HRM (personeelszaken)", niveau: ["hbo", "wo"], gebied: "bedrijf",
    kort: "Je zorgt dat een organisatie de juiste mensen heeft en dat zij er gezond en gemotiveerd werken.",
    doe: "Werving, ontwikkeling, arbeidsrecht, conflicten oplossen en organisatiecultuur verbeteren.",
    kanJe: ["HR-adviseur", "Recruiter", "Opleidingsadviseur", "HR-manager"],
    let: "Je hebt ook met ontslag en lastige gesprekken te maken. Het is niet alleen gezellig.",
    praat: "Kun je goed omgaan met lastige gesprekken waar je niet iedereen blij mee maakt?" },

  // TECH
  { id: "informatica", naam: "Informatica", engels: "Computer Science", niveau: ["hbo", "wo"], gebied: "tech",
    kort: "Je leert software bouwen en snapt hoe computers, netwerken en data werken.",
    doe: "Programmeren, algoritmes, databases, beveiliging en software ontwerpen. Veel wiskunde en logica, vooral op de universiteit.",
    kanJe: ["Software developer", "Systeemarchitect", "Security specialist", "IT-consultant"],
    let: "Het wo is wiskundig en theoretisch. Het hbo is praktischer en meer gericht op het bouwen van applicaties.",
    praat: "Wat heb je zelf al eens gebouwd of geprogrammeerd?" },
  { id: "datascience", naam: "Data science & AI", engels: "Data Science & Artificial Intelligence", niveau: ["hbo", "wo"], gebied: "tech",
    kort: "Je haalt uit grote hoeveelheden gegevens bruikbare inzichten, en leert computers dingen te laten leren.",
    doe: "Statistiek, programmeren (vaak Python), machine learning en uitleggen wat de uitkomsten betekenen.",
    kanJe: ["Data-analist", "Data scientist", "Machine-learning engineer", "Onderzoeker"],
    let: "Je hebt wiskunde nodig. Meestal is wiskunde B de ingang, vooral op het wo.",
    praat: "Vind je het leuk om in cijfers te zoeken naar een patroon?" },
  { id: "softdev", naam: "Software developer", engels: "Software Developer", niveau: ["mbo"], gebied: "tech",
    kort: "Je leert apps en websites te bouwen, en meteen een vak waarvoor veel werk is.",
    doe: "Programmeren, testen, werken in teams en stage bij een echt bedrijf.",
    kanJe: ["Software developer", "Webontwikkelaar", "App-ontwikkelaar", "Doorstromen naar het hbo-informatica"],
    let: "Je kunt na het mbo ook doorstuderen. Dat staat niets in de weg.",
    praat: "Wil je snel aan het werk, of eerst langer studeren?" },
  { id: "ct", naam: "Creative Technology", engels: "Creative Technology", niveau: ["hbo", "wo"], gebied: "tech",
    kort: "Je bedenkt en bouwt interactieve dingen, zoals een slimme installatie, game of app.",
    doe: "Een mix van programmeren, elektronica en ontwerp. Je werkt in projecten en bouwt prototypes.",
    kanJe: ["Interactieontwerper", "Game developer", "Productontwikkelaar", "Innovatiemanager"],
    let: "Je leert breed en niet heel diep in één vak. Je kracht is dat je verschillende vakgebieden aan elkaar knoopt.",
    praat: "Zou je liever zelf bouwen of bedenken wat er gebouwd moet worden?" },
  { id: "ido", naam: "Industrieel productontwerpen", engels: "Industrial Design Engineering", niveau: ["hbo", "wo"], gebied: "tech",
    kort: "Je ontwerpt fysieke producten, van koptelefoon tot medisch apparaat, en zorgt dat ze werken én mooi zijn.",
    doe: "Schetsen, 3D-modellen, materialen, techniek en gebruikers onderzoeken. Je bouwt prototypes.",
    kanJe: ["Productontwerper", "Innovatieadviseur", "Design engineer", "Productmanager"],
    let: "Je moet technisch kunnen rekenen en ook creatief zijn.",
    praat: "Welk product vind je zo goed bedacht dat je het zelf had willen ontwerpen?" },

  // CREATIEF
  { id: "cmd", naam: "Communicatie & multimediaontwerp", engels: "Communication & Multimedia Design (CMD)", niveau: ["hbo"], gebied: "creatief",
    kort: "Je bedenkt en maakt websites, apps en visuele boodschappen waar mensen iets mee doen.",
    doe: "Ontwerpen, gebruikersonderzoek, front-end bouwen en pitchen. Je werkt in teams aan echte opdrachten.",
    kanJe: ["UX- of UI-designer", "Webdesigner", "Contentmaker", "Creatief concept bedenken"],
    let: "Het is geen opleiding tekenen. Je moet ook onderzoeken, samenwerken en presenteren.",
    praat: "Wat vind je een goed ontworpen app of website, en waarom?" },
  { id: "mediamaker", naam: "Mediamaker", engels: "Media creator / Media Design", niveau: ["mbo"], gebied: "creatief",
    kort: "Je leert foto, video, geluid, grafisch ontwerp en online content maken, vooral in de praktijk.",
    doe: "Veel maken, stage lopen en opdrachten voor echte klanten.",
    kanJe: ["Videomaker of editor", "Grafisch vormgever", "Social media maker", "Doorstromen naar hbo (CMD, Creative Business)"],
    let: "Veel jongeren willen dit en er is concurrentie. Een goed portfolio telt zwaar.",
    praat: "Welk werk van jezelf zou je in een portfolio laten zien?" },
  { id: "mic", naam: "Media, Informatie & Communicatie", engels: "Media, Information & Communication", niveau: ["hbo", "wo"], gebied: "creatief",
    kort: "Je onderzoekt hoe media en informatie werken, en bedenkt hoe je organisaties en mensen bereikt.",
    doe: "Communicatiestrategie, onderzoek, schrijven, social media en journalistiek. Het wo kijkt meer naar onderzoek en maatschappij.",
    kanJe: ["Communicatieadviseur", "Woordvoerder", "Journalist", "Contentstrateeg"],
    let: "Op het hbo gaat het om doen, op het wo om onderzoeken en begrijpen.",
    praat: "Zou je liever zelf schrijven, of de communicatie van een organisatie bedenken?" },
  { id: "creativebiz", naam: "Creative Business", engels: "Creative Business", niveau: ["hbo"], gebied: "creatief",
    kort: "Je combineert creativiteit met ondernemen: hoe maak je van een idee een bedrijf of project?",
    doe: "Ondernemen, marketing, productontwikkeling en projecten voor echte klanten of je eigen onderneming.",
    kanJe: ["Ondernemer", "Productmanager", "Creatief producent", "Marketeer"],
    let: "Een groot deel van de opleiding gaat over de zakelijke kant: geld, plannen en klanten. Niet alleen over maken.",
    praat: "Welk idee van jezelf zou je willen uitproberen?" },

  // MENS
  { id: "psychologie", naam: "Psychologie", engels: "Psychology / Applied Psychology", niveau: ["hbo", "wo"], gebied: "mens",
    kort: "Je leert waarom mensen denken, voelen en doen wat ze doen, en hoe je kunt helpen of onderzoeken.",
    doe: "Op het wo: veel statistiek en onderzoek. Op het hbo (toegepaste psychologie): meer praktijk, adviseren en begeleiden.",
    kanJe: ["Psycholoog (wo, met extra opleiding)", "Hr-adviseur", "Coach of trainer", "Onderzoeker"],
    let: "Veel mensen denken dat psychologie vooral praten is. Het is veel statistiek en onderzoek. Voor klinisch psycholoog is een lange vervolgopleiding nodig.",
    praat: "Wil je mensen helpen, of vooral begrijpen waarom ze dingen doen?" },
  { id: "sw", naam: "Sociaal werk", engels: "Social Work", niveau: ["mbo", "hbo"], gebied: "mens",
    kort: "Je helpt mensen met problemen op het gebied van geld, wonen, opvoeding of werk een plan te maken.",
    doe: "Gesprekken voeren, vertrouwen opbouwen, samenwerken met instanties en veel stage.",
    kanJe: ["Maatschappelijk werker", "Jongerenwerker", "Wijkcoach", "Jeugdzorgwerker"],
    let: "Je krijgt te maken met verdriet en met situaties die je niet allemaal kunt oplossen.",
    praat: "Hoe ga je ermee om als je iemand niet kunt helpen?" },
  { id: "recht", naam: "Rechten", engels: "Law / International Law", niveau: ["hbo", "wo"], gebied: "mens",
    kort: "Je leert hoe regels werken, hoe je geschillen oplost en hoe je een standpunt onderbouwt.",
    doe: "Veel lezen, redeneren en schrijven. Je bestudeert wetten, rechtspraak en doet casusonderzoek.",
    kanJe: ["Advocaat", "Rechter", "Jurist bij overheid of bedrijf", "Compliance- of beleidsadviseur"],
    let: "Je moet veel lezen en onthouden. Het beeld van rechtbankdrama klopt maar voor een klein deel.",
    praat: "Hou je van discussiëren en zoeken naar wat precies bedoeld wordt?" },
  { id: "pabo", naam: "Leraar basisonderwijs", engels: "Primary Education (Pabo)", niveau: ["hbo"], gebied: "mens",
    kort: "Je leert kinderen van 4 tot 12 jaar lezen, rekenen en samenleven.",
    doe: "Didactiek, pedagogiek, vakken voor de basisschool en veel stage in de klas.",
    kanJe: ["Leraar basisschool", "Intern begeleider", "Schoolleider (later)", "Onderwijsadviseur"],
    let: "Er is een tekort aan leraren, dus werk is goed te vinden. Hoe druk het werk voelt, verschilt per school: vraag het leraren op je stage.",
    praat: "Welke leraar heeft indruk op jou gemaakt, en waarom?" },

  // WETEN
  { id: "biomed", naam: "Biomedische wetenschappen", engels: "Biomedical Sciences", niveau: ["wo"], gebied: "weten",
    kort: "Je onderzoekt hoe het menselijk lichaam werkt en hoe ziektes ontstaan, vooral in het lab.",
    doe: "Biologie, scheikunde, anatomie en onderzoek doen. Veel practica en wetenschappelijk schrijven.",
    kanJe: ["Onderzoeker in een lab", "Medewerker bij een farmaceutisch bedrijf", "Beleidsmedewerker gezondheid", "Doorstromen naar geneeskunde of een master"],
    let: "Het is niet hetzelfde als geneeskunde. Je wordt onderzoeker en geen arts.",
    praat: "Vind je het leuk om heel precies te werken en geduld te hebben?" },
  { id: "las", naam: "Liberal Arts & Sciences", engels: "Liberal Arts & Sciences (University College)", niveau: ["wo"], gebied: "weten",
    kort: "Een brede universitaire opleiding waarin je zelf een pakket vakken samenstelt, van natuur tot maatschappij.",
    doe: "Kleinschalig, intensief en vaak op een campus. Je kiest zelf vakken en werkt veel samen met docenten.",
    kanJe: ["Doorstromen naar een master", "Onderzoeker", "Beleidsadviseur", "Consultant"],
    let: "Je moet goed zelf kunnen plannen en kiezen. Er is selectie en het collegegeld is vaak hoger dan bij een gewone bachelor.",
    praat: "Weet je al waar je interesse ligt, of wil je eerst breed kijken?" },
  { id: "biologie", naam: "Biologie & duurzaamheid", engels: "Biology / Future Planet Studies", niveau: ["hbo", "wo"], gebied: "weten",
    kort: "Je onderzoekt natuur, klimaat en leefomgeving, en bedenkt hoe we ermee omgaan.",
    doe: "Natuur- en milieuvakken, veldwerk, lab en data. Soms ook beleid en maatschappij.",
    kanJe: ["Ecoloog", "Milieuadviseur", "Onderzoeker", "Beleidsmedewerker duurzaamheid"],
    let: "De titel Future Planet Studies klinkt als een nieuwe wereld, maar je leert gewoon biologie, aarde en data te combineren.",
    praat: "Wil je binnen of buiten werken?" }
];
