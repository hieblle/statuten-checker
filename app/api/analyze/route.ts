import { NextRequest, NextResponse } from "next/server";
import { extractText, ExtractError } from "@/lib/extract";
import { analyzeStructure } from "@/lib/structural";
import { runAnalysis, AnalyzeError } from "@/lib/analyze";
import {
  scoreCategories,
  gesamtAmpel,
  fallbackZusammenfassung,
} from "@/lib/scoring";
import type { AnalysisResult } from "@/lib/types";

// Node-Runtime: mammoth/pdf-parse brauchen Node-APIs (kein Edge).
export const runtime = "nodejs";
// KI-Analyse kann ~20–60 s dauern (relevant beim Deployen, z. B. Vercel Pro).
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const DISCLAIMER =
  "Diese automatische Erstprüfung dient der Orientierung und ersetzt keine individuelle Rechts- oder Steuerberatung. Maßgeblich sind das Vereinsgesetz 2002, die BAO/EStG sowie die Vorgaben der zuständigen Vereinsbehörde, des Finanzamts und der SPORTUNION.";

export async function POST(req: NextRequest) {
  try {
    // Optionaler einfacher Zugriffsschutz beim Deployen.
    const requiredToken = process.env.APP_ACCESS_TOKEN?.trim();
    if (requiredToken && req.headers.get("x-app-token") !== requiredToken) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Keine Datei empfangen. Bitte eine Statuten-Datei hochladen." },
        { status: 400 },
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Die Datei ist leer." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Die Datei ist zu groß (max. 12 MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, zeichen } = await extractText(buffer, file.name);
    const struktur = analyzeStructure(text);
    const analysis = await runAnalysis({ text, dateiname: file.name, struktur });

    const kategorien = scoreCategories(analysis.checks);
    const ampel = gesamtAmpel(analysis.checks);
    const zusammenfassung =
      analysis.zusammenfassung?.trim() ||
      fallbackZusammenfassung(ampel, analysis.checks);

    const result: AnalysisResult = {
      gesamtampel: ampel,
      zusammenfassung,
      kategorien,
      checks: analysis.checks,
      strukturBefunde: struktur.befunde,
      meta: {
        dateiname: file.name,
        erkannterTyp: struktur.vereinsTyp,
        zeichen,
        modell: analysis.modell,
        dauerMs: analysis.dauerMs,
        disclaimer: DISCLAIMER,
      },
    };

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ExtractError || e instanceof AnalyzeError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Analyse-Fehler:", e);
    return NextResponse.json(
      { error: "Interner Fehler bei der Analyse. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }
}
