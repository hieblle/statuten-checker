// KI-Analyse mit OpenAI.
// Hybrid: deterministische Strukturbefunde + KI-Urteil pro Prüfpunkt.
//
// Aufbau des Prompts (nutzt das automatische Prompt-Caching von OpenAI für den
// stabilen, vorangestellten Teil):
//   System-Message : Rolle + Aufgabe + Regeln + Prüfkatalog + Musterstatuten   (stabil)
//   User-Message   : der hochgeladene Entwurf + Strukturkontext                (variabel)
//
// Die Antwort wird über Structured Outputs (zodResponseFormat) erzwungen und
// liefert genau ein Urteil je Prüfpunkt. Die Ampel wird daraus deterministisch
// berechnet (scoring.ts).

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod/v4";
import { CHECKS } from "./knowledge-base";
import { MUSTERSTATUTEN_HAUPTVEREIN } from "./musterstatuten";
import { structuralContextForPrompt, type StructuralAnalysis } from "./structural";
import type { CheckResult, CheckStatus } from "./types";

// Standard: gpt-5.4-mini – aktuelles Reasoning-Modell mit strikten Structured
// Outputs, gute juristische Feinbeurteilung zu wenigen Cent pro Prüfung.
// Über OPENAI_MODEL umstellbar (z. B. "gpt-5.4" für mehr Sorgfalt).
export const DEFAULT_MODEL = "gpt-5.4-mini";

// Reasoning-Aufwand der GPT-5-/o-Serie: "low" = schneller/günstiger,
// "medium" = guter Standard für die Statutenprüfung, "high"/"xhigh" = gründlicher.
const REASONING_EFFORT = "medium" as const;

/** GPT-5- und o-Serie sind Reasoning-Modelle: kein „temperature“, dafür „reasoning_effort“. */
function istReasoningModell(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

export class AnalyzeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyzeError";
  }
}

// ── Schema der KI-Antwort ─────────────────────────────────────────────────────
const VerdictSchema = z.object({
  id: z.string(),
  status: z.enum(["gruen", "orange", "rot", "nicht_anwendbar"]),
  begruendung: z.string(),
  fundstelle: z.string(), // "" wenn keine
  korrekturvorschlag: z.string(), // "" wenn nicht nötig
});
const ResultSchema = z.object({
  zusammenfassung: z.string(),
  pruefungen: z.array(VerdictSchema),
});
type ResultShape = z.infer<typeof ResultSchema>;

