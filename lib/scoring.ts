// Aggregation der Einzelurteile zur Ampel.
// Die Gesamt- und Kategorie-Ampel wird DETERMINISTISCH aus den Prüfurteilen
// berechnet (nicht vom KI-Modell „geraten“):
//   • ROT     – mindestens ein KRITISCHER Punkt ist nicht erfüllt (rot)
//   • ORANGE  – kein kritischer Fehler, aber irgendetwas ist rot oder unklar
//   • GRÜN    – alle anwendbaren Punkte erfüllt

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
  if (relevant.some((i) => i.severity === "kritisch" && i.status === "rot"))
    return "rot";
  if (relevant.some((i) => i.status === "rot" || i.status === "orange"))
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
  const rot = checks.filter((c) => c.status === "rot");
  const orange = checks.filter((c) => c.status === "orange");

  if (ampel === "rot") {
    return `Die Statuten haben ${kritischRot.length} kritische(n) Mangel/Mängel, die einer Eintragung bzw. der Steuerbegünstigung entgegenstehen können – darunter: ${kritischRot
      .slice(0, 3)
      .map((c) => c.titel)
      .join(", ")}. Eine Überarbeitung ist erforderlich.`;
  }
  if (ampel === "orange") {
    return `Keine kritischen Verstöße, aber ${rot.length + orange.length} Punkt(e) sollten vor der Einreichung geprüft/nachgebessert werden. Bitte manuell drüberlesen.`;
  }
  return "Alle geprüften Punkte sind erfüllt. Eine abschließende juristische Kontrolle wird dennoch empfohlen.";
}
