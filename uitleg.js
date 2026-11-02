// Extra uitleg per groep: wat kun je ermee, wat heb je nodig
const VOOROPLEIDING = {
  mbo: "een vmbo-diploma. Met de basisberoepsgerichte leerweg (bb) ga je naar niveau 2, met kader, gemengd of theoretisch kun je naar niveau 3 of 4",
  hbo: "havo, vwo of mbo-4",
  wo: "vwo (of een hbo-propedeuse)",
  ad: "havo, vwo of mbo-4"
};
// Wat je met een mbo-diploma in deze groep kunt worden, en welk vmbo-profiel er goed bij past.
// Bijna elk vmbo-diploma geeft toegang tot het mbo; het profiel is een hulp, geen eis.
const MBO_EXTRA = {
  onderwijs: { kunJe: ["Pedagogisch medewerker in de kinderopvang", "Onderwijsassistent op een basisschool", "Medewerker buitenschoolse opvang (bso)", "Doorstromen naar de pabo (hbo)"], vmbo: "Zorg en welzijn" },
  design: { kunJe: ["Mediavormgever", "Fotograaf of AV-specialist", "Signmaker of drukwerkspecialist", "Interieuradviseur of stylist"], vmbo: "Media, vormgeving en ICT" },
  muziek: { kunJe: ["Podium- en evenemententechnicus", "Medewerker licht en geluid", "Artiest in muziek, dans of theater", "Doorstromen naar een kunstvakopleiding (hbo)"], vmbo: "" },
  talen: { kunJe: ["Medewerker in een museum, archief of bibliotheek", "Medewerker klantenservice met talen", "Toeristisch medewerker", "Doorstromen naar een hbo-opleiding talen"], vmbo: "" },
  gedrag: { kunJe: ["Persoonlijk begeleider", "Medewerker maatschappelijke zorg", "Sociaal werker", "Doorstromen naar toegepaste psychologie (hbo)"], vmbo: "Zorg en welzijn" },
  communicatie: { kunJe: ["Medewerker marketing en communicatie", "Contentmaker voor social media", "Mediamaker", "Medewerker evenementen"], vmbo: "Media, vormgeving en ICT of Economie en ondernemen" },
  economie: { kunJe: ["Financieel administratief medewerker", "Medewerker salarisadministratie", "Assistent-boekhouder", "Medewerker bij een bank of verzekeraar"], vmbo: "Economie en ondernemen" },
  management: { kunJe: ["Teamleider op de werkvloer", "Managementassistent of officemanager", "Medewerker hr", "Ondernemer met een eigen bedrijf"], vmbo: "Economie en ondernemen" },
  marketing: { kunJe: ["Verkoper of winkelmanager", "Accountmanager", "Medewerker marketing", "Medewerker makelaardij of vastgoed"], vmbo: "Economie en ondernemen" },
  recht: { kunJe: ["Juridisch medewerker", "Medewerker bij de gemeente", "Medewerker sociale zekerheid", "Medewerker op een notariskantoor"], vmbo: "Economie en ondernemen" },
  natuur: { kunJe: ["Laborant in een laboratorium", "Analist bij een bedrijf of ziekenhuis", "Operator in de procesindustrie", "Medewerker kwaliteitscontrole"], vmbo: "de gemengde of theoretische leerweg met nask" },
  ict: { kunJe: ["Software developer", "Netwerk- of systeembeheerder", "Medewerker servicedesk", "Medewerker cybersecurity"], vmbo: "Media, vormgeving en ICT" },
  techniek: { kunJe: ["Monteur in elektrotechniek, werktuigbouw of auto's", "Installateur van zonnepanelen of warmtepompen", "Technicus in een fabriek", "Lasser of CNC-verspaner"], vmbo: "Produceren, installeren en energie of Mobiliteit en transport" },
  bouw: { kunJe: ["Timmerman of metselaar", "Uitvoerder op de bouwplaats", "Tekenaar of werkvoorbereider", "Schilder of stukadoor"], vmbo: "Bouwen, wonen en interieur" },
  groen: { kunJe: ["Hovenier of groenvoorziener", "Dierverzorger", "Medewerker in de land- of tuinbouw", "Bloemist"], vmbo: "Groen" },
  zorg: { kunJe: ["Verzorgende IG", "Mbo-verpleegkundige", "Doktersassistent of apothekersassistent", "Tandartsassistent"], vmbo: "Zorg en welzijn" },
  therapie: { kunJe: ["Sport- en bewegingscoördinator", "Fitnesstrainer of instructeur", "Medewerker in een sportschool of zwembad", "Doorstromen naar fysiotherapie of sport (hbo)"], vmbo: "Zorg en welzijn" },
  sociaal: { kunJe: ["Persoonlijk begeleider in de gehandicaptenzorg", "Jongerenwerker", "Begeleider in de maatschappelijke zorg", "Woonbegeleider"], vmbo: "Zorg en welzijn" },
  horeca: { kunJe: ["Kok", "Medewerker bediening of gastheer/gastvrouw", "Receptionist in een hotel", "Facilitair medewerker"], vmbo: "Horeca, bakkerij en recreatie" },
  veilig: { kunJe: ["Beveiliger", "Politieagent (via de politieacademie)", "Militair bij Defensie", "Logistiek medewerker of chauffeur"], vmbo: "Dienstverlening en producten of Mobiliteit en transport" }
};
const FAM_EXTRA = {
  onderwijs: { e: "🍎", kunJe: ["Leraar op de basisschool of middelbare school", "Onderwijskundige of schoolleider", "Begeleider of remedial teacher", "Opleider of trainer in bedrijven"], profiel: "Vaak geen vast profiel, maar je moet goed zijn in taal en rekenen (toets bij de pabo). Voor een tweedegraads lerarenopleiding helpt het als je het vak zelf goed beheerst.", eigen: ["geduldig bent en graag uitlegt", "plezier hebt in kinderen of jongeren", "rustig blijft in een drukke klas"] },
  design: { e: "🎨", kunJe: ["Ontwerper of vormgever", "Art director of creatief concept bedenken", "Maker van film, foto of games", "Interieurontwerper of modeontwerper"], profiel: "Meestal toelating via portfolio of talentselectie. Je profiel is minder belangrijk dan wat je zelf laat zien.", eigen: ["nieuwsgierig bent en doorzet", "tegen kritiek kunt", "zelf veel maakt en oefent"] },
  muziek: { e: "🎭", kunJe: ["Musicus, acteur of danser", "Docent muziek of theater", "Regisseur of producent", "Podium- of festivalwerk"], profiel: "Toelating gaat via een auditie of selectie. De vooropleiding telt minder zwaar.", eigen: ["veel oefent en discipline hebt", "tegen afwijzing kunt", "durft te laten zien wat je maakt"] },
  talen: { e: "📚", kunJe: ["Vertaler of tolk", "Docent of tekstschrijver", "Onderzoeker", "Werken bij musea, uitgeverijen of de overheid"], profiel: "Op het wo meestal vwo. Je moet goed zijn in lezen en schrijven in de taal of het vak dat je kiest.", eigen: ["graag leest en schrijft", "nieuwsgierig bent naar andere culturen", "precies bent met woorden"] },
  gedrag: { e: "🧠", kunJe: ["Psycholoog (na een master en vervolgopleiding)", "Onderzoeker of beleidsmedewerker", "Coach, trainer of HR-adviseur", "Werken bij overheid, zorg of bedrijven"], profiel: "Op het wo meestal vwo. Wiskunde A of B helpt, want er is veel statistiek.", eigen: ["niet opziet tegen statistiek", "nieuwsgierig bent naar mensen", "zelf onderzoek wilt doen"] },
  communicatie: { e: "📣", kunJe: ["Communicatieadviseur of woordvoerder", "Journalist of redacteur", "Contentmaker of social media-specialist", "Marketingcommunicatie"], profiel: "Meestal geen vast profiel. Bij journalistiek is vaak een selectie of schrijfopdracht.", eigen: ["goed kunt schrijven", "nieuwsgierig bent en snel werkt", "makkelijk contact maakt"] },
  economie: { e: "💶", kunJe: ["Accountant of financieel adviseur", "Econoom of analist", "Belastingadviseur", "Werken bij een bank of verzekeraar"], profiel: "Economie en wiskunde (A of B) helpen. Voor wo-economie en econometrie is wiskunde B vaak belangrijk.", eigen: ["goed bent met cijfers", "nauwkeurig werkt", "interesse hebt in geld en hoe bedrijven werken"] },
  management: { e: "🧩", kunJe: ["Manager of teamleider", "Adviseur of consultant", "Ondernemer", "Projectleider"], profiel: "Meestal geen vast profiel. Economie en wiskunde A helpen. Bij Engelstalige varianten wordt je Engels getoetst.", eigen: ["graag samenwerkt en organiseert", "durft te presenteren", "de leiding durft te nemen"] },
  marketing: { e: "🛍️", kunJe: ["Marketeer of merkmanager", "Accountmanager of verkoper", "Productmanager", "E-commerce-specialist"], profiel: "Geen vast profiel. Economie of wiskunde A kan helpen.", eigen: ["creatief bent én graag analyseert", "graag met klanten omgaat", "het leuk vindt om mensen te overtuigen"] },
  recht: { e: "⚖️", kunJe: ["Advocaat of rechter (met vervolgopleiding)", "Jurist bij overheid of bedrijf", "Beleidsadviseur", "Notaris of belastingadviseur (na een master)"], profiel: "Geen vast profiel, maar je moet veel lezen en goed redeneren. Op het wo is vwo gebruikelijk.", eigen: ["veel kunt lezen en onthouden", "graag argumenten bedenkt", "precies werkt"] },
  natuur: { e: "🔬", kunJe: ["Onderzoeker", "Labmedewerker", "Docent natuurwetenschappen", "Adviseur bij overheid of industrie"], profiel: "Vaak een natuurprofiel (N&T of N&G). Voor natuurkunde, scheikunde en wiskunde is wiskunde B meestal nodig.", eigen: ["doorzet", "nauwkeurig werkt", "graag uitzoekt waarom iets zo is"] },
  ict: { e: "💻", kunJe: ["Software developer", "Data-analist of data scientist", "Security specialist", "Systeembeheerder of IT-consultant"], profiel: "Wiskunde wordt vaak gevraagd (A, B of C). Voor het wo vaak wiskunde B. Voor het hbo kan ook mbo-ICT.", eigen: ["logisch nadenkt", "geduld hebt bij het zoeken naar fouten", "dingen zelf wilt uitproberen"] },
  techniek: { e: "⚙️", kunJe: ["Ingenieur of ontwerper", "Technisch adviseur", "Productiemanager", "Onderzoeker in de industrie"], profiel: "Op het wo meestal N&T met wiskunde B. Voor het hbo ook N&G, of mbo-techniek.", eigen: ["praktisch en nieuwsgierig bent", "het leuk vindt om te rekenen en te bouwen", "graag in een project samenwerkt"] },
  bouw: { e: "🏗️", kunJe: ["Architect of bouwkundig ontwerper", "Constructeur of projectleider", "Planoloog of stedenbouwkundige", "Uitvoerder op de bouw"], profiel: "Een natuurprofiel helpt, voor het wo vaak wiskunde B. Voor hbo ook mbo-bouw.", eigen: ["ruimtelijk inzicht hebt", "graag tekent en ontwerpt", "praktisch denkt"] },
  groen: { e: "🌱", kunJe: ["Ecoloog of natuurbeheerder", "Adviseur duurzaamheid of landbouw", "Agrarisch ondernemer", "Dierverzorger of dierenarts (met selectie)"], profiel: "Een natuurprofiel helpt. Voor het hbo ook mbo-groen. Diergeneeskunde heeft selectie.", eigen: ["graag buiten werkt", "goed zorgt voor dieren of planten", "praktisch bent"] },
  zorg: { e: "🩺", kunJe: ["Verpleegkundige", "Arts, tandarts of apotheker (wo)", "Verloskundige", "Medisch of laboratoriumtechnicus"], profiel: "Meestal Natuur & Gezondheid (N&G) of N&T. Geneeskunde, tandheelkunde en verloskunde hebben vaak loting of selectie.", eigen: ["meeleeft en verantwoordelijkheid neemt", "tegen stress en onregelmatige uren kunt", "netjes en precies werkt"] },
  therapie: { e: "🏃", kunJe: ["Fysiotherapeut", "Ergotherapeut of logopedist", "Sportcoach of leefstijlcoach", "Diëtist"], profiel: "Natuur & Gezondheid of N&T helpt. Er zijn vaak veel aanmeldingen, dus selectie of loting.", eigen: ["graag met mensen omgaat", "geduldig bent", "plezier hebt in bewegen en gezondheid"] },
  sociaal: { e: "🤝", kunJe: ["Maatschappelijk werker", "Jeugdzorgwerker", "Wijkcoach of jongerenwerker", "Begeleider in de gehandicaptenzorg"], profiel: "Geen vast profiel. Mbo-4, havo of vwo.", eigen: ["goed kunt luisteren", "grenzen kunt stellen", "tegen een stootje kunt"] },
  horeca: { e: "🏨", kunJe: ["Hotelmanager of restaurantmanager", "Eventplanner", "Reisadviseur", "Facility manager"], profiel: "Geen vast profiel. Talen en klantgerichtheid helpen. Vaak veel stage in de praktijk.", eigen: ["gastvrij en flexibel bent", "graag organiseert", "het niet erg vindt te werken als anderen vrij zijn"] },
  veilig: { e: "🛡️", kunJe: ["Beveiligingsadviseur", "Politie of defensie (met selectie)", "Logistiek manager", "Piloot of scheepsofficier (met selectie)"], profiel: "Politie, defensie en luchtvaart hebben strenge selecties (gezondheid, conditie). Logistiek en beveiliging zijn toegankelijker.", eigen: ["alert bent en verantwoordelijkheid neemt", "fit en gezond bent", "rustig blijft onder druk"] }
};

