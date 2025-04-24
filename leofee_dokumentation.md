# Leofee – Dokumentation

## 1. Entwicklungsumgebung

### 1.1 Datenbank, Reverse Proxy & Container Setup

Für das lokale Starten des Projekts wird Docker verwendet. Es laufen mehrere Services in Containern: eine MySQL-Datenbank, das Backend sowie der Traefik-Server für Routing.

Die relevanten Konfigurationsdateien liegen im Ordner `composes`.

Starten der Umgebung:

```bash
docker compose -f docker-compose.yml up
```

**Voraussetzungen:**

- Docker  
- Docker Compose

Mit `docker ps` kann überprüft werden, ob alle Container erfolgreich laufen.

---

### 1.2 Backend

Das Backend ist in ASP.NET Core geschrieben und in verschiedene Module aufgeteilt:

- `Core`: Enthält Businesslogik, Models und Interfaces  
- `Persistence`: Implementiert den Datenbankzugriff via Entity Framework  
- `WebAPI`: Hauptprojekt für Endpunkte & Konfiguration  
- `Import`: Zusatztool zum Einlesen von Daten  
- `IntegrationTests`: Testprojekt für automatisierte Backend-Tests

**Entwicklung & Start:**

- Öffnen in Visual Studio, VS Code oder Rider  
- Starten per Terminal:

```bash
cd Import
dotnet watch run
```

- Oder als Startprojekt in der IDE auswählen und starten

**Voraussetzung:**  
.NET 8 SDK muss installiert sein

---

### 1.3 Frontend

Das Projekt besteht aus **drei Angular-Anwendungen**, welcher unter **Komponenten** genauer erklärt werden, die jeweils auf verschiedene Benutzergruppen und Anwendungsfälle ausgerichtet sind.

#### Frontend-Struktur

Die Frontend-Dateien sind in folgende Hauptordner unterteilt:

#####  assets

Alle statischen Assets wie Bilder befinden sich in diesem Ordner.

##### components

Dieser Ordner enthält wiederverwendbare UI-Elemente und spezifische Teile von einzelnen Bildschirmen. Komponenten, die auf mehreren Bildschirmen genutzt werden (z.B. die Navigationsleiste), liegen **app.component.____** files. Bildschirm-spezifische Komponenten befinden sich in Unterordnern, die nach dem jeweiligen Bildschirm benannt sind.

##### environments

Dieser Ordner beinhaltet die verschiedenen Umgebungsvariablen für unterschiedliche Modi, wie zum Beispiel Production oder Development.

##### model

Der Ordner `model` beinhaltet alle Interface-Definitionen, die im Frontend verwendet werden.
##### services

Hier befinden sich die verschiedenen HTTP-Clients der Frontends sowie weitere Hilfsdienste

**Setup für alle Angular-Projekte:**

- Terminal öffnen im jeweiligen Projektordner  
- Abhängigkeiten installieren:

```bash
npm install
```

- Anwendung starten:

```bash
ng serve
```

**Alternativ:** In WebStorm mit dem grünen Play-Button starten

**Voraussetzung:**

- Node.js (LTS empfohlen)  
- Angular CLI (global installiert)


## 2. Komponenten
### Frontend
---
### `S-mobile`

Dies ist die mobile Webanwendung, welche von Schüler:innen verwendet wird.  
Sie dient dazu, eingelöste Gutscheine anzuzeigen und einzulösen. Die Benutzeroberfläche ist dabei speziell für Mobilgeräte optimiert, um eine möglichst einfache und schnelle Bedienung zu ermöglichen.

### `Dashboard`

Die webbasierte Verwaltungsoberfläche für Lehrkräfte.

**Funktionen:**

- **Gutscheinverwaltung:**  
  Lehrkräfte können neue Gutscheine anlegen. Dabei müssen Datum, genaue Uhrzeit sowie der Betrag des Gutscheins angegeben werden. Noch nicht aktivierte Bons können auch nachträglich bearbeitet bzw. aktualisiert werden.

- **Benutzerverwaltung:**  
  Lehrkräfte / Schüler mit Zugang zum Leofee-Dashboard können verwaltet werden. Hier lassen sich neue Nutzer hinzufügen oder nicht mehr benötigte Nutzer löschen.

