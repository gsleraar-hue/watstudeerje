# Wat studeer je eigenlijk?

Studiekeuzewebsite voor leerlingen én ouders. De site vertaalt opleidingsnamen naar gewone taal (wat is het, wat kun je ermee, wat heb je ervoor nodig) en bevat een test op basis van interesses, kwaliteiten en waarden. De test vraagt bewust niet naar schoolvakken.

Statische site, geen build nodig.

```bash
python -m http.server 8765
```

Open daarna http://localhost:8765.

## Bestanden

| Bestand | Inhoud |
| --- | --- |
| `index.html` | Pagina |
| `richting.css` | Opmaak |
| `app.js` | Gedrag: filters, groepen, test en uitslag |
| `data.js` | Richtingen, test-stellingen, 23 opleidingen met eigen uitleg |
| `uitleg.js` | Wat kun je ermee en wat heb je nodig per groep, woordenlijst, Engelse namen |
| `opleidingen.js` | 547 hbo/wo-opleidingen, gegroepeerd (gegenereerd uit DUO-data) |
| `scholen.js` | Welke vestiging bij welke school hoort, voor de schoolpagina's (`tools/build_scholen.py`, daarna `tools/build_seo.py`) |

## Bronnen

Opleidingenlijst: [DUO, Overzicht Erkenningen ho (RIO)](https://onderwijsdata.duo.nl/datasets/overzicht-erkenningen-ho), open data, licentie CC BY. Peildatum 31-10-2026. De groepering volgt de ISCED-indeling uit die data.

## Nog niet gedaan

- mbo-opleidingen (aparte DUO-data)
- Links naar de websites van de scholen zelf (de DUO-data bevat geen web-adressen). Bewust geen afhankelijkheid van andere keuzesites: de data staat in de repository en de site laadt niets van buiten.
- Studentbeoordelingen zijn weggelaten. Die komen uit de Studiekeuzedatabase van LCSK, waarvoor een aanvraag nodig is.
- De uitleg bij de 523 opleidingen zonder eigen tekst komt nu van de groep. De wegingen in de test zijn een eerste inschatting en niet gevalideerd.