// Wat heb je nodig, per uitgelichte studie
const STUDIE_NODIG = {
  verpleegkunde: "Mbo-4 of hbo: havo of mbo-4. Natuur & Gezondheid helpt. Je moet tegen nachtdiensten, ziekte en verdriet kunnen.",
  fysio: "Havo of vwo (of mbo-4 met extra eisen). Natuur & Gezondheid of N&T. Er is vaak selectie of loting. Goed zijn in bewegen helpt niet, maar je moet wel gemotiveerd zijn voor veel anatomie.",
  sport: "Havo of vwo. Geen vast profiel, wel conditie en belangstelling voor bewegen. Soms een sporttest.",
  ba: "Havo of vwo. Geen vast profiel. Economie en wiskunde A helpen. Je moet goed kunnen samenwerken en presenteren.",
  iba: "Havo of vwo. Goed Engels: de opleiding is Engelstalig. Soms een taaltest of motivatiegesprek.",
  marketing: "Havo, vwo of mbo-4. Geen vast profiel. Economie of wiskunde A helpt.",
  hrm: "Havo, vwo of mbo-4. Goed met mensen kunnen praten en je kunt omgaan met vertrouwelijke dingen.",
  informatica: "Hbo: havo, vwo of mbo-ICT. Wo: vwo met wiskunde B (soms wiskunde A of C volstaat). Je moet logisch kunnen denken.",
  datascience: "Wiskunde A of B, voor het wo meestal wiskunde B. Programmeren leer je op de opleiding. Doorzetten bij moeilijke wiskunde.",
  softdev: "Mbo: vmbo-diploma (voor mbo-4 vaak vmbo tl of kader). Je hoeft nog niet te kunnen programmeren, wel logisch denken.",
  ct: "Wiskunde A, B of C; soms aanvullende toets of motivatiebrief. Je moet zowel techniek als bedenken leuk vinden.",
  ido: "Meestal N&T met wiskunde B voor het wo. Voor het hbo ook N&G of mbo-techniek. Tekenen of ontwerpen helpt, je krijgt het ook geleerd.",
  cmd: "Havo, vwo of mbo-4. Geen vast profiel. Vaak een motivatie- of portfolio-opdracht. Je moet kunnen samenwerken.",
  mediamaker: "Vmbo-diploma, vaak een intakegesprek of portfolio. Plezier in zelf maken is belangrijker dan een mooie vooropleiding.",
  mic: "Havo of vwo. Geen vast profiel. Goed kunnen schrijven en lezen.",
  creativebiz: "Havo, vwo of mbo-4. Vaak een motivatie en een idee. Je moet creatief zijn én durven te ondernemen.",
  psychologie: "Wo: vwo, wiskunde A of B helpt voor de statistiek. Hbo: havo, vwo of mbo-4. Veel lezen en leren van onderzoek.",
  sw: "Mbo-4 of havo. Geen vast profiel. Ervaring met vrijwilligerswerk of bijbaantjes in de zorg of jeugdwerk helpt.",
  recht: "Wo: vwo, geen vast profiel. Veel lezen en schrijven, vaak een BSA waarbij je minstens 45 van de 60 punten moet halen in het eerste jaar.",
  pabo: "Havo, vwo of mbo-4 (mbo-4 met extra vakken). Toets op taal en rekenen vóór of tijdens de opleiding.",
  biomed: "Vwo met natuurprofiel (N&G of N&T). Wiskunde en scheikunde helpen. Soms een extra toets of selectie.",
  las: "Vwo, vaak selectie met motivatiebrief en gesprek. Je moet zelf kunnen plannen en kiezen.",
  biologie: "Hbo: havo of mbo-groen. Wo: vwo met natuurprofiel. Buiten werken, lab en data allemaal mogelijk."
};

// Woordenlijst
// Moeilijke woorden: [thema, woord, uitleg]
const WOORDEN = [
  ["studie", "Bachelor", "De eerste opleiding op hbo of wo. Duur: 4 jaar (hbo) of 3 jaar (wo)."],
  ["studie", "Master", "Een vervolgopleiding na je bachelor, meestal 1 of 2 jaar. Voor sommige beroepen heb je er een nodig, zoals psycholoog."],
  ["studie", "ECTS (studiepunten)", "De ‘munteenheid’ van studeren. 60 punten is een jaar fulltime studeren. Een bachelor op het hbo is 240, op het wo 180."],
  ["studie", "Associate degree (AD)", "Een hbo-opleiding van 2 jaar met een eigen hbo-diploma. Veel Ad's zijn bedoeld voor mensen die al werken (deeltijd of duaal); een deel kun je ook voltijd volgen. Daarna kun je werken of doorstromen naar de bachelor."],
  ["studie", "Propedeuse", "Het eerste jaar van je hbo- of wo-opleiding. Als je dit haalt, krijg je een getuigschrift."],
  ["studie", "BSA (bindend studieadvies)", "Haal je in het eerste jaar te weinig punten, dan moet je stoppen met de opleiding. Meestal 45 van de 60 punten op het hbo."],
  ["toelating", "Numerus fixus, loting, selectie", "Een opleiding heeft maar beperkte plekken. Je wordt toegelaten via een loting, of via selectie (brief, gesprek, test)."],
  ["school", "Profiel (N&T, N&G, E&M, C&M)", "Je profielkeuze op havo of vwo: Natuur & Techniek, Natuur & Gezondheid, Economie & Maatschappij, Cultuur & Maatschappij. Sommige studies eisen een bepaald profiel."],
  ["kiezen", "Hogeschool of universiteit", "Hogeschool (hbo) is praktijkgericht voor een beroep. Universiteit (wo) is theoretisch en gericht op onderzoek."],
  ["kiezen", "Voltijd, deeltijd, duaal", "Voltijd is fulltime studeren. Deeltijd is naast je werk of gezin. Duaal is combineren van een opleiding met een betaalde baan."],
  ["studie", "Minor", "Een half jaar waarin je iets anders kiest dan je studie: een ander vak, een andere stad of het buitenland."],
  ["studie", "Stage", "Werken bij een echt bedrijf of instelling als onderdeel van je studie. Op het hbo vaak 3 maanden tot een half jaar."],
  ["kiezen", "Meeloopdag, open dag, proefstuderen", "Je loopt een dag mee met studenten of bezoekt de school. Met één dag weet je vaak al of een opleiding bij je past."],
  ["kiezen", "Doorstromen", "Van mbo naar hbo, of van hbo naar wo. Het kan, soms met een extra schakeljaar of toets."],
  ["kiezen", "Accreditatie", "Een officiële goedkeuring dat een opleiding aan de kwaliteitseisen voldoet. Alleen dan krijg je een erkend diploma."],
  ["geld", "Studiefinanciering en collegegeld", "Je betaalt collegegeld, en kunt een beurs en lening krijgen via DUO. De regels veranderen, dus check de actuele bedragen op duo.nl."],
  ["school", "LOB", "Loopbaanoriëntatie en -begeleiding. Lessen, opdrachten en gesprekken op school die je helpen ontdekken wat bij je past en wat je na school wilt doen."],
  ["school", "Decaan", "De vaste persoon op school voor je studie- en beroepskeuze. De hulp is gratis: loop gewoon binnen, ook als je ouders niet kunnen helpen."],
  ["school", "Mentor", "Je eerste aanspreekpunt in de klas. Weet hoe het met je gaat en denkt mee over keuzes."],
  ["school", "LOB-portfolio of loopbaandossier", "Een map, vaak digitaal, waarin je bijhoudt wat je ontdekt: testen, open dagen, meeloopdagen en gesprekken."],
  ["school", "PWS (profielwerkstuk)", "Een groot onderzoek in je examenjaar op havo of vwo. Een eerste voorproefje van hoe studeren voelt."],
  ["school", "PTA", "Programma van Toetsing en Afsluiting: het overzicht van alle toetsen die meetellen voor je schoolexamen."],
  ["school", "SE en CE", "Schoolexamen (toetsen van je eigen school) en centraal examen (het landelijke eindexamen). Samen bepalen ze je eindcijfer."],
  ["school", "Leerplicht", "Je moet naar school tot en met het einde van het schooljaar waarin je 16 wordt. Daarna begint de kwalificatieplicht."],
  ["school", "Kwalificatieplicht", "Na de leerplicht moet je blijven leren tot je 18 bent of een startkwalificatie hebt. Alleen werken mag dan nog niet, maar werken en leren tegelijk (bbl) wel."],
  ["school", "Startkwalificatie", "Een diploma havo, vwo of mbo niveau 2 of hoger. Een vmbo-diploma is geen startkwalificatie. Met een startkwalificatie heb je meer kans op vast werk."],
  ["school", "Leerplichtambtenaar", "Iemand van je gemeente die let op de leerplicht en de kwalificatieplicht. Denk je erover te stoppen met school? Dan kan hij of zij ook met je meedenken over wat wél past."],
  ["school", "Leerweg (vmbo)","Het vmbo heeft vier leerwegen: basis, kader, gemengd en theoretisch. Je leerweg bepaalt mee waar je daarna heen kunt."],
  ["kiezen", "Studiekeuzecheck (matching)", "Een opdracht, vragenlijst of gesprek na je aanmelding bij een hbo- of wo-opleiding. Het is een advies, geen examen."],
  ["kiezen", "Studielink", "De landelijke website waar je je aanmeldt voor het hbo en wo. Je logt in met je DigiD."],
  ["kiezen", "DigiD", "Je digitale identiteit bij de overheid. Nodig voor Studielink en DUO. Aanvragen duurt een paar dagen, want je krijgt een code per post."],
  ["kiezen", "Intake (mbo)", "Een kennismakingsgesprek na je aanmelding bij een mbo-opleiding. Over wie je bent en wat je wilt; geen examen."],
  ["toelating", "Toelatingsrecht (mbo)", "Meld je je vóór 1 april aan voor een mbo-opleiding, dan moet de school je in principe toelaten als je aan de eisen voldoet."],
  ["toelating", "Vooropleidingseis", "Het diploma en soms de vakken die je nodig hebt om te mogen beginnen."],
  ["toelating", "Deficiëntie", "Je mist een vak dat de opleiding vraagt. Vaak kun je het nog wegwerken, bijvoorbeeld met een cursus of een toets."],
  ["toelating", "Portfolio en auditie", "Bewijs van wat je kunt: een map met werk of een optreden. Bij kunst, muziek, dans en ontwerp vaak verplicht."],
  ["toelating", "21+-toets", "Een toelatingstoets voor wie 21 jaar of ouder is en niet de juiste vooropleiding heeft."],
  ["studie", "SLB (studieloopbaanbegeleiding)", "De LOB van het hbo en wo: een docent die met je meekijkt hoe het gaat en wat je wilt."],
  ["studie", "Hoorcollege en werkcollege", "Bij een hoorcollege geeft een docent les aan een grote zaal. Bij een werkcollege oefen en bespreek je in een kleine groep."],
  ["studie", "Tentamen en herkansing", "Een tentamen is een toets op het hbo of wo. Haal je hem niet, dan krijg je meestal een herkansing."],
  ["studie", "Major", "Het hoofdvak of de hoofdrichting van je opleiding. Daarnaast kies je vaak een minor."],
  ["studie", "Honours", "Een extra, uitdagender programma voor studenten die meer willen dan de gewone opleiding."],
  ["studie", "Scriptie en afstuderen", "Het laatste grote onderzoek of project van je opleiding."],
  ["studie", "Pre-master of schakelprogramma", "Een extra programma waarmee je na een hbo-bachelor kunt instromen in een wo-master."],
  ["studie", "Studentendecaan", "De vertrouwenspersoon van je hogeschool of universiteit, bijvoorbeeld bij ziekte, geldzorgen of twijfels over stoppen."],
  ["studie", "Bol en bbl", "Twee manieren om een mbo-opleiding te volgen. Bol: vooral naar school, met stages. Bbl: vooral werken bij een bedrijf, één dag per week naar school."],
  ["studie", "BPV", "Beroepspraktijkvorming: zo heet de stage op het mbo."],
  ["studie", "Crebo", "Het officiële nummer van een mbo-opleiding. Handig om dezelfde opleiding bij verschillende scholen terug te vinden."],
  ["geld", "DUO", "Dienst Uitvoering Onderwijs: de overheidsdienst voor studiefinanciering, het studentenreisproduct en je diploma's."],
  ["geld", "Aanvullende beurs", "Extra geld van DUO als je ouders weinig verdienen. Je hoeft het niet terug te betalen als je je diploma op tijd haalt."],
  ["geld", "Lesgeld (mbo)", "Op het mbo betaal je lesgeld vanaf je 18e als je een bol-opleiding doet. Bij bbl betaal je cursusgeld."],
  ["geld", "Studentenreisproduct", "Gratis of met korting reizen met het ov tijdens je studie. Je vraagt het aan bij DUO."],
  ["geld", "Huurtoeslag", "Geld van de overheid voor je huur. Alleen voor woonruimte met een eigen voordeur, keuken en wc, dus voor de meeste studentenkamers niet."],
  ["school", "Studiekeuzebegeleiding", "Hulp bij het kiezen van een vervolgopleiding: lessen en gesprekken op school (LOB), bij de decaan of bij een loopbaancoach."],
  ["school", "Loopbaangesprek", "Een gesprek met je mentor of decaan over wat je kunt, wat je wilt en welke stap daarbij past. Vaak samen met je ouders."],
  ["kiezen", "Studiekeuzetest of beroepentest", "Een vragenlijst die laat zien welke richtingen bij je passen. Een startpunt voor een gesprek, geen eindoordeel. De Padvinder op deze site is er een."],
  ["kiezen", "Studiekeuzeadvies", "Het advies dat je krijgt na een studiekeuzecheck. Het is meestal niet bindend: ook bij een negatief advies mag je vaak gewoon beginnen."],
  ["kiezen", "Studiekeuzeactiviteit", "Verzamelnaam voor alles wat je doet om te kiezen: open dagen, meeloopdagen, proefstuderen en workshops."],
  ["kiezen", "Loopbaancoach", "Een professionele begeleider die je helpt kiezen. Kost vaak geld; de decaan op school helpt je gratis."],
  ["kiezen", "Oriëntatiejaar", "Een jaar om rustig uit te zoeken wat je wilt, met korte cursussen, werk of vrijwilligerswerk."],
  ["kiezen", "Voorlichting", "Informatie van een opleiding zelf: open dagen, voorlichtingsavonden en online sessies."],
  ["kiezen", "Doorstroomprogramma", "Extra lessen of begeleiding om goed over te stappen naar een volgende opleiding, bijvoorbeeld van mbo naar hbo."],
  ["studie", "Switchen", "Overstappen naar een andere opleiding. Heel normaal: veel studenten kiezen na het eerste jaar iets anders."]
];

