# Bayerische Nationalmannschaft
Die App erlaubt es eine eigene Mannschaft aus bayerischen Erst- und Zweitligaspielern aufzustellen. Die Aufstellung wir als Location Hash (#adaj-akavcoab-acaeaaaf-ag) gespeichert und kann so über die sozialen Netzwerke geteilt werden. Entwickelt wurde die App für das Projekt [Heimvorteil – Woher stammt die Liga](http://web.br.de/woher-stammt-die-liga/).

- **BR:** [Wähle deine bayerische Nationalmannschaft](http://web.br.de/interaktiv/heimvorteil-nationalmannschaft/#adaj-akavcoab-acaeaaaf-ag)
- **SWR:** [Wähle Deine Südwest-Elf der Saison](http://www.swr.de/sport/fussball-voting-waehle-deine-suedwest-elf-der-saison/-/id=13831144/did=19555592/nid=13831144/182zxt1/index.html)

### Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Projekt bauen mit `grunt dist`
4. Website über Apache oder einen ähnlichen HTTP-Server ausliefern

Der Quellcode befindet sich im Verzeichnis `src/`, der optimierte Build findet sich in `dist/`.

### Daten
Alle Spielerdaten beruhen auf Vereinsangaben. Die Anwendungsdaten sind in einem JSON-Dictionary `players.json` gespeichert. Die ID ist jeweils eine zweistellige Buchstabenkombination (aa bis zz).

```json
{
  "ab": {
    "id": "ab",
    "name": "Mario Götze",
    "team": "FC Bayern München",
    "team_short": "FCB",
    "pos": "Mittelfeld",
    "rnr": 19,
    "geb_tag": "03.06.1992",
    "geb_ort": "Memmingen",
    "reg_bezirk": "Schwaben"
  }
}
```

### Tracking
Alle Benutzeraufstellungen werden in ein [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1Flk6E-hy1aHmIno3nkp9n8f2eFBYu4E4Q1tRKCNBheI/) gespeichert. Die Anbindung erfolgt dabei über ein [Skript](https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/) im Google Spreadsheet, welches die Requests entgegennimmt. Der Request selbst ist ein einfacher POST-Request:

```javascript
request.open('POST','https://script.google.com/macros/s/AKfycbzvz2UDsyp6Iy7YMMVbbnUSKwfCsmrabnVBPlGscrz1STIfGEgE/exec', true);
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
request.send('adaj-abatasav-axaiacbg-ag');
```

### Datenauswertung
Die Anwendung enthält ein Webanwendung, um die gespeicherten Benutzeraufstellungen auszuwerten. Die Anwendung befindet sich im Ordner `analysis/`. Das Tool verwendet eine Kopie der aktuellen Spielerdaten `players.json`. Damit die Auswertung klappt, muss diese Datei aktuell sein. Fernen benötigt die Anwendung diverse JavaScript-Bibliotheken, welche über NPM installiert werden müssen. 

Die Bibliothek zur Anbindung von Google Spreadsheets ist mittlerweile veraltet und beinhaltet mehrere – vermutlich unkritische – Sicherheitslücken. Daher muss sie manuell installiert werden:

```
$ npm i miso.dataset
```

### Entwickeln
Zum lokalen Entwickeln ist ein kleiner [HTTP-Server](https://github.com/indexzero/http-server) integriert. Diesen kann man mit dem Befehl `npm start` starten. Der Server läuft unter http://localhost:8080. Beim Starten des Entwicklungsservers sollte automatisch ein neues Browserfenster aufgehen.

Um die Sass-Styles bei jeder Änderungen neu zu kompilieren, kann man den Sass-Watcher laufen lassen `npm run-script watch` oder `grunt watch`. Als Compiler kommt [LibSass](http://sass-lang.com/libSass) zum Einsatz, welches deutlich schneller ist als der alte Ruby-Sass-Compiler. 

Mithilfe des Taskrunners Grunt kann eine optimierte Version der Seite gebaut werden. Dabei wird:
- JavaScript wird minifiziert und in eine Datei zusammengefasst (uglify)
- Stylesheet werden geprefixt, minifiziert und zusammengefasst (PostCSS)
- HTML-Script und Style-Tags werden angepasst (Usemin)
- Bilder und Daten werden kopiert (copy)

Der Grunt Build-Tasks kann mit `npm run build` ausgeführt werden. Die optimierte Version des Webseite liegt nach Ausführen des Grunt Tasks unter `dist`.

### Lizenz
Der Quellcode diese Projekts wurde unter einer MIT-Lizenz veröffentlicht. Nicht in der Lizenz enthalten sind die Spielerbilder und Vereinslogos im Ordner `images/`. Alle Spielerbilder und Vereinslogos sind urheberrechtlich geschützt und dürfen nicht weiterverwendet werden.

### Bekannte Probleme
- Drag and Drop unter IE8 funktioniert nicht
- Scrollen auf Geräten mit kleinen Viewport ist schwierig
- Tracking-Requests können mehr als einmal abgesendet werden
