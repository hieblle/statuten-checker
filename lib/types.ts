// Gemeinsame Typen für den Statuten-Checker.

/** Prüfkategorien (bestimmen Gruppierung & Gewichtung). */
export type Category =
  | "gesetzlich" // Vereinsgesetz 2002 – zwingender Mindestinhalt
  | "gemeinnuetzigkeit" // BAO §§ 34 ff / EStG – Steuerbegünstigung
  | "sportunion" // Vorgaben des Dachverbands SPORTUNION
  | "qualitaet"; // Vollständigkeit, Klarheit, offene Platzhalter

/** Schweregrad eines Prüfpunkts. */
export type Severity =
  | "kritisch" // Verstoß = Statuten (rechtlich/steuerlich) nicht haltbar
  | "wichtig" // sollte korrigiert werden
  | "empfohlen"; // Verbesserung / Best Practice

/** Ergebnis eines einzelnen Prüfpunkts. */
export type CheckStatus =
  | "gruen" // erfüllt
  | "orange" // teilweise / unklar / verbesserungswürdig
  | "rot" // nicht erfüllt / fehlerhaft
  | "nicht_anwendbar";

/** Gesamt- bzw. Kategorie-Ampel (kein „nicht_anwendbar“). */
export type Ampel = "gruen" | "orange" | "rot";

export type VereinsTyp = "hauptverein" | "zweigverein" | "eigenstaendig" | "unbekannt";

/** Ein Prüfpunkt aus der Wissensbasis (statisch). */
export interface Check {
  id: string;
  titel: string;
  /** Bezug zur Musterstatuten-Gliederung, z. B. "§ 15". */
  paragraph: string;
  category: Category;
  severity: Severity;
  /** Rechtsgrundlage, z. B. "§ 3 Abs 2 Z 11 VerG 2002". */
  rechtsgrundlage: string;
  /** Was die Statuten enthalten MÜSSEN (Instruktion ans Modell). */
  anforderung: string;
  /** Worauf besonders zu achten ist / typische Fehler. */
  pruefhinweis: string;
  /** Nur für eigenständige Vereine ohne Haupt-/Zweigvereins-Bezug irrelevant. */
  nurMitZweigstruktur?: boolean;
  /** Teil der „Anwalts-Erstprüfung“ – wird im Output besonders hervorgehoben. */
  erstpruefung?: boolean;
}

/** Vom Modell geliefertes Urteil zu einem Prüfpunkt. */
export interface CheckVerdict {
  id: string;
  status: CheckStatus;
  /** Begründung in Deutsch (1–3 Sätze). */
  begruendung: string;
  /** Wörtliches Zitat aus dem Entwurf, das das Urteil stützt (optional). */
  fundstelle?: string;
  /** Konkreter Korrektur-/Formulierungsvorschlag (bei orange/rot). */
  korrekturvorschlag?: string;
}

/** Prüfpunkt + Urteil, angereichert für die Anzeige. */
export type CheckResult = Check & CheckVerdict;

/** Deterministische Strukturbefunde (regelbasiert, ohne KI). */
export interface StructuralFinding {
  art: "platzhalter" | "fehlender_abschnitt" | "hinweis";
  schwere: Severity;
  nachricht: string;
  fundstelle?: string;
}

/** Score je Kategorie. */
export interface CategoryScore {
  category: Category;
  label: string;
  ampel: Ampel;
  gruen: number;
  orange: number;
  rot: number;
  relevant: number; // Anzahl bewerteter (anwendbarer) Prüfpunkte
}

/** Komplettes Analyse-Ergebnis (API-Antwort). */
export interface AnalysisResult {
  gesamtampel: Ampel;
  zusammenfassung: string;
  kategorien: CategoryScore[];
  checks: CheckResult[];
  strukturBefunde: StructuralFinding[];
  meta: {
    dateiname: string;
    erkannterTyp: VereinsTyp;
    zeichen: number;
    modell: string;
    dauerMs: number;
    disclaimer: string;
  };
}