// Engelse naam -> letterlijke vertaling -> wat het echt is
const VERTAAL = [
  ["Creative Technology", "Creatieve technologie", "Slimme dingen bedenken en bouwen", "Je bouwt interactieve producten, zoals een game, een slimme lamp of een app. Een mix van techniek en ontwerpen."],
  ["Business Administration", "Bedrijfsbeheer", "Bedrijfskunde", "Hoe een bedrijf werkt: geld, mensen, markt en strategie."],
  ["Communication & Multimedia Design", "Communicatie- en multimediaontwerp", "Websites en apps ontwerpen", "Je bedenkt en maakt websites, apps en beelden waar mensen iets mee doen."],
  ["Liberal Arts & Sciences", "Vrije kunsten en wetenschappen", "Zelf je vakken samenstellen", "Een brede universitaire opleiding waarin je zelf kiest wat je leert, van natuur tot maatschappij."],
  ["Facility Management", "Beheer van voorzieningen", "Gebouwen en diensten regelen", "Je zorgt dat een gebouw goed werkt: schoonmaak, catering, veiligheid en ruimte."],
  ["Human Resource Management", "Beheer van ‘menselijke middelen’", "Personeelszaken", "Je zorgt dat een organisatie de juiste mensen heeft en dat zij gezond en gemotiveerd werken."],
  ["Mechatronics", "Mechatronica: mechanica + elektronica", "Robots en slimme machines", "Mechanica, elektronica en software tegelijk. Denk aan robots, drones en slimme productiemachines."],
  ["Cyber Security", "Digitale beveiliging", "Computers en data beschermen", "Je beschermt systemen en gegevens tegen hackers en snapt hoe aanvallen werken."],
  ["Applied Data Science & AI", "Toegepaste datawetenschap en kunstmatige intelligentie", "Data en slimme computers", "Je haalt inzichten uit data en laat computers dingen leren. Veel programmeren en statistiek."],
  ["Industrial Design Engineering", "Industrieel ontwerp en techniek", "Producten ontwerpen", "Je ontwerpt producten die werken én mooi zijn, van koptelefoon tot medisch apparaat."],
  ["Sports Management", "Sportbeheer", "Sportorganisaties leiden", "Je organiseert sport, evenementen en clubs. Meer bedrijfskunde dan zelf sporten."],
  ["Logistics Engineering", "Logistieke techniek", "Goederenstromen organiseren", "Hoe komt iets van een fabriek naar jouw huis? Dat ontwerp en regel je."]
];