// ── Prompt-Bausteine ──────────────────────────────────────────────────────────
function renderKatalog(): string {
  return CHECKS.map((c, i) => {
    const marker = c.erstpruefung ? " ⟵ [ERSTPRÜFUNG]" : "";
    return [
      `${i + 1}. [id: ${c.id}] ${c.titel}${marker}  (${c.paragraph})`,
      `   Kategorie: ${c.category} | Schweregrad: ${c.severity} | Rechtsgrundlage: ${c.rechtsgrundlage}`,
      `   Anforderung: ${c.anforderung}`,
      `   Prüfhinweis: ${c.pruefhinweis}`,
      c.nurMitZweigstruktur
        ? "   Hinweis: Nur relevant für Haupt-/Zweigvereine; sonst status = nicht_anwendbar."
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n\n");
}

const SYSTEM_PROMPT = `Du bist eine erfahrene österreichische Vereinsjuristin mit Spezialisierung auf Vereinsrecht (Vereinsgesetz 2002) und Gemeinnützigkeitsrecht (Bundesabgabenordnung §§ 34 ff, EStG) für Sportvereine. Du prüfst den Entwurf von Vereinsstatuten gegen einen vorgegebenen Prüfkatalog; die SPORTUNION-Musterstatuten dienen als Goldstandard-Referenz.

Für JEDEN Prüfpunkt des Katalogs gibst du genau ein Urteil ab:
- "gruen": Anforderung klar und vollständig erfüllt.
- "orange": teilweise erfüllt, unklar/zweideutig oder verbesserungswürdig – eine manuelle Kontrolle ist nötig.
- "rot": Anforderung nicht erfüllt, fehlerhaft oder widersprüchlich.
- "nicht_anwendbar": Prüfpunkt trifft auf diesen konkreten Verein nicht zu.

Regeln:
- Beurteile AUSSCHLIESSLICH anhand des vorgelegten Entwurfstextes. Erfinde nichts. Was nicht im Text steht, gilt als nicht geregelt.
- Sei juristisch genau und eher streng, aber fair. Im Zweifel (unklare oder nur teilweise Regelung) → "orange", niemals vorschnell "gruen".
- "begruendung": 1–3 Sätze auf Deutsch, konkret und mit Bezug auf die tatsächliche Stelle im Entwurf. Für Vereinsfunktionär:innen (oft Laien) verständlich.
- "fundstelle": ein kurzes wörtliches Zitat aus dem ENTWURF, das dein Urteil stützt. Wenn die Regelung fehlt: "".
- "korrekturvorschlag": bei "orange" und "rot" IMMER ein konkreter, einfügefertiger Formulierungsvorschlag, orientiert an den Musterstatuten. Bei "gruen"/"nicht_anwendbar": "".
- Verwende exakt die vorgegebenen Prüfpunkt-IDs und gib GENAU EINEN Eintrag pro ID zurück (keine zusätzlichen, keine fehlenden).
- "zusammenfassung": 2–4 Sätze Gesamteinschätzung in klarer, sachlicher Sprache. Beginne mit der gemeinnützigkeits-/erstprüfungsrelevanten Kernaussage (Körpersport-Zweck, Vermögensbindung, Trennung ideelle/materielle Mittel) und nenne die wichtigsten Baustellen zuerst.

ANWALTS-ERSTPRÜFUNG – die im Katalog mit [ERSTPRÜFUNG] markierten Punkte ZUERST und besonders streng prüfen. Die meisten relevanten Vereine sind gemeinnützig; der Fokus liegt daher auf der Bundesabgabenordnung (BAO):
- Körpersport-Zweck: Eine konkrete Form des Körpersports (z. B. Fußball, Schifahren, Turnen) muss als gemeinnütziger Zweck klar herauskommen.
- Ausschließliche & unmittelbare Förderung dieses Zwecks muss ausdrücklich in den Statuten stehen.
- Ideelle Mittel (Tätigkeiten) und materielle Mittel (Einnahmequellen) müssen getrennt dargestellt sein und dürfen NICHT vermischt werden.
- Auflösungs-/Vermögensbindungsklausel: Maßstab sind die Musterstatuten der Vereinsrichtlinien des Bundesministeriums für FINANZEN (BMF) – NICHT jene des Bundesministeriums für INNERES (BMI), die dies steuerlich nicht korrekt abbilden. Die Klausel muss die Auflösung UND den Wegfall des begünstigten Zwecks abdecken; das Restvermögen bleibt für begünstigte (gemeinnützige) Zwecke gebunden, keine Verteilung an Mitglieder. Die korrekte Formulierung unterscheidet sich, je nachdem ob der Verein nur gemeinnützig oder gemeinnützig UND spendenbegünstigt ist (dann § 4a-EStG-konforme Fassung wie in den SPORTUNION-Musterstatuten). Fehlt/unvollständig/nur BMI-Fassung → in der Regel "rot".
- Begünstigungswürdigkeit: Bei angestrebter Spendenbegünstigung ist ein eigener, ausführlicher Abschnitt (§ 3a der SPORTUNION-Musterstatuten) nötig.
- Virtuelle/hybride Mitgliederversammlungen und möglichst auch Vorstandssitzungen sollten vorgesehen sein.
- Bekenntnis zu den Anti-Doping-Bestimmungen.
- Vertretung des Vereins nach außen muss nachvollziehbar geregelt sein.
- Funktionsperioden sollten bis zur Neuwahl andauern; während der Funktionsperiode ausscheidende Vorstandsmitglieder werden durch Kooptierung ersetzt.
- Bestimmungen zu Datenschutz (DSGVO) und Urheberrecht (Bild-/Medienrechte) sollten enthalten sein.

Weitere häufige Fehlerquellen:
- Schlichtungseinrichtung (§ 13): muss eine vereinsinterne "Schlichtungseinrichtung" sein, KEIN echtes Schiedsgericht nach §§ 577 ff ZPO.
- Mindestens zwei Rechnungsprüfende.
- Offene Platzhalter aus der Vorlage.

=== PRÜFKATALOG (jeden Punkt bewerten) ===

${renderKatalog()}

=== REFERENZ: SPORTUNION MUSTERSTATUTEN (Goldstandard für Korrekturvorschläge) ===
${MUSTERSTATUTEN_HAUPTVEREIN}`;

// ── Hauptfunktion ─────────────────────────────────────────────────────────────
export interface AnalysisOutput {
  zusammenfassung: string;
  checks: CheckResult[];
  modell: string;
  dauerMs: number;
}

export async function runAnalysis(opts: {
  text: string;
  dateiname: string;
  struktur: StructuralAnalysis;
}): Promise<AnalysisOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AnalyzeError(
      "OPENAI_API_KEY ist nicht gesetzt. Lege eine Datei „.env.local“ an (Vorlage: .env.local.example) und trage deinen OpenAI-API-Key ein.",
    );
  }
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  const userMessage = `Bitte prüfe den folgenden Statuten-Entwurf vollständig gegen den Prüfkatalog.

=== DETERMINISTISCHE VORABBEFUNDE (regelbasiert) ===
${structuralContextForPrompt(opts.struktur)}

=== STATUTEN-ENTWURF (Datei: ${opts.dateiname}) ===
${opts.text}

=== ENDE ENTWURF ===

Gib für jeden Prüfpunkt des Katalogs genau ein Urteil zurück (Feld "pruefungen"), plus eine "zusammenfassung".`;

  const t0 = Date.now();
  const reasoning = istReasoningModell(model);
  let completion: Awaited<ReturnType<typeof client.chat.completions.parse>>;
  try {
    completion = await client.chat.completions.parse({
      model,
      // Reasoning-Tokens zählen mit – großzügiges Limit gegen Abschneiden.
      max_completion_tokens: 16000,
      response_format: zodResponseFormat(ResultSchema, "statuten_pruefung"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      // Reasoning-Modelle (GPT-5/o-Serie) akzeptieren kein „temperature“, sondern
      // steuern über „reasoning_effort“; ältere Modelle nutzen weiter temperature.
      ...(reasoning
        ? { reasoning_effort: REASONING_EFFORT }
        : { temperature: 0.2 }),
    });
  } catch (e) {
    if (e instanceof OpenAI.AuthenticationError)
      throw new AnalyzeError(
        "Der OpenAI-API-Key ist ungültig. Bitte den Key in .env.local prüfen.",
      );
    if (e instanceof OpenAI.RateLimitError)
      throw new AnalyzeError(
        "Zu viele Anfragen oder Kontingent erschöpft (Rate Limit). Bitte einen Moment warten und erneut versuchen.",
      );
    if (e instanceof OpenAI.APIError)
      throw new AnalyzeError(
        `Fehler beim KI-Dienst (${e.status ?? "?"}): ${e.message}`,
      );
    throw new AnalyzeError(
      `Unerwarteter Fehler bei der KI-Analyse: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  const dauerMs = Date.now() - t0;

  const choice = completion.choices[0];
  const message = choice?.message;

  if (message?.refusal) {
    throw new AnalyzeError(`Die KI hat die Analyse abgelehnt: ${message.refusal}`);
  }

  const parsed = (message?.parsed ?? null) as ResultShape | null;
  if (!parsed) {
    if (choice?.finish_reason === "length")
      throw new AnalyzeError(
        "Die KI-Antwort wurde abgeschnitten. Bitte erneut versuchen (ggf. kürzeres Dokument).",
      );
    throw new AnalyzeError(
      "Die KI-Antwort konnte nicht ausgewertet werden. Bitte erneut versuchen.",
    );
  }

  const byId = new Map(parsed.pruefungen.map((p) => [p.id, p]));

  const checks: CheckResult[] = CHECKS.map((c) => {
    // Haupt-/Zweigvereins-Punkt bei eigenständigem Verein erzwingen.
    if (c.nurMitZweigstruktur && !opts.struktur.istZweigstruktur) {
      return {
        ...c,
        status: "nicht_anwendbar" as CheckStatus,
        begruendung:
          "Trifft auf einen eigenständigen Verein ohne Haupt-/Zweigvereinsstruktur nicht zu.",
        fundstelle: "",
        korrekturvorschlag: "",
      };
    }
    const v = byId.get(c.id);
    if (!v) {
      return {
        ...c,
        status: "orange" as CheckStatus,
        begruendung:
          "Dieser Punkt wurde von der KI nicht bewertet – bitte manuell prüfen.",
        fundstelle: "",
        korrekturvorschlag: "",
      };
    }
    return {
      ...c,
      status: v.status,
      begruendung: v.begruendung,
      fundstelle: v.fundstelle || "",
      korrekturvorschlag: v.korrekturvorschlag || "",
    };
  });

  return {
    zusammenfassung: parsed.zusammenfassung,
    checks,
    modell: model,
    dauerMs,
  };
}