- **Schülerverwaltung:**  
  Die Lehrkraft kann Schüler:innen importieren, für die der Gutschein gelten soll. Es besteht auch die Möglichkeit, einzelne Schüler manuell hinzuzufügen.  
  Zusätzlich gibt es umfangreiche Filter- und Suchfunktionen zur besseren Übersicht und Verwaltung der Liste.

###  `Kassa-app`

Diese App wird am Schulbuffet – insbesondere am Tag der offenen Tür – verwendet.

**Funktionen:**

- Scannen und Verwalten von Gutscheinen vor Ort.
- Durchführung von bargeldlosen Bezahlvorgängen.
- Die Anwendung ist für schnelle Interaktion und eine einfache Handhabung im stressigen Buffetbetrieb ausgelegt.

### Backend
---
### `WebAPI`

Die `WebAPI` ist das Hauptprojekt des Backends und die zentrale Schnittstelle für Frontend-Anwendungen. Sie stellt RESTful APIs über Controller bereit, welche die Anwendungslogik kapseln und mit den Backend-Modulen interagieren.

Die wichtigsten Controller sind:

* **BonsController:** Verwaltet Gutscheine (Erstellen, Lesen, Aktualisieren, Löschen).
* **StudentsController:** Verwaltet Schülerdaten (Erstellen, Lesen, Aktualisieren, Löschen) und wickelt Bezahlvorgänge ab (`Pay`).
* **PingController:** Bietet administrative Funktionen für die Datenbank (Löschen und Neuaufbau).
* **TransactionsController:** Verwaltet Transaktionen (Erstellen, Lesen, Aktualisieren).
* **WhiteListController:** Verwaltet eine Liste berechtigter Benutzer (Erstellen, Lesen, Aktualisieren, Löschen).

Die Controller der `WebAPI` empfangen Anfragen, verarbeiten sie mit der Businesslogik des `Core`-Moduls und greifen über das `Persistence`-Modul auf die Datenbank zu. Die Ergebnisse werden als JSON an die Clients zurückgesendet.

### `Base`

Im Ordner `Base` liegen die ganz einfachen, immer gleichen Code-Teile für unser .NET-Projekt. Das ist wie ein Werkzeugkasten mit Standardwerkzeugen, die wir immer wieder brauchen und normalerweise nicht verändern.

### `Core`

Hier steckt das Herzstück der Logik. Es enthält die Baupläne für unsere Daten und wie alles zusammenhängt.

* **Daten (`Entities`):** Das sind die Modelle für unsere Informationen, wie zum Beispiel ein Benutzer oder ein Gutschein. Diese Infos speichern wir in der Datenbank.
* **Verträge (`Contracts`):** Hier legen wir fest, welche Möglichkeiten wir haben, um auf unsere Daten zuzugreifen (z.B. Daten holen, speichern). Für jede Art von Information, die wir brauchen, gibt es so einen "Vertrag". Wie wir diese Möglichkeiten dann wirklich nutzen, steht woanders.
* **Datenpakete (`DataTransferObjects`):** Das sind spezielle "Interfaces", in die wir unsere Daten packen, wenn wir sie zwischen verschiedenen Teilen des Programms hin- und herschicken, zum Beispiel zur Anzeige im Frontend.


### `Persistence`

Hier kümmern wir uns darum, wie die Daten in der Datenbank gespeichert und wiedergefunden werden. Wenn wir unsere Datenmodelle ändern, müssen wir der Datenbank sagen, wie sie sich anpassen soll (Migration).

* Der `ApplicationDbContext` ist wie eine Art Manager für unsere Datenbank. Für jede Art von Information haben wir dort eine Art "Tabelle" eingerichtet (`DbSet`).
* In `Persistence` schreiben wir den genauen Code, wie wir die "Verträge" aus `Core` umsetzen, also wie wir wirklich Daten holen oder speichern. Oft nutzen wir dabei eine Art Grundwerkzeug (`BaseRepository`), das schon die wichtigsten Standardfunktionen dafür mitbringt.
* Der `UnitOfWork` ist wie ein Helfer, der sich um alle unsere "Daten-Werkzeuge" (`Repositories`) kümmert und sicherstellt, dass alles gut zusammenarbeitet, besonders wenn mehrere Dinge gleichzeitig in der Datenbank geändert werden sollen.