// Opleidingen die officieel (DUO) alleen een Engelse naam hebben -> Nederlandse vertaling.
// Bij de andere opleidingen staat de Engelse naam in de DUO-data naast de Nederlandse.
const ENGELSE_NAAM_NL = {
  "Advanced Technology": "Geavanceerde technologie",
  "African Studies": "Afrikastudies",
  "Allround Creative Concept Developer": "Allround ontwikkelaar van creatieve concepten",
  "American Studies": "Amerikanistiek",
  "Animal Sciences": "Dierwetenschappen",
  "Applied Data Science & Artificial Intelligence": "Toegepaste datawetenschap en kunstmatige intelligentie",
  "Applied Mathematics": "Technische wiskunde",
  "Applied Science": "Toegepaste natuurwetenschappen",
  "Artificial Intelligence": "Kunstmatige intelligentie",
  "Arts & Crafts": "Kunst en ambacht",
  "Aviation": "Luchtvaart",
  "Bachelor of Business Administration": "Bedrijfskunde (bachelor)",
  "Bachelor of Business Administration in Fashion": "Bedrijfskunde in de mode (bachelor)",
  "Bachelor of Nursing": "Verpleegkunde (bachelor)",
  "Bachelor of Science in Osteopathie": "Osteopathie (bachelor)",
  "Biology": "Biologie",
  "Brain Science": "Hersenwetenschap",
  "Business & Innovation": "Ondernemen en vernieuwen",
  "Business Administration": "Bedrijfskunde",
  "Business Administration Entrepreneurship": "Bedrijfskunde en ondernemerschap",
  "Business Analytics": "Bedrijfsanalyse met data",
  "Business Engineering": "Bedrijfskunde en techniek",
  "Business Information Technology": "Bedrijfsinformatica",
  "Business Innovation": "Bedrijfsvernieuwing",
  "Business IT & Management": "Bedrijfskundige informatica",
  "Business Management": "Bedrijfsmanagement",
  "Business Psychology": "Bedrijfspsychologie",
  "Business Studies": "Bedrijfsstudies",
  "Chemistry": "Scheikunde",
  "Circular Engineering": "Circulaire techniek",
  "Circus and Performance Art": "Circus- en podiumkunst",
  "Circus Arts": "Circuskunsten",
  "Civil Engineering": "Civiele techniek",
  "Cognition, Language and Communication": "Denken, taal en communicatie",
  "Cognitive Science and Artificial Intelligence": "Cognitiewetenschap en kunstmatige intelligentie",
  "Computational Social Science": "Computationele sociale wetenschap",
  "Computer Science": "Informatica",
  "Computing Science": "Informatica",
  "Creative Business": "Creatief ondernemen",
  "Creative Media": "Creatieve media",
  "Creative Media and Game Technologies": "Creatieve media en gametechnologie",
  "Creative Media Professional": "Creatieve mediaprofessional",
  "Creative Technology": "Creatieve technologie",
  "Cyber Safety & Security": "Digitale veiligheid en beveiliging",
  "Cybersecurity & Cybercrime": "Digitale beveiliging en cybercriminaliteit",
  "Data Analytics": "Data-analyse",
  "Data Science (joint degree)": "Datawetenschap (gezamenlijke opleiding)",
  "Data Science and Artificial Intelligence": "Datawetenschap en kunstmatige intelligentie",
  "Data Science and Society": "Datawetenschap en samenleving",
  "Data Science for Global Challenges": "Datawetenschap voor wereldwijde vraagstukken",
  "Design": "Ontwerpen",
  "Digital Society": "Digitale samenleving",
  "Digital Transformation Management": "Digitale verandering in organisaties",
  "Econometrics and Data Science": "Econometrie en datawetenschap",
  "Economics and Business Economics": "Economie en bedrijfseconomie",
  "Electrical Engineering": "Elektrotechniek",
  "Electronic Music": "Elektronische muziek",
  "Embedded Systems Engineering": "Ingebouwde systemen (embedded systems)",
  "Engineering": "Techniek",
  "English Language and Culture": "Engelse taal en cultuur",
  "Entrepreneurship & Innovation": "Ondernemerschap en vernieuwing",
  "Entrepreneurship and Business Innovation": "Ondernemerschap en bedrijfsvernieuwing",
  "Environmental Sciences": "Milieuwetenschappen",
  "European Law School": "Europees recht",
  "European Public Health": "Europese volksgezondheid",
  "European Studies": "Europese studies",
  "Event & Experience Management": "Evenementen en beleving organiseren",
  "Facility Management": "Facilitair management",
  "Fashion Business Professional": "Modebedrijfskunde",
  "Finance": "Financiën",
  "Finance & Control": "Financiën en control",
  "Finance, Tax and Advice": "Financiën, belasting en advies",
  "Financial Business Management": "Financieel management",
  "Financial Services Management": "Financiële dienstverlening",
  "Food": "Voeding",
  "Food and Business": "Voeding en ondernemen",
  "Food Commerce & Technology": "Voedingshandel en -technologie",
  "Food Innovation": "Voedingsvernieuwing",
  "Food Technology": "Levensmiddelentechnologie",
  "Food, Business & Innovation": "Voeding, ondernemen en vernieuwen",
  "Frontend Design & Development": "Ontwerpen en bouwen van websites en apps (frontend)",
  "Future Planet Studies": "Toekomst van de aarde",
  "Geo Maps & Data": "Kaarten en geodata",
  "Global Law": "Internationaal recht",
  "Global Project and Change Management": "Internationaal project- en veranderingsmanagement",
  "Global Responsibility and Leadership": "Wereldwijde verantwoordelijkheid en leiderschap",
  "Global Studies": "Wereldstudies",
  "Global Sustainability Science": "Wereldwijde duurzaamheidswetenschap",
  "Health & Social Work": "Zorg en sociaal werk",
  "Hotel & Event Management": "Hotel- en evenementenmanagement",
  "Human Geography and Planning": "Sociale geografie en planologie",
  "Human Resource Management": "Personeelszaken (HRM)",
  "ICT Internet of Things": "ICT en slimme apparaten (Internet of Things)",
  "ICT Service Management": "ICT-beheer",
  "Industrial Design": "Industrieel ontwerpen",
  "Industrial Design Engineering": "Industrieel productontwerpen",
  "Information Security": "Informatiebeveiliging",
  "Interdisciplinary Arts": "Interdisciplinaire kunsten",
  "Interior Design": "Interieurontwerp",
  "International and European Law": "Internationaal en Europees recht",
  "International Bachelor's Programme in Communication and Media": "Communicatie en media (internationale bachelor)",
  "International Business": "Internationaal ondernemen",
  "International Business & Entrepreneurship": "Internationaal ondernemen en ondernemerschap",
  "International Business Administration": "Internationale bedrijfskunde",
  "International Business Management": "Internationaal bedrijfsmanagement",
  "International Development Management": "Internationale ontwikkelingssamenwerking",
  "International Event Management": "Internationaal evenementenmanagement",
  "International Food & Agribusiness": "Internationale voedings- en landbouwbedrijven",
  "International Hotel and Hospitality Management": "Internationaal hotel- en gastvrijheidsmanagement",
  "International Land and Water Management": "Internationaal land- en waterbeheer",
  "International Studies": "Internationale studies",
  "International Teacher Education for Primary Schools (ITEps)": "Internationale pabo (leraar basisonderwijs)",
  "International Teacher Education for Secondary Schools": "Internationale lerarenopleiding voortgezet onderwijs",
  "International Tourism Management": "Internationaal toerismemanagement",
  "IT Service Management": "IT-beheer",
  "Law in Society": "Recht in de samenleving",
  "Learning and Development in Organisations": "Leren en ontwikkelen in organisaties",
  "Leisure & Events Management": "Vrijetijds- en evenementenmanagement",
  "Liberal Arts and Sciences": "Brede bachelor: vrije kunsten en wetenschappen",
  "Liberal Arts and Sciences (joint degree)": "Brede bachelor: vrije kunsten en wetenschappen (gezamenlijke opleiding)",
  "Life Science and Technology": "Levenswetenschappen en technologie",
  "Life Science and Technology (joint degree)": "Levenswetenschappen en technologie (gezamenlijke opleiding)",
  "Logistics Engineering": "Logistieke techniek",
  "Logistics Management": "Logistiek management",
  "Management": "Management",
  "Management Payroll Services": "Salarisadministratie",
  "Management, Society and Technology": "Bestuur, samenleving en technologie",
  "Marine Sciences": "Zeewetenschappen",
  "Marketing": "Marketing",
  "Marketing Management": "Marketingmanagement",
  "Mathematics": "Wiskunde",
  "Mechanical Engineering": "Werktuigbouwkunde",
  "Media Design": "Mediavormgeving",
  "Minorities & Multilingualism": "Minderheden en meertaligheid",
  "Molecular and Biophysical Life Sciences": "Moleculaire en biofysische levenswetenschappen",
  "Molecular Life Sciences": "Moleculaire levenswetenschappen",
  "Molecular Science and Technology (joint degree)": "Moleculaire wetenschap en technologie (gezamenlijke opleiding)",
  "Natural Sciences": "Natuurwetenschappen",
  "Online Marketing": "Onlinemarketing",
  "Philosophy, Politics and Economics": "Filosofie, politiek en economie",
  "Physiotherapy and Rehabilitation sciences": "Fysiotherapie en revalidatiewetenschappen",
  "Politics, Psychology, Law and Economics": "Politiek, psychologie, recht en economie",
  "Popular Culture": "Populaire cultuur",
  "Psychology & Technology": "Psychologie en technologie",
  "Regenerative Medicine and Technology": "Regeneratieve geneeskunde en technologie",
  "Retail Management": "Winkelmanagement (retail)",
  "Science for Sustainable Societies": "Wetenschap voor een duurzame samenleving",
  "Science, Business & Innovation": "Wetenschap, ondernemen en vernieuwen",
  "Science, Technology & Innovation": "Wetenschap, technologie en vernieuwing",
  "Security Management": "Veiligheidsmanagement",
  "Security Studies": "Veiligheidsstudies",
  "Smart Media Production": "Slimme mediaproductie",
  "Smart Technology": "Slimme technologie",
  "Social Work": "Sociaal werk",
  "Software Development": "Softwareontwikkeling",
  "Software Development and Testing (joint degree)": "Software ontwikkelen en testen (gezamenlijke opleiding)",
  "Software Engineer": "Software-engineer",
  "Soil, Water, Atmosphere": "Bodem, water en atmosfeer",
  "Spatial Planning and Design": "Ruimtelijke planning en ontwerp",
  "Sustainable Bioscience": "Duurzame biowetenschap",
  "Technical Computer Science": "Technische informatica",
  "Technology and Liberal Arts & Sciences": "Brede bachelor: technologie, vrije kunsten en wetenschappen",
  "Tourism (joint degree)": "Toerisme (gezamenlijke opleiding)",
  "Tourism and Event Management": "Toerisme- en evenementenmanagement",
  "Tourism Management": "Toerismemanagement",
  "Urban Studies": "Stadsstudies",
  "Urban Sustainability Studies (joint degree)": "Duurzame steden (gezamenlijke opleiding)",
  "Allround Assistant Business Services": "Allround zakelijk medewerker",
  "Allround make-up and hair artist": "Allround visagist en haarstylist",
  "Assistant Business Services": "Zakelijk medewerker",
  "Assistant Fashion Tailor": "Assistent kleermaker",
  "Aviation operations specialist": "Specialist luchtvaartoperaties",
  "Business Administration & Control Specialist": "Specialist administratie en control",
  "Expert IT systems and devices": "Expert IT-systemen en apparaten",
  "Fashion Designer": "Modeontwerper",
  "Fashion Product Coordinator": "Coördinator modeproducten",
  "Fashion Retailer": "Verkoper in de mode",
  "Fashion Tailor": "Kleermaker",
  "Legal, Insurance & HR Services Specialist": "Specialist juridische zaken, verzekeringen en personeel",
  "Management assistant": "Managementassistent",
  "Marketing & Communication Specialist": "Specialist marketing en communicatie",
  "Office & Management Support Specialist": "Specialist secretariaat en managementondersteuning",
  "Software developer": "Softwareontwikkelaar"
};

// Engelse termen in de uitleg met hun gewone Nederlandse woord.
// De site zet de vertaling er automatisch tussen haakjes achter (eerste keer per tekst).
const TERMEN = [
  ["account manager", "vertegenwoordiger"],
  ["business administration", "bedrijfskunde"],
  ["international business", "internationaal ondernemen"],
  ["human resource management", "personeelszaken"],
  ["creative technology", "creatieve techniek"],
  ["creative business", "creatief ondernemen"],
  ["marketing management", "reclame, verkoop en bedrijfsvoering"],
  ["facility management", "beheer van gebouwen en diensten"],
  ["facility manager", "hoofd facilitaire zaken"],
  ["industrial design engineering", "industrieel productontwerpen"],
  ["applied data science", "toegepaste datawetenschap"],
  ["artificial intelligence", "kunstmatige intelligentie"],
  ["applied psychology", "toegepaste psychologie"],
  ["psychology", "psychologie"],
  ["social work", "sociaal werk"],
  ["international law", "internationaal recht"],
  ["law", "rechten"],
  ["computer science", "informatica"],
  ["physiotherapy", "fysiotherapie"],
  ["nursing", "verpleegkunde"],
  ["sports studies", "sportopleiding"],
  ["human movement", "bewegingswetenschappen"],
  ["biomedical sciences", "biomedische wetenschappen"],
  ["biology", "biologie"],
  ["future planet studies", "studie naar de toekomst van de aarde"],
  ["university college", "kleinschalige, brede universitaire bachelor"],
  ["primary education", "basisonderwijs"],
  ["media design", "mediaontwerp"],
  ["media creator", "mediamaker"],
  ["communication", "communicatie"],
  ["mechatronics", "mechatronica"],
  ["cyber security", "digitale beveiliging"],
  ["sports management", "leiding geven aan sportorganisaties"],
  ["logistics engineering", "logistieke techniek"],
  ["data science", "datawetenschap"],
  ["data scientist", "datawetenschapper"],
  ["software developer", "softwareontwikkelaar"],
  ["game developer", "maker van computerspellen"],
  ["developer", "ontwikkelaar"],
  ["machine-learning engineer", "ontwikkelaar van zelflerende computersystemen"],
  ["machine learning", "zelflerende computersystemen"],
  ["design engineer", "technisch ontwerper"],
  ["engineering", "techniek"],
  ["engineer", "ingenieur"],
  ["UX- of UI-designer", "ontwerper van apps en websites, gericht op de gebruiker"],
  ["webdesigner", "websiteontwerper"],
  ["designer", "ontwerper"],
  ["design", "ontwerp"],
  ["security specialist", "beveiligingsspecialist"],
  ["security", "beveiliging"],
  ["IT-consultant", "ICT-adviseur"],
  ["consultant", "adviseur"],
  ["marketeer", "specialist in reclame en verkoop"],
  ["marketing", "reclame en verkoop"],
  ["innovatiemanager", "leider van vernieuwingsprojecten"],
  ["productmanager", "verantwoordelijke voor een product"],
  ["hotelmanager", "hoteldirecteur"],
  ["restaurantmanager", "bedrijfsleider van een restaurant"],
  ["HR-manager", "hoofd personeelszaken"],
  ["HR-adviseur", "personeelsadviseur"],
  ["HRM", "personeelszaken"],
  ["HR", "personeelszaken"],
  ["management", "leidinggeven en organiseren"],
  ["manager", "leidinggevende"],
  ["recruiter", "personeelswerver"],
  ["leefstijlcoach", "begeleider bij een gezonde leefstijl"],
  ["coachen", "begeleiden"],
  ["coach", "begeleider"],
  ["e-commerce", "online verkoop"],
  ["social media", "sociale media"],
  ["contentstrateeg", "bedenker van wat een organisatie online publiceert"],
  ["contentmaker", "maker van online teksten, foto's en video's"],
  ["content", "teksten, foto's en video's"],
  ["prototypes", "proefmodellen"],
  ["prototype", "proefmodel"],
  ["pitchen", "je idee kort presenteren"],
  ["front-end", "de voorkant van websites en apps"],
  ["compliance", "toezicht op het naleven van regels"],
  ["portfolio", "map met je eigen werk"],
  ["zzp'er", "zelfstandige zonder personeel"],
  ["start-ups", "jonge, snelgroeiende bedrijven"],
  ["eventplanner", "evenementenorganisator"],
  ["art director", "creatief leider"],
  ["minor", "keuzeblok"],
  ["associate degree", "tweejarige hbo-opleiding"],
  ["feedback", "reactie op je werk"],
  ["business", "zakenwereld"],
  ["Python", "een programmeertaal"],
  ["AI", "kunstmatige intelligentie"]
];

