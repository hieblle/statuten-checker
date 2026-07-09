// Aggregation der Einzelurteile zur Ampel.
// Die Gesamt- und Kategorie-Ampel wird DETERMINISTISCH aus den Prüfurteilen
// berechnet (nicht vom KI-Modell „geraten“):
//   • ROT     – mindestens ein KRITISCHER Pflichtpunkt ist nicht erfüllt (rot)
//   • ORANGE  – kein kritischer Fehler, aber ein KRITISCHER oder WICHTIGER
//               Punkt ist offen/unklar (rot oder orange)
//   • GRÜN    – sonst; reine „empfohlen“-Punkte (Best Practice / „Kür“) ziehen
//               die Ampel bewusst NICHT auf orange, damit „grün = geht durch“
//               wieder erreichbar ist und aussagekräftig bleibt.

import type {
  Ampel,
  Category,
  CategoryScore,
  CheckResult,
  CheckStatus,
  Severity,
} from "./types";
import { CATEGORY_META } from "./knowledge-base";

const CATEGORY_ORDER: Category[] = [
  "gesetzlich",
  "gemeinnuetzigkeit",
  "sportunion",
  "qualitaet",
];

function ampelFor(items: { severity: Severity; status: CheckStatus }[]): Ampel {
  const relevant = items.filter((i) => i.status !== "nicht_anwendbar");
  // Kritischer Pflichtpunkt nicht erfüllt → rot.
  if (relevant.some((i) => i.severity === "kritisch" && i.status === "rot"))
    return "rot";
  // Kritischer oder wichtiger Punkt offen/unklar → orange.
  // Reine „empfohlen“-Punkte (Best Practice / „Kür“) beeinflussen die Ampel NICHT.
  if (
    relevant.some(
      (i) =>
        (i.severity === "kritisch" || i.severity === "wichtig") &&
        (i.status === "rot" || i.status === "orange"),
    )
  )
    return "orange";
  return "gruen";
}

export function scoreCategories(checks: CheckResult[]): CategoryScore[] {
  return CATEGORY_ORDER.map((category) => {
    const items = checks.filter((c) => c.category === category);
    const relevant = items.filter((c) => c.status !== "nicht_anwendbar");
    return {
      category,
      label: CATEGORY_META[category].label,
      ampel: ampelFor(items),
      gruen: relevant.filter((c) => c.status === "gruen").length,
      orange: relevant.filter((c) => c.status === "orange").length,
      rot: relevant.filter((c) => c.status === "rot").length,
      relevant: relevant.length,
    };
  });
}

export function gesamtAmpel(checks: CheckResult[]): Ampel {
  return ampelFor(checks);
}

/** Fallback-Zusammenfassung, falls das Modell keine liefert. */
export function fallbackZusammenfassung(
  ampel: Ampel,
  checks: CheckResult[],
): string {
  const kritischRot = checks.filter(
    (c) => c.severity === "kritisch" && c.status === "rot",
  );
  if (ampel === "rot") {
    return `Die Statuten haben ${kritischRot.length} kritische(n) Mangel/Mängel, die einer Eintragung bzw. der Steuerbegünstigung entgegenstehen können – darunter: ${kritischRot
      .slice(0, 3)
      .map((c) => c.titel)
      .join(", ")}. Eine Überarbeitung ist erforderlich.`;
  }
  if (ampel === "orange") {
    const offen = checks.filter(
      (c) =>
        (c.severity === "kritisch" || c.severity === "wichtig") &&
        (c.status === "rot" || c.status === "orange"),
    ).length;
    return `Keine kritischen Verstöße, aber ${offen} wichtige(r) Punkt(e) sollten vor der Einreichung geprüft/nachgebessert werden. Bitte manuell drüberlesen.`;
  }
  return "Keine kritischen oder wichtigen Mängel. Einzelne optionale Empfehlungen können noch offen sein; eine abschließende juristische Kontrolle wird dennoch empfohlen.";
}