### `Import`

Dieses Projekt dient dazu, generierte Testdaten in die Datenbank einzufügen. Es ist ein Werkzeug, um die Anwendung mit Beispieldaten zu füllen, beispielsweise für Demonstrationen oder erste Tests, ohne diese manuell eingeben zu müssen.

### `IntegrationTests`

Das Projekt `IntegrationTests` beinhaltet automatisierte Tests, die das Zusammenspiel verschiedener Teile des Backends überprüfen. Im Gegensatz zu Unit-Tests, die einzelne Komponenten isoliert testen, stellen Integrationstests sicher, dass die Module (z.B. `WebAPI`, `Core`, `Persistence`) korrekt zusammenarbeiten und die gesamte Funktionalität wie erwartet gegeben ist.

---

## 3. Hosting

### 3.1 GitHub Actions

Sobald ein Push in den `main`-Branch erfolgt, startet automatisch ein GitHub Actions Workflow. Dieser Workflow erstellt Docker-Images für das Frontend und Backend und überträgt sie auf Docker Hub. Die Konfiguration dazu liegt in `.github/workflows`.

```yaml
on:
  push:
    branches: [ "main" ]
```

> Dieser Abschnitt legt fest, dass der Workflow bei Änderungen am `main`-Branch ausgelöst wird.

```yaml
env:
   REGISTRY: docker.io
  IMAGE_NAME_DASHBOARD: ${{ secrets.DOCKERHUB_USERNAME }}/dashboard  
  IMAGE_NAME_KASSA_APP: ${{ secrets.DOCKERHUB_USERNAME }}/kassa-app  
  IMAGE_NAME_S_MOBILE_KEYCLOAK: ${{ secrets.DOCKERHUB_USERNAME }}/s-mobile
  IMAGE_NAME_BACKEND: ${{ secrets.DOCKERHUB_USERNAME }}/leofee-backend
```

> Hier werden Umgebungsvariablen gesetzt, darunter die Namen der zu erstellenden Docker-Images. Die Zugangsdaten für Docker Hub sind sicher als Secrets im GitHub-Repository gespeichert.

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Docker Build dashboard
        uses: docker/build-push-action@v4
        with:
          context: ./dashboard  
          push: true
          tags: ${{ env.IMAGE_NAME_DASHBOARD }}  

      - name: Docker Build kassa-app
        uses: docker/build-push-action@v4
        with:
          context: ./kassa-app  
          push: true
          tags: ${{ env.IMAGE_NAME_KASSA_APP }}  

      - name: Docker Build s-mobile-keycloak
        uses: docker/build-push-action@v4
        with:
          context: ./s-mobile-keycloak/s-mobile  
          push: true
          tags: ${{ env.IMAGE_NAME_S_MOBILE_KEYCLOAK }}  

      - name: Docker Build backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend/tdot-backend  
          push: true
          tags: ${{ env.IMAGE_NAME_BACKEND }}
```

> Dieser `jobs`-Abschnitt beschreibt die einzelnen Schritte: Repository auschecken, QEMU & Buildx einrichten, bei Docker Hub anmelden sowie das Bauen und Veröffentlichen der Images.

Mit folgendem Befehl lassen sich die Images anschließend lokal ziehen:

```bash
docker pull <dockerhub_username>/<image_name>
```

---

### 3.2 Verbindung zur VM

Die Verbindung zur Schul-VM erfolgt per SSH:

```bash
ssh vm45.htl-leonding.ac.at
```

---

### 3.3 Docker Compose

Auf dem Server ist eine `docker-compose.yaml`-Datei abgelegt. Mit folgendem Befehl lassen sich alle Container im Hintergrund starten:

```bash
docker compose up -d
```






---

## 3.4 Neue Version bereitstellen

Um eine aktualisierte Version der Anwendung live zu schalten, befolge folgende Schritte:

1. Änderungen in den `main`-Branch pushen.
2. Über SSH mit der VM verbinden:

```bash
ssh vm45.htl-leonding.ac.at
```

3. Neueste Images von Docker Hub laden:

```bash
docker pull samue010203/leofee-backend
...
```

4. Laufende Container stoppen und neue starten:

```bash
docker compose down
docker compose up -d
```