// Doorvragen: na de gewone vragen wordt verder gevraagd binnen je twee sterkste richtingen.
// Dit verfijnt alleen welke groep opleidingen het best past; de andere richtingen tellen gewoon mee.
// [groep, vraag]. Voor ouders wordt "Ik wil" automatisch "Mijn kind wil".
const DIEP = {
  tech: [["ict", "Ik wil software, apps of slimme systemen bouwen."], ["techniek", "Ik wil machines, energie of robots ontwerpen."], ["bouw", "Ik wil gebouwen, wegen of wijken ontwerpen."]],
  zorg: [["zorg", "Ik wil zieke mensen verzorgen of behandelen."], ["therapie", "Ik wil mensen helpen bewegen, herstellen of fit blijven."], ["natuur", "Ik wil in een lab uitzoeken hoe ziektes ontstaan."]],
  weten: [["natuur", "Ik wil proeven doen en dingen meten in een lab."], ["groen", "Ik wil buiten werken met natuur, dieren of voedsel."], ["ict", "Ik wil met data en computers grote vragen beantwoorden."]],
  creatief: [["design", "Ik wil beelden, ontwerpen of films maken."], ["muziek", "Ik wil muziek maken, spelen of dansen op een podium."], ["communicatie", "Ik wil schrijven en verhalen vertellen."]],
  mens: [["onderwijs", "Ik wil kinderen of jongeren iets leren."], ["sociaal", "Ik wil mensen met problemen verder helpen."], ["recht", "Ik wil bezig zijn met regels, recht en politiek."], ["gedrag", "Ik wil snappen hoe mensen denken en doen."], ["talen", "Ik wil talen, culturen of geschiedenis bestuderen."]],
  bedrijf: [["management", "Ik wil leidinggeven en dingen organiseren."], ["marketing", "Ik wil verkopen en klanten overtuigen."], ["economie", "Ik wil met geld, cijfers en economie werken."], ["horeca", "Ik wil werken in gastvrijheid, reizen of evenementen."]]
};

// Waar je vaak een toelatingsexamen, auditie, portfolio, loting of selectie tegenkomt
const SELECTIE = {
  design: "Vaak een portfolio of toelatingsopdracht.",
  muziek: "Bijna altijd een auditie.",
  zorg: "Bij onder meer geneeskunde, tandheelkunde en verloskunde selectie of loting.",
  therapie: "Bij onder meer fysiotherapie vaak selectie.",
  veilig: "Bij politie, defensie en luchtvaart een strenge selectie.",
  groen: "Bij diergeneeskunde selectie.",
  gedrag: "Bij sommige universiteiten selectie voor psychologie."
};

// Opleidingen met afwijkende toelatingseisen, herkend aan de naam: [patroon, wat er extra gevraagd wordt]
const EXTRA_EIS = [
  [/geneeskunde|tandheelkunde|verloskunde|mondzorg/i, "Er is selectie of loting. Je meldt je meestal al vóór 15 januari aan."],
  [/fysiotherapie/i, "Vaak selectie. Meld je op tijd aan; bij sommige scholen al vóór 15 januari."],
  [/politie/i, "Je doet mee aan een selectie: sporttest, psychologisch onderzoek, medische keuring en een antecedentenonderzoek."],
  [/defensie|militair|marine|landmacht|luchtmacht|marechaussee/i, "Je wordt gekeurd: medisch, sportief en psychologisch."],
  [/luchtvaart|aviation|pilot|vlieger/i, "Strenge selectie en een medische keuring."],
  [/lichamelijke opvoeding|^sport|sport en bewegen|cios/i, "Vaak een sporttest of een praktische toelating."],
  [/leraar basisonderwijs|pabo/i, "Je moet toetsen voor taal en rekenen halen, soms al vóór je begint."]
];

// Beroep -> zoekterm voor de opleidingen erbij, waar de automatische koppeling mis gaat. Leeg = niet klikbaar.
const BEROEP_TERM = {"Onderwijskundige of schoolleider": "onderwijs", "Schoolleider (later)": "onderwijs", "Onderwijsadviseur": "onderwijs", "Art director of creatief concept bedenken": "design", "Creatief concept bedenken": "design", "Maker van film, foto of games": "film", "Regisseur of producent": "film", "Videomaker of editor": "film", "Interieurontwerper of modeontwerper": "interieur", "Podium- of festivalwerk": "podium", "Podium- en evenemententechnicus": "podium", "Medewerker licht en geluid": "podium", "Werken bij musea, uitgeverijen of de overheid": "erfgoed", "Medewerker in een museum, archief of bibliotheek": "erfgoed", "Museummedewerker of tentoonstellingsmaker": "erfgoed", "Archivaris: oude documenten bewaren en ontsluiten": "erfgoed", "Erfgoedspecialist bij een gemeente": "erfgoed", "Werken bij overheid, zorg of bedrijven": "", "Communicatieadviseur of woordvoerder": "communicatie", "Communicatieadviseur": "communicatie", "Woordvoerder": "communicatie", "Tekstschrijver of communicatieadviseur": "communicatie", "Contentstrateeg": "communicatie", "Contentmaker of social media-specialist": "media", "Contentmaker": "media", "Social media maker": "media", "Contentmaker voor social media": "media", "Social media of e-commerce specialist": "marketing", "Marketingcommunicatie": "marketing", "Marketeer of merkmanager": "marketing", "Marketeer": "marketing", "E-commerce-specialist": "marketing", "Internationaal marketeer": "international business", "Export- of inkoopmanager": "international business", "Account manager voor buitenlandse klanten": "international business", "Werken bij een internationaal bedrijf": "international business", "Diplomaat of medewerker bij een ambassade": "internationale betrekkingen", "Belastingadviseur": "fiscaal recht", "Werken bij een bank of verzekeraar": "verzekering", "Medewerker bij een bank of verzekeraar": "verzekering", "Econoom of analist": "economie", "Jurist bij overheid of bedrijf": "rechten", "Beleidsadviseur": "bestuurskunde", "Compliance- of beleidsadviseur": "bestuurskunde", "Beleidsmedewerker bij een gemeente of ministerie": "bestuurskunde", "Beleidsmedewerker bij de overheid of een politieke partij": "bestuurskunde", "Medewerker van een politieke partij of Tweede Kamerlid": "bestuurskunde", "Econoom bij de overheid of De Nederlandsche Bank": "economie", "Medewerker bij de gemeente": "", "Labmedewerker": "laboratorium", "Medisch of laboratoriumtechnicus": "laboratorium", "Adviseur bij overheid of industrie": "", "Security specialist": "security", "Specialist digitale beveiliging": "security", "Systeembeheerder of IT-consultant": "ict", "IT-consultant": "ict", "ICT-adviseur bij bedrijven": "ict", "Medewerker servicedesk": "ict", "Netwerk- of systeembeheerder": "ict", "Systeemarchitect": "informatica", "Doorstromen naar het hbo-informatica": "informatica", "Technisch adviseur": "technische bedrijfskunde", "Productiemanager": "technische bedrijfskunde", "Planoloog of stedenbouwkundige": "planologie", "Planoloog: bedenken hoe een stad of wijk wordt ingericht": "planologie", "Ecoloog of natuurbeheerder": "natuurbeheer", "Boswachter of natuurbeheerder": "natuurbeheer", "Ecoloog": "ecologie", "Waterbeheerder bij een waterschap": "water", "Kaartenmaker met data, bij gemeente of waterschap": "geografie", "Verloskundige": "verloskunde", "Ergotherapeut of logopedist": "ergotherapie", "Logopedist": "logopedie", "Diëtist": "voeding", "Diëtist of voedingsdeskundige": "voeding", "Voedingsmiddelentechnoloog": "voedingsmiddelen", "Maatschappelijk werker": "social work", "Wijkcoach of jongerenwerker": "social work", "Wijkcoach": "social work", "Jongerenwerker": "social work", "Jeugdzorgwerker": "jeugd", "Woonbegeleider": "begeleider", "Hotelmanager of restaurantmanager": "hotel", "Eventplanner": "event", "Reisadviseur": "toerisme", "Werken in de reisbranche": "toerisme", "Toeristisch medewerker": "toerisme", "Facility manager": "facility", "Beveiligingsadviseur": "veiligheid", "Doorstromen naar de pabo (hbo)": "leraar basisonderwijs", "Doorstromen naar een kunstvakopleiding (hbo)": "kunst", "Illustrator of striptekenaar": "kunst", "Medewerker klantenservice": "", "Doorstromen naar een master": "", "Medewerker salarisadministratie": "administratie", "Assistent-boekhouder": "administratie", "Medewerker hr": "human resource", "Hr-adviseur": "human resource", "HR-adviseur": "human resource", "HR-manager": "human resource", "Recruiter": "human resource", "Opleidingsadviseur": "human resource", "Medewerker op een notariskantoor": "notari", "Medewerker kwaliteitscontrole": "kwaliteit", "Installateur van zonnepanelen of warmtepompen": "installatie", "Bloemist": "bloem", "Medewerker in de land- of tuinbouw": "tuinbouw", "Medewerker in een sportschool of zwembad": "sport", "Sport- en bewegingscoördinator": "sport", "Beweegconsulent bij een gemeente": "sport", "Politieagent (via de politieacademie)": "politie", "Sportfysiotherapeut": "fysiotherapeut", "Kinderfysiotherapeut": "fysiotherapeut", "Wijkverpleegkundige": "verpleegkundige", "Consultant": "bedrijfskunde", "Adviseur": "bedrijfskunde", "Adviseur of consultant": "bedrijfskunde", "Data-analist": "data science", "Data-analist: patronen vinden in cijfers": "data science", "Data-analist of data scientist": "data science", "Data scientist": "data science", "Webontwikkelaar": "software", "App-ontwikkelaar": "software", "Ontwikkelaar van games": "game", "Interactieontwerper": "multimedia", "UX- of UI-designer": "multimedia", "Webdesigner": "multimedia", "Productontwikkelaar": "industrieel product", "Productontwerper": "industrieel product", "Innovatieadviseur": "innovatie", "Innovatiemanager": "innovatie", "Creatief producent": "creative business", "Doorstromen naar hbo (CMD, Creative Business)": "creative business", "Actuaris: risico's berekenen voor verzekeraars en pensioenfondsen": "actuari", "Econometrist bij een bank of het CBS": "econometrie", "Ingenieur": "werktuigbouwkunde", "Ingenieur of ontwerper": "werktuigbouwkunde", "Meteoroloog: het weer voorspellen": "natuurkunde", "Energieadviseur": "energie", "Onderzoeker bij een universiteit of bedrijf": "onderzoeker", "Procestechnoloog in de industrie": "chemie", "Redacteur bij een uitgeverij": "journalistiek", "Ondertitelaar voor films en series": "taal", "Automonteur": "mobiliteit", "Medewerker in een dierenpension": "dier", "Specialist in kunstmatige intelligentie": "kunstmatige intelligentie", "Machine-learning engineer": "kunstmatige intelligentie", "Medisch beeldspecialist, bijvoorbeeld bij MRI-scans": "medische", "Adviseur klimaat en duurzaamheid": "duurzaamheid", "Medewerker sociale zekerheid": "juridisch", "Milieuadviseur": "milieu", "Doorstromen naar een hbo-opleiding talen": "taal", "Medewerker klantenservice met talen": "", "Grafisch ontwerper": "vormgeving", "Grafisch vormgever": "vormgeving", "Ontwerper van games of animaties": "game"};

