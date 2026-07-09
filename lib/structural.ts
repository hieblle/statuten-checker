// Regelbasierte (deterministische) Vorprüfung – ohne KI.
// Erkennt: Vereinstyp (Haupt-/Zweig-/eigenständiger Verein), offene Platzhalter
// und liefert kompakte Signale, die dem KI-Modell als Kontext mitgegeben werden.

import type { StructuralFinding, VereinsTyp } from "./types";

export interface StructuralAnalysis {
  vereinsTyp: VereinsTyp;
  istZweigstruktur: boolean;
  befunde: StructuralFinding[];
  gefundeneParagraphen: string[];
  signale: Record<string, boolean>;
}

// ── Vereinstyp ──────────────────────────────────────────────────────────────
export function detectVereinsTyp(text: string): {
  typ: VereinsTyp;
  istZweigstruktur: boolean;
} {
  const t = text.toLowerCase();
  const nenntZweig = /zweigverein/.test(t);
  const nenntHaupt = /hauptverein/.test(t);

  const istHaupt =
    /verh[äa]ltnis zu zweigvereinen/.test(t) ||
    /berechtigt[^.]{0,40}zweigvereine[^.]{0,40}zu bilden/.test(t);
  const istZweig =
    /verh[äa]ltnis zum hauptverein/.test(t) ||
    /der hauptverein ist berechtigt/.test(t);

  let typ: VereinsTyp;
  if (istHaupt && !istZweig) typ = "hauptverein";
  else if (istZweig && !istHaupt) typ = "zweigverein";
  else if (nenntHaupt || nenntZweig) typ = "unbekannt";
  else typ = "eigenstaendig";

  const istZweigstruktur = typ === "hauptverein" || typ === "zweigverein";
  return { typ, istZweigstruktur };
}

// ── Platzhalter ──────────────────────────────────────────────────────────────
const HARTE_PLATZHALTER: { re: RegExp; label: string }[] = [
  { re: /_{3,}/g, label: "Leerstelle (____)" },
  { re: /\[[^\]\n]{1,60}\]/g, label: "Klammer-Platzhalter ([…])" },
  { re: /TT\.?\s*Monat\s*Jahr/gi, label: "Datums-Platzhalter (TT. Monat Jahr)" },
  { re: /\bPLZ\s+Ort\b/gi, label: "Sitz-Platzhalter (PLZ Ort)" },
  { re: /\.{3,}|…+/g, label: "Auslassungspunkte (…/...)" },
];

const AUSWAHL_FLOSKELN = [
  "jährlich/alle zwei Jahre",
  "ein/zwei jahr",
  "gemeinde/bezirk/bundesland",
  "gründungsversammlung/ordentlichen/außerordentlichen",
  "ganz österreich/europa",
];

function snippet(text: string, index: number, len: number): string {
  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + len + 25);
  return ("…" + text.slice(start, end).replace(/\s+/g, " ").trim() + "…").slice(
    0,
    90,
  );
}

export function findPlaceholders(text: string): StructuralFinding[] {
  const befunde: StructuralFinding[] = [];
  const beispiele: string[] = [];
  let harteTreffer = 0;

  for (const { re } of HARTE_PLATZHALTER) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      harteTreffer++;
      if (beispiele.length < 4) beispiele.push(snippet(text, m.index, m[0].length));
      if (m[0].length === 0) re.lastIndex++; // Endlosschleife vermeiden
    }
  }

  if (harteTreffer > 0) {
    befunde.push({
      art: "platzhalter",
      schwere: "wichtig",
      nachricht: `${harteTreffer} offene Platzhalter/Leerstellen aus der Vorlage gefunden. Diese müssen vor der Einreichung ausgefüllt werden.`,
      fundstelle: beispiele.join("  •  "),
    });
  }

  const tl = text.toLowerCase();
  const gefundeneFloskeln = AUSWAHL_FLOSKELN.filter((f) => tl.includes(f));
  if (gefundeneFloskeln.length > 0) {
    befunde.push({
      art: "platzhalter",
      schwere: "empfohlen",
      nachricht:
        "Nicht aufgelöste Auswahl-Formulierungen aus der Vorlage gefunden – bitte die zutreffende Variante wählen und den Rest entfernen.",
      fundstelle: gefundeneFloskeln.join("  •  "),
    });
  }

  return befunde;
}

// ── Paragraphen & Signale ────────────────────────────────────────────────────
function findParagraphen(text: string): string[] {
  const set = new Set<string>();
  const re = /§\s*(\d+\s*[a-z]?)\s*[:.]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    set.add("§ " + m[1].replace(/\s+/g, "").toLowerCase());
  }
  return [...set];
}

function detectSignale(text: string): Record<string, boolean> {
  const t = text.toLowerCase();
  return {
    sportunion: /sportunion/.test(t),
    antiDoping: /anti-?doping/.test(t),
    schlichtungseinrichtung: /schlichtungseinrichtung/.test(t),
    bao34: /§+\s*34|34\s*ff\s*bao|§§\s*34/.test(t),
    vermoegensbindung:
      /wegfall[^.]{0,40}zweck|4a\s*(abs\.?\s*2\s*)?estg|begünstigt[^.]{0,30}zweck/.test(
        t,
      ),
    aufloesung: /auflösung/.test(t),
    rechnungspruefer: /rechnungsprüf/.test(t),
    generalversammlung: /generalversammlung|mitgliederversammlung/.test(t),
    vorstand: /vorstand|leitungsorgan/.test(t),
    datenschutz: /dsgvo|datenschutz/.test(t),
  };
}

export function analyzeStructure(text: string): StructuralAnalysis {
  const { typ, istZweigstruktur } = detectVereinsTyp(text);
  const befunde = findPlaceholders(text);
  const gefundeneParagraphen = findParagraphen(text);
  const signale = detectSignale(text);

  if (gefundeneParagraphen.length < 6) {
    befunde.push({
      art: "hinweis",
      schwere: "wichtig",
      nachricht: `Es wurden nur ${gefundeneParagraphen.length} Paragrafen-Überschriften erkannt. Möglicherweise ist das Dokument unvollständig oder stark vom üblichen Aufbau abweichend formatiert.`,
    });
  }

  return { vereinsTyp: typ, istZweigstruktur, befunde, gefundeneParagraphen, signale };
}

/** Kompakte Textdarstellung der Strukturbefunde für den KI-Prompt. */
export function structuralContextForPrompt(s: StructuralAnalysis): string {
  const lines: string[] = [];
  lines.push(`Erkannter Vereinstyp: ${s.vereinsTyp}`);
  lines.push(
    `Erkannte Paragrafen (${s.gefundeneParagraphen.length}): ${
      s.gefundeneParagraphen.join(", ") || "keine"
    }`,
  );
  const aktiveSignale = Object.entries(s.signale)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const fehlendeSignale = Object.entries(s.signale)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  lines.push(`Vorhandene Schlüsselbegriffe: ${aktiveSignale.join(", ") || "—"}`);
  lines.push(
    `NICHT gefundene Schlüsselbegriffe (prüfen!): ${
      fehlendeSignale.join(", ") || "—"
    }`,
  );
  if (s.befunde.length) {
    lines.push("Regelbasierte Befunde:");
    for (const b of s.befunde) {
      lines.push(
        `- [${b.schwere}] ${b.nachricht}${b.fundstelle ? ` (${b.fundstelle})` : ""}`,
      );
    }
  }
  return lines.join("\n");
}
