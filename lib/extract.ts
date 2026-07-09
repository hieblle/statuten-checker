// Dokument-Extraktion: Upload-Buffer -> reiner Text.
// Das Format wird anhand der Magic Bytes erkannt, NICHT der Dateiendung –
// so funktionieren auch falsch benannte Dateien (z. B. "*.docx.doc", die in
// Wahrheit ein ZIP/DOCX sind).

export type DateiArt = "docx" | "pdf" | "text" | "legacy-doc" | "unbekannt";

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

export interface ExtractResult {
  text: string;
  art: DateiArt;
  zeichen: number;
}

function startsWith(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false;
  return bytes.every((b, i) => buf[i] === b);
}

/** Format anhand der Magic Bytes (mit Dateiendung als Fallback). */
export function sniff(buffer: Buffer, filename: string): DateiArt {
  // ZIP-Container (PK\x03\x04) => Office Open XML (.docx)
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04])) return "docx";
  // PDF (%PDF)
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return "pdf";
  // OLE2 Compound File (altes .doc/.xls Binärformat)
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
    return "legacy-doc";

  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".doc")) return "legacy-doc";
  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".rtf"))
    return "text";

  // Heuristik: enthält der Anfang überwiegend druckbare Zeichen -> Text
  const head = buffer.subarray(0, 1024).toString("utf8");
  const printable = head.replace(/[^\x09\x0a\x0d\x20-\x7e -￿]/g, "");
  if (printable.length / Math.max(head.length, 1) > 0.85) return "text";

  return "unbekannt";
}

/** Whitespace normalisieren, ohne Absätze zu zerstören. */
function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractText(
  buffer: Buffer,
  filename: string,
): Promise<ExtractResult> {
  const art = sniff(buffer, filename);

  let raw: string;
  switch (art) {
    case "docx": {
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer });
      raw = value;
      break;
    }
    case "pdf": {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const data = await pdfParse(buffer);
      raw = data.text;
      break;
    }
    case "text":
      raw = buffer.toString("utf8");
      break;
    case "legacy-doc":
      throw new ExtractError(
        "Das ist eine alte Word-Datei im Binärformat (.doc). Bitte in Word/LibreOffice als „.docx“ oder „.pdf“ speichern und erneut hochladen.",
      );
    default:
      throw new ExtractError(
        "Dateiformat nicht erkannt. Bitte die Statuten als .docx, .pdf oder .txt hochladen.",
      );
  }

  const text = normalize(raw);

  if (text.length < 400) {
    throw new ExtractError(
      art === "pdf"
        ? "Aus dem PDF konnte kaum Text gelesen werden. Vermutlich ist es ein gescanntes Dokument ohne Textebene – bitte ein PDF mit auswählbarem Text oder eine .docx-Datei hochladen."
        : "Die Datei enthält zu wenig Text für eine Prüfung. Bitte vollständige Statuten hochladen.",
    );
  }

  return { text, art, zeichen: text.length };
}