// Persona's: verzonnen voorbeelden van studenten, om je in te herkennen (of juist niet)
const PERSONAS = {
  tech: [
    { naam: "Daan, 19", studie: "hbo Informatica", tekst: "Gamede veel en begon zelf kleine programma's te maken. Puzzelt door tot iets werkt en werkt het liefst met een paar mensen aan één project." },
    { naam: "Noor, 18", studie: "wo Werktuigbouwkunde", tekst: "Vond wiskunde prima, maar het bouwen van een zeepkist het leukst. Wil later meewerken aan duurzame energie." }
  ],
  zorg: [
    { naam: "Lisa, 18", studie: "hbo Verpleegkunde", tekst: "Werkte als bijbaan in een verpleeghuis en merkte dat ze rustig blijft als het spannend wordt. Houdt van afwisseling en van mensen." },
    { naam: "Youssef, 19", studie: "hbo Fysiotherapie", tekst: "Voetbalt al jaren en kwam zelf bij de fysio na een blessure. Snapt graag hoe het lichaam werkt en coacht nu de jeugd." }
  ],
  weten: [
    { naam: "Emma, 18", studie: "wo Biomedische wetenschappen", tekst: "Wil van alles weten waarom het zo werkt. Vindt het niet erg om lang aan één vraag te werken en houdt van precies werk." },
    { naam: "Bram, 19", studie: "hbo Bos- en natuurbeheer", tekst: "Zit het liefst buiten, kent alle vogels in de buurt en wil iets doen aan natuur en klimaat." }
  ],
  creatief: [
    { naam: "Sara, 18", studie: "hbo Communicatie & multimediaontwerp", tekst: "Maakt al jaren eigen video's en ontwerpen. Kan goed tegen kritiek en wil dingen maken waar mensen iets mee doen." },
    { naam: "Milan, 20", studie: "hbo Conservatorium", tekst: "Speelt sinds zijn achtste gitaar en oefent elke dag. Weet dat het een harde wereld is, maar kan zich niets anders voorstellen." }
  ],
  mens: [
    { naam: "Fatima, 18", studie: "hbo Pabo", tekst: "Gaf bijles aan kinderen uit de buurt en vond het mooiste als het kwartje viel. Geduldig en goed in uitleggen." },
    { naam: "Thomas, 19", studie: "wo Rechten", tekst: "Kan eindeloos discussiëren en leest graag. Wil weten hoe regels werken en wat eerlijk is." }
  ],
  bedrijf: [
    { naam: "Jesse, 18", studie: "hbo Bedrijfskunde", tekst: "Had een bijbaan in de supermarkt en dacht steeds na over hoe het slimmer kon. Neemt graag de leiding in een groep." },
    { naam: "Mila, 19", studie: "hbo Hotelmanagement", tekst: "Werkte in een strandtent en vindt het heerlijk als gasten een goede avond hebben. Organiseert graag en is flexibel." }
  ]
};

// Dezelfde richtingen, maar dan studenten op het mbo
const PERSONAS_MBO = {
  tech: [
    { naam: "Ayoub, 18", studie: "mbo 4 Software developer", tekst: "Bouwde een eigen bot voor zijn gameserver. Leert het best door te doen, in projecten voor echte klanten." },
    { naam: "Kevin, 17", studie: "mbo 3 Eerste monteur elektrotechniek", tekst: "Sleutelde thuis al aan brommers. Werkt graag met zijn handen en koos bbl, zodat hij meteen verdient." }
  ],
  zorg: [
    { naam: "Sanne, 17", studie: "mbo 4 Verpleegkunde", tekst: "Liep stage in een verpleeghuis en merkte dat ze goed kan luisteren. Wil snel aan het werk en later misschien door naar het hbo." },
    { naam: "Dewi, 18", studie: "mbo 3 Verzorgende IG", tekst: "Werkte als zorghulp en vindt het fijn om mensen te helpen met wat ze zelf niet meer kunnen." }
  ],
  weten: [
    { naam: "Joris, 17", studie: "mbo 4 Laborant", tekst: "Vond de proefjes bij nask het leukst. Werkt graag precies en vindt het fijn als een meting klopt." },
    { naam: "Bas, 17", studie: "mbo 3 Dierverzorging", tekst: "Heeft thuis kippen en konijnen en loopt stage op een kinderboerderij. Is liever buiten dan in een lokaal." }
  ],
  creatief: [
    { naam: "Lotte, 17", studie: "mbo 4 Mediavormgever", tekst: "Maakt posters en filmpjes voor haar voetbalclub en heeft een map vol eigen werk. Leert het liefst door te maken." },
    { naam: "Noa, 18", studie: "mbo 4 Podium- en evenemententechniek", tekst: "Regelde het licht bij de schoolmusical en vond dat het leukste wat er is. Werkt graag achter de schermen." }
  ],
  mens: [
    { naam: "Amira, 17", studie: "mbo 4 Pedagogisch medewerker", tekst: "Werkt naast school op de bso en past vaak op haar neefjes. Rustig, geduldig en goed in grenzen stellen." },
    { naam: "Rick, 18", studie: "mbo 4 Persoonlijk begeleider", tekst: "Is vrijwilliger bij een sportclub voor kinderen met een beperking. Houdt van structuur en van mensen verder helpen." }
  ],
  bedrijf: [
    { naam: "Niels, 17", studie: "mbo 4 Commercieel medewerker", tekst: "Werkt in de bouwmarkt en verkoopt graag. Houdt van contact met klanten en wil later een eigen zaak." },
    { naam: "Esra, 18", studie: "mbo 4 Zelfstandig werkend kok", tekst: "Kookt thuis voor de hele familie en werkt in een restaurant. Kan goed tegen drukte." }
  ]
};

// Stappenplan: hoe kom je daar? (algemene regels; check altijd de opleiding zelf)
const ROUTE = [
  ["Havo 4 / vwo 4–5", "Kies je profiel en ontdek wat je leuk vindt", "Je profiel bepaalt voor een deel welke studies open staan. Twijfel je? Een breed profiel houdt meer deuren open."],
  ["Najaar en voorjaar", "Ga naar open dagen en meeloopdagen", "Bekijk in het tabblad Open dagen wanneer scholen open zijn. Eén dag meelopen zegt meer dan tien websites."],
  ["Uiterlijk 15 januari", "Aanmelden bij loting of selectie", "Voor opleidingen met een beperkt aantal plekken (numerus fixus) meld je je vóór 15 januari aan via Studielink, de landelijke aanmeldsite."],
  ["Uiterlijk 1 mei", "Aanmelden via Studielink", "Voor de meeste opleidingen meld je je vóór 1 mei aan. Dan heb je recht op een studiekeuzecheck en word je in principe toegelaten als je aan de eisen voldoet."],
  ["Mei – juni", "De studiekeuzecheck", "Veel opleidingen nodigen je uit voor een kennismaking: een opdracht, vragenlijst of gesprek. Het is een advies, geen examen."],
  ["Minstens 3 maanden voor de start", "Geld regelen bij DUO", "Vraag studiefinanciering aan bij DUO, de dienst die het geld voor je studie regelt. Daarvoor heb je je DigiD nodig."],
  ["Voorjaar en zomer", "Woonruimte en reizen", "Ga je op kamers, begin dan vroeg met zoeken. Blijf je thuis wonen, kijk dan hoe lang je reist. Met je studentenreisproduct van DUO reis je goedkoper met het ov."],
  ["Vanaf je 18e", "Zorgverzekering en andere zaken", "Vanaf je 18e moet je zelf een zorgverzekering hebben. Misschien kun je zorgtoeslag krijgen."],
  ["September", "Je eerste studiedag", "De introductieweek helpt je je weg te vinden. Het eerste jaar heet de propedeuse."]
];

// Uitgelichte studie -> groep in de lijst met alle opleidingen
const STUDIE_FAM = { verpleegkunde: "zorg", fysio: "therapie", sport: "therapie", ba: "management", iba: "management", marketing: "marketing", hrm: "management", informatica: "ict", datascience: "ict", ct: "ict", ido: "techniek", cmd: "design", mic: "communicatie", creativebiz: "design", psychologie: "gedrag", sw: "sociaal", recht: "recht", pabo: "onderwijs", biomed: "natuur", las: "natuur", biologie: "natuur" };

// Gespreksgids voor ouders: [titel, waarom, vragen om te stellen, liever niet zeggen]
const GESPREK = [
  ["1. Het gesprek beginnen", "Kies een ontspannen moment: in de auto, tijdens het koken of bij een wandeling. Niet vlak na een slecht cijfer of als er haast is.",
    ["Waar ben je de laatste tijd mee bezig dat je echt leuk vindt?", "Waar raak je de tijd bij kwijt?", "Wat vinden je vrienden van hun studiekeuze?"],
    ["“Je moet nu toch eens weten wat je wilt.”", "“Toen ik zo oud was als jij …”"]],
  ["2. Doorvragen zonder te sturen", "Je hoeft geen antwoord te hebben. Vraag door op wat je kind zegt, ook als het vaag is.",
    ["Wat spreekt je daar precies in aan?", "Hoe zie je een gewone werkdag voor je?", "Wat zou je juist níét willen doen?"],
    ["“Daar kun je toch niks mee verdienen.”", "“Dat is niks voor jou.”"]],
  ["3. Samen uitzoeken", "Maak het concreet. Vul allebei de Padvinder in en vergelijk de uitslagen: de verschillen zijn het interessantste gesprek.",
    ["Welke twee of drie opleidingen zullen we beter bekijken?", "Naar welke open dag gaan we samen?", "Kennen we iemand die dit werk doet en die je iets kunt vragen?"],
    ["“Ik zoek het wel voor je uit.”"]],
  ["4. Afspraken maken en loslaten", "Spreek af wie wat doet en wanneer, bijvoorbeeld aanmelden vóór 1 mei. Maar laat de keuze bij je kind.",
    ["Wat is je volgende stap, en wanneer doe je die?", "Waar kan ik je mee helpen?"],
    ["“Ik weet wat het beste voor je is.”"]]
];
const GESPREK_LASTIG = [
  ["Als je kind het echt niet weet", "Dat is heel normaal, ook op 17. Kies dan voor iets breds, ga naar meeloopdagen, praat met de decaan of overweeg een tussenjaar met een duidelijk plan. Een verkeerde keuze is niet erg: overstappen kan."],
  ["Als jullie het oneens zijn", "Vraag eerst waaróm je kind iets wil, en zoek het daarna samen uit: bekijk de opleiding, ga naar een open dag, zoek iemand die het werk doet. Jouw zorg mag je noemen, maar het blijft de keuze van je kind."],
  ["Als het over geld gaat", "Studeren kost geld: collegegeld, boeken en misschien een kamer. Via DUO, de dienst die studiefinanciering regelt, krijgt je kind een basisbeurs en/of kan het lenen. Kijk samen op duo.nl wat dat voor jullie betekent."],
  ["Als jullie er samen niet uitkomen", "Maak een afspraak om samen met de decaan te praten. Een derde aan tafel helpt soms: om het gesprek open te houden als je kind vastloopt, en ook als jullie meningen verschillen. De decaan kent de routes, kijkt zonder eigen belang mee en het kost niets."]
];

// Open dag voorbereiden: [titel, punten]
const OPENDAG_TIPS = [
  ["Vooraf", ["Meld je aan als dat moet; vaak krijg je dan een programma en een plattegrond.", "Kies twee of drie voorlichtingen of proefcolleges die je echt wilt zien.", "Schrijf je vragen op: over het programma, stages, toetsen en werk na de studie.", "Doe de Padvinder en lees de uitleg van de opleiding hier, dan weet je waar je op moet letten."]],
  ["Wie gaat er mee, en waarom?", ["Waarom: met z'n tweeën zie en hoor je meer, en je hebt iemand om het na afloop mee te bespreken. Dat helpt je kiezen.", "Rol van een ouder of begeleider: luisteren, praktische vragen stellen (over geld, reizen, wonen) en achteraf doorvragen. Niet het woord voeren.", "Rol van een vriend of vriendin: samen de sfeer proeven en eerlijk tegen elkaar zeggen wat je ervan vond. Zeker handig als jullie hetzelfde overwegen.", "Geen ouder die mee kan? Neem iemand anders mee die je vertrouwt, of ga alleen: studenten en voorlichters helpen je graag, en alleen praat je vaak makkelijker.", "Spreek vooraf af: jij stelt de vragen, wie meegaat mag aanvullen."]],
  ["Hoe kom je daar?", ["Plan je reis vooraf met de routeknop bij de open dag; op open dagen is het druk in trein en bus.", "Kom ongeveer een half uur voor het begin, zodat je rustig de weg vindt.", "Welke locatie? Veel scholen zitten in meer steden. Check op welke locatie jouw opleiding is; die staat op de aanmeldpagina of in je bevestigingsmail, net als het gebouw.", "Reis je straks elke dag? Doe de reis dan op een gewone schooldag, zo weet je hoe lang het echt duurt."]],
  ["Vragen om te stellen", ["Hoe ziet een gewone week eruit: hoeveel uur les en hoeveel zelfstudie?", "Hoe is het eerste jaar opgebouwd, en wat is het bindend studieadvies?", "Hoeveel studenten stoppen in het eerste jaar, en waarom?", "Wanneer en waar loop je stage?", "Wat doen oud-studenten nu voor werk?", "Vraag studenten: wat had je willen weten voordat je begon?"]],
  ["Daarna", ["Schrijf meteen op wat je goed en minder goed vond.", "Vergelijk minstens twee opleidingen of scholen.", "Twijfel je nog? Plan een meeloopdag: dan loop je een echte lesdag mee."]]
];


