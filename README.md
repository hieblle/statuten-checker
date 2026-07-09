# Statuten-Checker für Sportvereine (Österreich)

KI-gestützte **Erstprüfung von Vereinsstatuten** für österreichische Sportvereine.
Lade einen Entwurf hoch (`.docx`, `.pdf`, `.txt`) und erhalte ein **Ampel-Feedback**
sowie eine detaillierte Bewertung pro Prüfpunkt – inklusive konkreter
Korrekturvorschläge.

Grundlage der Prüfung:

- **Vereinsgesetz 2002 (VerG)** – zwingender Mindestinhalt der Statuten (§ 3 Abs 2) und Organe (§ 5)
- **Gemeinnützigkeit / Steuerbegünstigung** – BAO §§ 34 ff & § 4a EStG (Körpersport ist gemeinnützig)
- **SPORTUNION-Musterstatuten** (Haupt- & Zweigverein) als Goldstandard-Referenz

> ⚖️ **Kein Ersatz für Rechtsberatung.** Das Tool liefert eine automatische
> Orientierungshilfe. Maßgeblich bleiben Vereinsbehörde, Finanzamt und der
> zuständige SPORTUNION-Landesverband.

---

## Wie es funktioniert (Hybrid: Regeln + KI)

1. **Extraktion** – der Text wird aus `.docx`/`.pdf`/`.txt` gelesen. Das Format
   wird an den „Magic Bytes“ erkannt, nicht an der Dateiendung (eine als `.doc`
   benannte, in Wahrheit `.docx`-Datei wird korrekt verarbeitet).
2. **Regelbasierte Vorprüfung** (ohne KI) – erkennt Vereinstyp
   (Haupt-/Zweig-/eigenständiger Verein), offene Platzhalter (`____`, `[Name]`,
   `TT. Monat Jahr`, `PLZ Ort`, …) und Schlüsselbegriffe.
3. **KI-Analyse** – ein OpenAI-Modell bewertet jeden Punkt des **Prüfkatalogs**
   gegen den Entwurf und liefert für jeden Punkt: Status (grün/orange/rot),
   Begründung, Zitat aus dem Entwurf und – bei Problemen – einen einfügefertigen
   Korrekturvorschlag (Structured Outputs, Zod-validiert).
4. **Ampel** – die Gesamt- und Kategorie-Ampel wird **deterministisch** aus den
   Einzelurteilen berechnet (nicht vom Modell „geraten“):
   - 🟢 **grün** – alle anwendbaren Punkte erfüllt
   - 🟠 **orange** – kein kritischer Fehler, aber Kleinigkeiten prüfen/nachbessern
   - 🔴 **rot** – mindestens ein **kritischer** Punkt nicht erfüllt

Der Prüfkatalog umfasst aktuell **31 Punkte** in vier Kategorien:
Gesetzliche Pflichtangaben · Gemeinnützigkeit & Steuer · SPORTUNION-Vorgaben ·
Qualität & Vollständigkeit.

---

## Schnellstart (lokal)