// Toelating: de mogelijkheden
const TOELATING = [
  ["Gewoon toegelaten", "Bij de meeste opleidingen: heb je de juiste vooropleiding en meld je je vóór 1 mei aan, dan mag je beginnen."],
  ["Loting of selectie (numerus fixus)", "Beperkt aantal plekken. Aanmelden vóór 15 januari; daarna volgt een selectie (opdrachten, toets, gesprek) of een loting."],
  ["Portfolio of toelatingsopdracht", "Vooral bij kunst en ontwerp. Je laat werk zien of maakt een opdracht. Begin ruim op tijd met verzamelen."],
  ["Auditie", "Bij muziek, dans en theater. Je speelt, danst of acteert voor een commissie."],
  ["Aanvullende eisen of een toets", "Mis je een vak? Soms kun je dat inhalen met een cursus of toets (deficiëntie wegwerken). Ben je 21 of ouder zonder het juiste diploma, dan is er vaak een toelatingstoets (21+-toets)."]
];

// Wie betaalt wat?
const GELD = [
  ["Collegegeld", "Elk jaar te betalen aan de school, meestal met een machtiging. Kan door jou of je ouders; je kunt er ook voor lenen bij DUO (collegegeldkrediet)."],
  ["Studiefinanciering", "Van DUO: een basisbeurs (hoger als je uitwonend bent) en je kunt lenen. Verdienen je ouders weinig, dan krijg je vaak een aanvullende beurs."],
  ["Wat ouders bijdragen", "DUO gaat ervan uit dat ouders die genoeg verdienen bijdragen. Kunnen of willen ze dat niet? Praat erover, en kijk bij DUO wat er dan kan."],
  ["Wonen", "Kamerhuur, gas en licht. Op een zelfstandige woning met eigen voordeur kun je vanaf je 18e huurtoeslag krijgen; op een gewone studentenkamer meestal niet."],
  ["Reizen", "Met het studentenreisproduct van DUO reis je gratis of met korting met het ov. Je kiest zelf een week- of weekendabonnement."],
  ["Boeken en spullen", "Boeken, een laptop en soms materiaal. Vraag op de open dag hoeveel dat ongeveer kost."],
  ["Zorgverzekering", "Vanaf je 18e verplicht en zelf te betalen. Met een laag inkomen krijg je zorgtoeslag."],
  ["Bijbaan", "Veel studenten werken een paar uur per week. Let op dat je studie voorgaat, zeker in het eerste jaar."]
];

// Kamer: wat regel je en wanneer
const KAMER_CHECKLIST = [
  ["Zodra je weet in welke stad", "Schrijf je in bij kamersites en studentenhuisvesters in die stad. Bij sommige tel je inschrijfduur: hoe eerder, hoe beter."],
  ["Voorjaar", "Reageer op kamers, ga hospiteren (kennismaken met de huisgenoten) en kijk naar de echte kosten per maand."],
  ["Voor je tekent", "Lees het huurcontract: huurprijs, borg, servicekosten en opzegtermijn. Betaal nooit vooraf aan iemand die je niet kunt controleren."],
  ["Zomer", "Verhuizen, je adres binnen vijf dagen wijzigen bij de gemeente, en een inboedel- en aansprakelijkheidsverzekering regelen."],
  ["Na verhuizen", "Laat DUO weten dat je uitwonend bent (dat scheelt in je beurs) en vraag eventueel huurtoeslag aan."]
];

// Buitenland, tussenjaar, Defensie en politie
const OPTIES = [
  ["Studeren in het buitenland", "Kan in België, Duitsland, het Verenigd Koninkrijk of verder. Aanmeldingsdata en toelatingseisen verschillen per land, vaak al in de winter. Studiefinanciering kun je onder voorwaarden meenemen; check dat bij DUO. Begin minstens een jaar van tevoren."],
  ["Een tussenjaar", "Werken, vrijwilligerswerk, reizen of een cursus. Kan heel goed, maar maak een plan: wat wil je doen, en wanneer meld je je aan? De gewone deadlines (15 januari en 1 mei) gelden dan in het jaar dat je wilt beginnen."],
  ["Werken bij Defensie", "Bij de landmacht, marine, luchtmacht of marechaussee leer je het vak in dienst: je krijgt salaris tijdens je opleiding. Er zijn functies voor vmbo, mbo, havo en vwo, en een Dienjaar om een jaar te proberen. Officier word je via de KMA of het KIM, een bachelor. Je solliciteert via werkenbijdefensie.nl, niet via Studielink. Reken op een selectie van een paar maanden: sporttest, medische keuring, psychologisch onderzoek en een veiligheidsonderzoek."],
  ["Werken bij de politie", "Je wordt agent via de Politieacademie: op mbo-niveau 4, of met een hbo-bachelor politiekunde. Je bent dan al in dienst en krijgt salaris tijdens je opleiding. Je solliciteert via werkenbijdepolitie.nl, niet via Studielink of de mbo-school. De selectie duurt een paar maanden: sporttest, medische keuring, psychologisch onderzoek en een onderzoek naar je achtergrond. Je hebt de Nederlandse nationaliteit nodig en een rijbewijs helpt."],
  ["Eerst iets anders, later switchen", "Een verkeerde keuze is niet erg. Je kunt na het eerste jaar overstappen, of na een associate degree of mbo doorstromen."]
];

// Waarom misschien níet? De vragen die een open dag overslaat.
// [onderwerp, kernvraag, [punten]]
const KANTTEKENINGEN = [
  ["Werk na je opleiding", "Vind je straks werk dat bij je diploma past?", [
    "Bij sommige opleidingen studeren veel meer mensen af dan er banen zijn.",
    "Vraag niet alleen óf oud-studenten werk vinden, maar wát voor werk. Werken onder je niveau telt ook mee.",
    "Sommige beroepen veranderen snel door computers en AI. Vraag hoe de opleiding daarop inspeelt.",
    "Op het mbo: is er genoeg plek bij leerbedrijven voor je stage of bbl-baan?"
  ]],
  ["Het werk zelf", "De opleiding kan leuk zijn terwijl het werk daarna niet bij je past.", [
    "Hoe zijn de werktijden? Denk aan nachten, weekenden en feestdagen.",
    "Hoeveel verdien je, en hoe zwaar is het werk, lichamelijk of in je hoofd?",
    "Werk je vooral alleen, met mensen, achter een scherm of buiten?",
    "Praat met iemand die het werk al een paar jaar doet, niet alleen met studenten."
  ]],
  ["Geld", "Wat kost het, en wat levert het op?", [
    "Een lening bij DUO moet je later terugbetalen. Zet dat naast wat je ongeveer gaat verdienen.",
    "Naast het collegegeld betaal je reizen, boeken, materiaal en soms een kamer.",
    "Stages zijn soms onbetaald, en reizen naar het buitenland zijn soms verplicht.",
    "Heb je al een diploma op hetzelfde niveau? Een tweede opleiding is dan vaak veel duurder.",
    "Veel lesuren of verplichte aanwezigheid laten weinig tijd over voor een bijbaan."
  ]],
  ["Haalbaarheid", "Kun je het halen, en wat gebeurt er als het niet lukt?", [
    "Veel opleidingen hebben een bindend studieadvies (BSA). Haal je te weinig punten, dan moet je stoppen, soms met een lening en zonder diploma.",
    "Vraag hoeveel studenten in het eerste jaar stoppen, en hoeveel er hun diploma halen.",
    "Sluit je vooropleiding aan? Denk aan wiskunde, taal en zelfstandig plannen.",
    "Bij loting of selectie is er een kans dat je niet wordt toegelaten. Zorg voor een plan B."
  ]],
  ["Afstand en wonen", "Hoe ziet je week eruit, buiten de les?", [
    "Anderhalf uur heen en anderhalf uur terug is vijftien uur reizen per week.",
    "Op kamers gaan kost geld, en een kamer vinden is in veel steden lastig.",
    "Verhuizen kan betekenen dat je je vrienden, sportclub of bijbaan moet missen.",
    "Vaak is er een vergelijkbare opleiding dichterbij. Vergelijk ze even."
  ]],
  ["Leeftijd en timing", "Is dit het goede moment?", [
    "Weet je het nog niet zeker? Dat is heel normaal op je zestiende of zeventiende. Een tussenjaar of een brede opleiding kan dan beter zijn.",
    "Ben je ouder, werk je al of heb je een gezin? Een deeltijdopleiding, een duale opleiding of een associate degree past dan misschien beter.",
    "Niet nu is iets anders dan nooit. Later beginnen kan altijd nog."
  ]],
  ["Je eigen reden", "Kies je dit zelf, of omdat het van je verwacht wordt?", [
    "Kies je het omdat je ouders, je vrienden of je school het verwachten?",
    "Kies je het om de status, of omdat het makkelijk lijkt?",
    "Ben je enthousiast door één leuk vak, één goede docent of de sfeer op de open dag?",
    "Vraag jezelf: zou ik dit ook kiezen als niemand wist wat ik ging doen?"
  ]],
  ["Open dag of echte lesdag", "Wat je op een open dag ziet, is de mooiste kant.", [
    "Een open dag is ook reclame. De voorlichters willen dat je komt.",
    "Het eerste jaar heeft soms veel theorie, statistiek of algemene vakken. Vraag naar het rooster en de vakken.",
    "Een opleiding met dezelfde naam kan per school heel anders zijn.",
    "Is de opleiding erkend (geaccrediteerd)? En wat zeggen de studenten zelf in de Nationale Studenten Enquête?"
  ]],
  ["Je eigen situatie", "Krijg je de hulp die je nodig hebt?", [
    "Heb je dyslexie, een beperking of een ziekte? Vraag wat de school voor je regelt.",
    "Zorg je thuis voor iemand? Vraag of je rooster flexibel genoeg is.",
    "Vraag wat er gebeurt als je een tijd niet kunt studeren."
  ]]
];

// "Later word ik de nieuwe …": een knipoog, met daarachter echte routes en banen.
// [wie, rol, knipoog, wat heb je nodig, [[baan, niveau]], [groepen]]
const DROOM = [
  ["Rembrandt", "schilder", "Je eigen werk ooit in het Rijksmuseum? Mooi doel. Maar ook zonder Nachtwacht kun je van beeld je werk maken.", "Een kunstacademie (hbo) met toelating via portfolio, en heel veel oefenen. Weinig kunstenaars leven alleen van hun eigen werk; de meesten combineren het met ander werk.", [["Illustrator", "hbo"], ["Grafisch vormgever", "mbo / hbo"], ["Restaurator van schilderijen", "wo"], ["Decorbouwer voor theater en film", "mbo"], ["Docent beeldende vorming", "hbo"], ["Museumeducator", "hbo / wo"]], ["design", "onderwijs"]],
  ["André Kuipers", "astronaut", "Nederland heeft maar een handvol astronauten gehad. Maar de ruimtevaart heeft duizenden andere banen, ook in Nederland.", "Astronauten hebben meestal een universitaire studie in techniek, natuurkunde of geneeskunde, jaren werkervaring, en ze worden streng geselecteerd door ESA.", [["Lucht- en ruimtevaartingenieur", "wo"], ["Vliegtuigmonteur", "mbo"], ["Software-ontwikkelaar voor satellieten", "hbo / wo"], ["Satellietdata-analist", "hbo / wo"], ["Sterrenkundige", "wo"], ["Technicus bij het ruimtevaartcentrum ESTEC in Noordwijk", "mbo / hbo"]], ["techniek", "natuur", "ict"]],
  ["Max Verstappen", "Formule 1-coureur", "Wereldkampioen worden is lastig. Maar een F1-team heeft honderden mensen in dienst, en die zijn allemaal nodig om te winnen.", "Coureurs beginnen meestal al heel jong met karten. Bij een raceteam werken kan via techniek, data of organisatie.", [["Automonteur of racemonteur", "mbo"], ["Autotechnicus", "hbo"], ["Data-engineer in de autosport", "hbo / wo"], ["Aerodynamica-ingenieur", "wo"], ["Bandenspecialist", "mbo"], ["Teammanager of evenementenorganisator", "hbo"]], ["techniek", "ict"]],
  ["Vivianne Miedema", "profvoetballer", "Prof worden lukt maar weinigen. Maar sport is een grote werkgever, ook naast het veld.", "Talent, heel veel trainen en een goede jeugdopleiding. Een opleiding ernaast is slim: een sportcarrière is kort.", [["Sportcoach of trainer", "mbo / hbo"], ["Fysiotherapeut", "hbo"], ["Sportjournalist", "hbo"], ["Data-analist bij een club", "hbo / wo"], ["Sportmarketeer", "hbo"], ["Beheerder van sportvelden", "mbo"]], ["therapie", "communicatie", "marketing"]],
  ["Martin Garrix", "dj en producer", "Grote podia? Achter elk optreden zit een heel team dat het mogelijk maakt.", "Vooral veel zelf maken en oefenen. Een muziek- of mediaopleiding op mbo of hbo, of het conservatorium, kan helpen.", [["Geluidstechnicus", "mbo / hbo"], ["Lichttechnicus", "mbo"], ["Muziekproducent", "hbo"], ["Evenementenorganisator", "mbo / hbo"], ["Muziekdocent", "hbo"]], ["muziek", "design", "horeca"]],
  ["Doutzen Kroes", "topmodel", "De catwalk is klein, de modewereld groot.", "Model word je vooral via een bureau. Wie de mode in wil, kan ook kiezen voor ontwerp, fotografie of de zakelijke kant.", [["Modeontwerper", "mbo / hbo"], ["Fotograaf", "mbo / hbo"], ["Stylist", "mbo"], ["Visagist", "mbo"], ["Marketeer in de mode", "hbo"], ["Inkoper voor een modeketen", "hbo"]], ["design", "marketing"]],
  ["Arjen Lubach", "tv-presentator", "Op tv komen maar weinig mensen. Maar media maken, dat doen er veel meer.", "Presentatoren komen uit allerlei hoeken: journalistiek, theater of gewoon heel veel zelf maken. Een media- of journalistiekopleiding helpt.", [["Journalist of redacteur", "hbo"], ["Cameraman", "mbo"], ["Video-editor", "mbo / hbo"], ["Contentmaker", "mbo / hbo"], ["Programmamaker", "hbo"], ["Communicatieadviseur", "hbo"]], ["communicatie", "design"]],
  ["Aletta Jacobs", "arts", "Zij was de eerste vrouw in Nederland die mocht studeren aan een universiteit, en ze moest ervoor vechten. Jij gelukkig niet meer.", "Geneeskunde is een universitaire studie met selectie, meestal met het profiel Natuur & Gezondheid. Daarna specialiseer je nog jaren.", [["Arts", "wo"], ["Verpleegkundige", "mbo / hbo"], ["Doktersassistent", "mbo"], ["Verloskundige", "hbo"], ["Apotheker", "wo"], ["Ambulanceverpleegkundige", "hbo + vervolg"]], ["zorg"]],
  ["Freek Vonk", "bioloog", "Haaien zoeken voor de camera is één kant. Biologie heeft veel meer kanten.", "Biologie studeer je op hbo of wo. Wie liever buiten en praktisch werkt, vindt ook veel op het mbo.", [["Bioloog of onderzoeker", "wo"], ["Dierverzorger", "mbo"], ["Boswachter", "mbo / hbo"], ["Ecoloog", "hbo / wo"], ["Dierenarts", "wo"], ["Natuurgids of educator", "hbo"]], ["groen", "natuur"]],
  ["Sergio Herman", "sterrenkok", "Een Michelinster is zeldzaam. Goede koks zijn overal nodig.", "Kok word je op het mbo, en daarna door veel te werken en te leren in goede keukens.", [["Kok", "mbo"], ["Patissier", "mbo"], ["Restaurantmanager", "mbo / hbo"], ["Voedingsmiddelentechnoloog", "hbo"], ["Hotelmanager", "hbo"], ["Ondernemer met een eigen zaak", "mbo / hbo"]], ["horeca"]],
  ["Steve Jobs", "tech-ondernemer", "Een eigen techbedrijf begint vaak klein, op een zolderkamer of in een studentenhuis.", "Er is geen vaste route. Een opleiding in ICT, ontwerp of bedrijfskunde helpt, en vooral veel zelf bouwen en uitproberen.", [["Softwareontwikkelaar", "mbo / hbo / wo"], ["UX-ontwerper", "hbo"], ["Productmanager", "hbo / wo"], ["Data-analist", "hbo / wo"], ["Ondernemer", "elk niveau"]], ["ict", "management"]],
  ["Dick Bruna", "tekenaar van Nijntje", "Met een paar lijnen een figuur maken die de hele wereld kent. Daar is veel oefening voor nodig.", "Een opleiding illustratie, animatie of grafisch ontwerp op mbo of hbo, en een portfolio dat laat zien wat jij kunt.", [["Illustrator", "hbo"], ["Animator", "mbo / hbo"], ["Ontwerper van games", "mbo / hbo"], ["Grafisch ontwerper", "mbo / hbo"], ["Kinderboekenmaker", "elk niveau"]], ["design", "communicatie"]]
];

// "Mensen vinden mij te …": een minpunt dat ergens een kracht is.
// [te …, ander woord, waarom het een kracht is, [groepen]]
const TE = [
  ["druk", "vol energie", "Je hebt energie voor tien. In werk waar je veel beweegt en snel schakelt, zoals sport, evenementen of de spoedeisende hulp, is dat goud waard.", ["therapie", "horeca", "zorg"]],
  ["stil", "rustig en geconcentreerd", "Je kunt lang ergens in opgaan zonder afgeleid te raken. Handig bij onderzoek, programmeren, in een lab of bij het controleren van cijfers.", ["natuur", "ict", "economie"]],
  ["eigenwijs", "zelfstandig, met een eigen koers", "Je laat je niet zomaar overhalen. Ondernemers, onderzoekers en ontwerpers hebben dat nodig om iets nieuws te maken.", ["management", "natuur", "design"]],
  ["gevoelig", "empathisch", "Je voelt goed aan wat er met anderen aan de hand is. In de zorg, het sociaal werk, de psychologie of de kunst is dat een kracht.", ["zorg", "sociaal", "gedrag"]],
  ["kritisch", "scherp", "Je ziet snel wat niet klopt. Juristen, journalisten en accountants doen niet anders.", ["recht", "communicatie", "economie"]],
  ["perfectionistisch", "nauwkeurig", "Bijna goed is voor jou niet goed. In een lab, de techniek of bij het controleren van geld is dat precies wat nodig is.", ["natuur", "techniek", "economie"]],
  ["dromerig", "vol verbeelding", "Je hoofd zit vol ideeën. Ontwerpers, schrijvers en makers leven daarvan.", ["design", "muziek", "communicatie"]],
  ["bazig", "een natuurlijke leider", "Je neemt makkelijk de leiding. Teams, projecten en bedrijven hebben mensen nodig die knopen doorhakken.", ["management", "veilig", "horeca"]],
  ["nieuwsgierig", "onderzoekend", "Je wilt altijd weten hoe het zit. Onderzoekers, journalisten en psychologen moeten precies dat.", ["natuur", "communicatie", "gedrag"]],
  ["praatgraag", "een verbinder", "Je kunt met iedereen praten. In verkoop, communicatie en het onderwijs is dat je belangrijkste gereedschap.", ["marketing", "onderwijs", "communicatie"]],
  ["chaotisch", "flexibel", "Je raakt niet in paniek als plannen veranderen. Bij evenementen, in de horeca of op een filmset is improviseren een vak.", ["horeca", "design", "muziek"]],
  ["ongeduldig", "een doener", "Je wilt resultaat zien. In de techniek, de bouw of de beveiliging pak je dingen direct aan.", ["techniek", "bouw", "veilig"]],
  ["bemoeizuchtig", "betrokken", "Je trekt je het lot van anderen aan. Sociaal werkers, coaches en mensen op personeelszaken doen dat de hele dag.", ["sociaal", "gedrag", "management"]],
  ["serieus", "verantwoordelijk", "Je neemt dingen niet licht op. Daar ben je blij mee in de zorg, de rechtspraak of als je met geld van anderen werkt.", ["zorg", "recht", "economie"]]
];

// Plan B: wat als het niet lukt? [situatie, wanneer, [stappen]]
const PLANB = [
  ["Uitgeloot of niet geselecteerd", "Bij een hbo- of wo-opleiding met selectie of loting hoor je uiterlijk 15 april of je bent geplaatst.", [
    "Schrik niet: je bent niet de enige. Bij populaire opleidingen valt een groot deel af.",
    "Je mag je daarna nog aanmelden voor een andere opleiding, ook na 1 mei. Doe het wel zo snel mogelijk.",
    "Kijk naar een verwante opleiding zonder selectie. Wil je arts worden? Dan kun je bijvoorbeeld beginnen met biomedische wetenschappen of verpleegkunde.",
    "Probeer het volgend jaar opnieuw. Hoe vaak dat mag, verschilt per opleiding.",
    "Gebruik het jaar ertussen: werk of vrijwilligerswerk in het vak helpt vaak bij de volgende selectie."]],
  ["Portfolio, auditie of toelatingsexamen niet gehaald", "Bij kunst, muziek, dans, sport of een academie met een toelatingsexamen.", [
    "Vraag om uitleg: wat ontbrak er? Daar leer je het meest van.",
    "Doe een vooropleiding of oriëntatiejaar. Veel kunstacademies en conservatoria hebben er een.",
    "Probeer een andere school: elke academie kijkt anders.",
    "Kies een verwante opleiding op mbo of hbo, bijvoorbeeld mediavormgeving of communicatie, en stroom later door."]],
  ["De mbo-opleiding zit vol", "Sommige mbo-opleidingen hebben een maximum aantal plaatsen.", [
    "Meld je je vóór 1 april aan, dan heb je toelatingsrecht. Bij opleidingen met een maximum aantal plaatsen kan het toch vol zijn.",
    "De school moet je dan helpen zoeken naar een andere plek of opleiding. Vraag daar gewoon om.",
    "Kijk bij een andere mbo-school in de buurt: daar kan dezelfde opleiding nog plek hebben.",
    "Of begin op een ander niveau en stroom door: van niveau 3 naar 4 kan vaak."]],
  ["Het eerste jaar gaat niet goed", "Je zit al op een opleiding, maar het past niet of je haalt je punten niet.", [
    "Veel hbo- en wo-opleidingen hebben een bindend studieadvies (BSA): haal je te weinig punten, dan moet je stoppen met die opleiding.",
    "Praat op tijd met je studieloopbaanbegeleider of de studentendecaan. Bij ziekte of problemen thuis kan er rekening mee worden gehouden.",
    "Switchen is heel normaal. Veel studenten kiezen na het eerste jaar iets anders, en dat is geen verloren tijd.",
    "Stop je? Meld je dan op tijd af via Studielink en bij DUO. Anders blijf je collegegeld betalen of krijg je geld dat je terug moet geven."]],
  ["Je weet het nog niet", "Je twijfelt nog te veel om nu al te kiezen.", [
    "Je hoeft niet meteen te beginnen. Een tussenjaar met werk, vrijwilligerswerk of reizen is prima.",
    "Twijfel je? Meld je dan toch vast aan. Afmelden kan altijd, te laat aanmelden niet altijd.",
    "Ga meelopen bij twee of drie opleidingen. Een dag meedoen zegt meer dan tien websites."]]
];