Voraussetzungen: **Node.js ≥ 18** (getestet mit Node 25) und ein
**OpenAI-API-Key** (https://platform.openai.com → API Keys).

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. API-Key hinterlegen
cp .env.local.example .env.local
#   -> .env.local öffnen und OPENAI_API_KEY=sk-... eintragen

# 3. Starten
npm run dev
#   -> http://localhost:3000 im Browser öffnen
```

Statuten-Entwurf hochladen, „Statuten prüfen“ klicken – fertig.

---

## Konfiguration (`.env.local`)

| Variable           | Pflicht | Bedeutung                                                                 |
| ------------------ | ------- | ------------------------------------------------------------------------- |
| `OPENAI_API_KEY`   | ✅      | Dein OpenAI-API-Key.                                                      |
| `OPENAI_MODEL`     | –       | Modell. Standard `gpt-5.4-mini`. Mehr Sorgfalt: `gpt-5.4` / `gpt-5.5`.    |
| `APP_ACCESS_TOKEN` | –       | Wenn gesetzt, muss jeder Request den Header `x-app-token` mitschicken (einfacher Zugriffsschutz fürs Deployment). |

**Kosten/Qualität:** Standard ist `gpt-5.4-mini` – ein Reasoning-Modell mit
strikten Structured Outputs für wenige Cent pro Prüfung. Für besonders knifflige
Fälle liefert `gpt-5.4` (bzw. `gpt-5.5`) mehr Sorgfalt, kostet aber ein Vielfaches
(Modell via `OPENAI_MODEL`). Der stabile, vorangestellte Teil des Prompts
(Prüfkatalog + Musterstatuten-Referenz) wird von OpenAI automatisch gecacht, was
wiederholte Prüfungen verbilligt. Wichtig: Das gewählte Modell muss **Structured
Outputs** unterstützen (die GPT-5-Familie tut das); Reasoning-Modelle steuern die
Gründlichkeit über `reasoning_effort` (im Code auf „medium“).

---

## Deployment

Die App ist eine Standard-Next.js-App und lässt sich z. B. auf **Vercel**
deployen:

1. Repo zu Vercel pushen/importieren.
2. Environment-Variablen setzen: `OPENAI_API_KEY` (und optional
   `OPENAI_MODEL`, `APP_ACCESS_TOKEN`).
3. Deployen.

Hinweise:

- Die Analyse kann 20–90 Sekunden dauern. Die API-Route ist auf `maxDuration = 120`
  gesetzt (Vercel Pro). Bei Timeouts: `reasoning_effort` in `lib/analyze.ts` auf
  „low“ senken bzw. `maxDuration` in `app/api/analyze/route.ts` erhöhen.
- **Datenschutz:** Hochgeladene Statuten enthalten oft personenbezogene Daten.
  Sie werden zur Analyse an die OpenAI-API gesendet und von dieser App **nicht
  gespeichert** (kein Datenbank-/Datei-Persistieren). Für öffentlichen Betrieb
  empfiehlt sich `APP_ACCESS_TOKEN` und ein Hinweis auf die Verarbeitung.

---

## Projektstruktur

```
app/
  page.tsx                 UI-Seite (Header, Legende)
  api/analyze/route.ts     POST: Upload -> Extraktion -> Struktur -> KI -> Ergebnis
components/
  StatutenChecker.tsx      Upload + Ergebnisdarstellung (Ampel, Karten, Korrekturen)
lib/
  knowledge-base.ts        ★ Der Prüfkatalog (alle Prüfpunkte) – hier erweitern
  musterstatuten.ts        SPORTUNION-Musterstatuten als Referenztext (auto-generiert)
  extract.ts               docx/pdf/txt -> Text (Magic-Byte-Erkennung)
  structural.ts            Regelbasierte Vorprüfung (Vereinstyp, Platzhalter, Signale)
  analyze.ts               OpenAI-Aufruf (Structured Outputs)
  scoring.ts               Aggregation der Urteile zur Ampel
  types.ts                 Gemeinsame Typen
```

### Prüfkatalog erweitern/anpassen

Der gesamte fachliche Inhalt steckt in [`lib/knowledge-base.ts`](lib/knowledge-base.ts).
Ein Prüfpunkt sieht so aus:

```ts
{
  id: "g-zweck",
  titel: "Vereinszweck (klar & umfassend)",
  paragraph: "§ 2",
  category: "gesetzlich",          // gesetzlich | gemeinnuetzigkeit | sportunion | qualitaet
  severity: "kritisch",            // kritisch | wichtig | empfohlen
  rechtsgrundlage: "§ 3 Abs 2 Z 3 VerG 2002",
  anforderung: "Was die Statuten enthalten müssen …",
  pruefhinweis: "Worauf besonders zu achten ist / typische Fehler …",
}
```

Neue Punkte einfach ergänzen – sie erscheinen automatisch in Prompt, Bewertung
und UI. `severity: "kritisch"` bedeutet: ein „rot“ schaltet die Gesamtampel auf rot.

Die Musterstatuten-Referenz (`lib/musterstatuten.ts`) wurde aus der
SPORTUNION-Vorlage (Hauptverein) generiert und dient dem Modell als Goldstandard
für Korrekturvorschläge.

---

## Befehle

```bash
npm run dev     # Entwicklungsserver (http://localhost:3000)
npm run build   # Produktions-Build (inkl. Typecheck)
npm run start   # Produktionsserver (nach build)
npm run lint    # ESLint
```
