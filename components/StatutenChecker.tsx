"use client";

import { useCallback, useRef, useState } from "react";
import type {
  AnalysisResult,
  Ampel,
  CategoryScore,
  CheckResult,
  CheckStatus,
} from "@/lib/types";

// ── UI-Maps ───────────────────────────────────────────────────────────────────
const AMPEL_UI: Record<
  Ampel,
  { dot: string; card: string; title: string; sub: string }
> = {
  gruen: {
    dot: "bg-green-500",
    card: "border-green-300 bg-green-50",
    title: "Grün – Statuten gehen durch",
    sub: "Keine kritischen oder wichtigen Mängel. Optionale Empfehlungen können noch offen sein; eine abschließende juristische Kontrolle wird trotzdem empfohlen.",
  },
  orange: {
    dot: "bg-amber-500",
    card: "border-amber-300 bg-amber-50",
    title: "Orange – bitte manuell drüberlesen",
    sub: "Keine kritischen Verstöße, aber einige Punkte sollten vor der Einreichung geprüft oder nachgebessert werden.",
  },
  rot: {
    dot: "bg-red-500",
    card: "border-red-300 bg-red-50",
    title: "Rot – grobe Mängel",
    sub: "Mindestens ein kritischer Punkt steht einer Eintragung bzw. der Steuerbegünstigung entgegen. Überarbeitung erforderlich.",
  },
};

const STATUS_UI: Record<
  CheckStatus,
  { pill: string; dot: string; label: string }
> = {
  gruen: { pill: "bg-green-100 text-green-800", dot: "bg-green-500", label: "Passt" },
  orange: { pill: "bg-amber-100 text-amber-800", dot: "bg-amber-500", label: "Prüfen" },
  rot: { pill: "bg-red-100 text-red-800", dot: "bg-red-500", label: "Mangel" },
  nicht_anwendbar: {
    pill: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
    label: "n. a.",
  },
};

const SEVERITY_LABEL: Record<string, string> = {
  kritisch: "kritisch",
  wichtig: "wichtig",
  empfohlen: "empfohlen",
};

const TYP_LABEL: Record<string, string> = {
  hauptverein: "Hauptverein",
  zweigverein: "Zweigverein",
  eigenstaendig: "eigenständiger Verein",
  unbekannt: "unbestimmt",
};

const STATUS_ORDER: Record<CheckStatus, number> = {
  rot: 0,
  orange: 1,
  gruen: 2,
  nicht_anwendbar: 3,
};

/** „Muss/soll“-Punkt (kritisch oder wichtig) – bestimmt Ampel & Aufgabenliste. */
const istWichtig = (c: CheckResult) =>
  c.severity === "kritisch" || c.severity === "wichtig";
/** Offener Punkt (rot oder orange). */
const istOffen = (c: CheckResult) =>
  c.status === "rot" || c.status === "orange";

// ── Hilfskomponenten ──────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
    >
      {copied ? "Kopiert ✓" : "Kopieren"}
    </button>
  );
}

function CheckRow({
  check,
  kompakt = false,
}: {
  check: CheckResult;
  kompakt?: boolean;
}) {
  const s = STATUS_UI[check.status];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <h4 className="font-semibold text-slate-900">{check.titel}</h4>
            {check.erstpruefung && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                ★ Erstprüfung
              </span>
            )}
          </div>
          {!kompakt && (
            <p className="mt-0.5 text-xs text-slate-500">
              {check.paragraph} · {check.rechtsgrundlage} ·{" "}
              <span className="capitalize">
                {SEVERITY_LABEL[check.severity] ?? check.severity}
              </span>
            </p>
          )}
        </div>
      </div>

      {check.begruendung && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {check.begruendung}
        </p>
      )}

      {check.fundstelle && !kompakt && (
        <blockquote className="mt-2 border-l-2 border-slate-300 pl-3 text-sm italic text-slate-500">
          „{check.fundstelle}“
        </blockquote>
      )}

      {check.korrekturvorschlag &&
        (kompakt ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-blue-700 hover:underline">
              Formulierungsvorschlag anzeigen
            </summary>
            <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-3">
              <div className="mb-1 flex items-center justify-end">
                <CopyButton text={check.korrekturvorschlag} />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {check.korrekturvorschlag}
              </p>
            </div>
          </details>
        ) : (
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Korrekturvorschlag
              </span>
              <CopyButton text={check.korrekturvorschlag} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {check.korrekturvorschlag}
            </p>
          </div>
        ))}
    </div>
  );
}

function CategoryCard({ cat }: { cat: CategoryScore }) {
  const ui = AMPEL_UI[cat.ampel];
  return (
    <div className={`rounded-lg border p-3 ${ui.card}`}>
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 shrink-0 rounded-full ${ui.dot}`} />
        <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
      </div>
      <div className="mt-2 flex gap-3 text-xs text-slate-600">
        <span>✓ {cat.gruen}</span>
        <span>● {cat.orange}</span>
        <span>✕ {cat.rot}</span>
      </div>
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function StatutenChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [nurProbleme, setNurProbleme] = useState(false);
  const [detailsOffen, setDetailsOffen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(async (f: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unbekannter Fehler.");
      setResult(data as AnalysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.doc,.pdf,.txt,.md"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <p className="text-slate-600">
          Statuten-Entwurf hierher ziehen oder{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-blue-600 underline underline-offset-2"
          >
            Datei auswählen
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Formate: .docx, .pdf, .txt (max. 12 MB)
        </p>

        {file && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <span className="max-w-[16rem] truncate">📄 {file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Datei entfernen"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-5">
          <button
            type="button"
            disabled={!file || loading}
            onClick={() => file && submit(file)}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Prüfe …" : "Statuten prüfen"}
          </button>
        </div>
      </div>

      {/* Ladezustand */}
      {loading && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <span>
            Die Statuten werden analysiert … das dauert je nach Umfang etwa
            20–60 Sekunden.
          </span>
        </div>
      )}

      {/* Fehler */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Ergebnis */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Gesamt-Ampel */}
          <div className={`rounded-xl border p-5 ${AMPEL_UI[result.gesamtampel].card}`}>
            <div className="flex items-start gap-4">
              <span
                className={`mt-1 h-8 w-8 shrink-0 rounded-full ${AMPEL_UI[result.gesamtampel].dot} ring-4 ring-white`}
              />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {AMPEL_UI[result.gesamtampel].title}
                </h2>
                <p className="mt-1 text-sm text-slate-700">{result.zusammenfassung}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-black/5 pt-3 text-xs text-slate-500">
              <span>Datei: {result.meta.dateiname}</span>
              <span>Typ: {TYP_LABEL[result.meta.erkannterTyp] ?? result.meta.erkannterTyp}</span>
              <span>Modell: {result.meta.modell}</span>
              <span>Dauer: {(result.meta.dauerMs / 1000).toFixed(1)} s</span>
            </div>
          </div>

          {/* Aufgabenliste – nur wirklich Wichtiges, in Klartext */}
          {(() => {
            const aufgaben = result.checks
              .filter((c) => istWichtig(c) && istOffen(c))
              .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
            return (
              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Das solltest du vor der Einreichung erledigen
                </h3>
                {aufgaben.length === 0 ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Keine kritischen oder wichtigen offenen Punkte. 🎉 Optionale
                    Empfehlungen findest du weiter unten.
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-slate-500">
                      {aufgaben.length} Punkt(e), nach Dringlichkeit sortiert –
                      Formulierungsvorschläge jeweils aufklappbar.
                    </p>
                    <div className="space-y-3">
                      {aufgaben.map((c) => (
                        <CheckRow key={c.id} check={c} kompakt />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Anwalts-Erstblick */}
          {(() => {
            const erst = result.checks
              .filter((c) => c.erstpruefung)
              .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
            if (erst.length === 0) return null;
            const gruen = erst.filter((c) => c.status === "gruen").length;
            const offen = erst.filter(
              (c) => c.status === "rot" || c.status === "orange",
            ).length;
            return (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-base font-bold text-slate-900">
                    Anwalts-Erstblick
                  </span>
                  <span className="text-xs text-slate-500">
                    worauf bei der Erstprüfung zuerst geachtet wird
                  </span>
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  {gruen}/{erst.length} Punkte in Ordnung
                  {offen > 0 ? ` · ${offen} zu prüfen` : ""}
                </p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {erst.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_UI[c.status].dot}`}
                      />
                      <span className="text-slate-700">{c.titel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Kategorie-Übersicht */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {result.kategorien.map((c) => (
              <CategoryCard key={c.category} cat={c} />
            ))}
          </div>

          {/* Optionale Empfehlungen („Kür“) – Best Practice, nicht erforderlich */}
          {(() => {
            const optional = result.checks
              .filter((c) => c.severity === "empfohlen" && istOffen(c))
              .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
            if (optional.length === 0) return null;
            return (
              <details className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                  Optionale Empfehlungen · {optional.length}
                  <span className="ml-1 font-normal text-slate-500">
                    – nicht erforderlich, aber empfehlenswert
                  </span>
                </summary>
                <div className="mt-3 space-y-3">
                  {optional.map((c) => (
                    <CheckRow key={c.id} check={c} kompakt />
                  ))}
                </div>
              </details>
            );
          })()}

          {/* Strukturbefunde */}
          {result.strukturBefunde.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Automatische Struktur-Hinweise
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {result.strukturBefunde.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">•</span>
                    <span>
                      {b.nachricht}
                      {b.fundstelle && (
                        <span className="mt-0.5 block text-xs italic text-slate-400">
                          {b.fundstelle}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailprüfung – vollständig, einklappbar (Standard: zu) */}
          <div>
            <button
              type="button"
              onClick={() => setDetailsOffen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <span className="text-base font-bold text-slate-900">
                Vollständige Detailprüfung ({result.checks.length} Punkte)
              </span>
              <span className="shrink-0 text-sm font-medium text-slate-500">
                {detailsOffen ? "▲ einklappen" : "▼ anzeigen"}
              </span>
            </button>

            {detailsOffen && (
              <div className="mt-4">
                <div className="mb-3 flex items-center justify-end">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={nurProbleme}
                      onChange={(e) => setNurProbleme(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Nur Probleme zeigen
                  </label>
                </div>

                <div className="space-y-6">
                  {result.kategorien.map((cat) => {
                    const items = result.checks
                      .filter((c) => c.category === cat.category)
                      .filter((c) =>
                        nurProbleme
                          ? c.status === "rot" || c.status === "orange"
                          : true,
                      )
                      .sort(
                        (a, b) =>
                          STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
                      );
                    if (items.length === 0) return null;
                    return (
                      <section key={cat.category}>
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${AMPEL_UI[cat.ampel].dot}`}
                          />
                          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                            {cat.label}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {items.map((c) => (
                            <CheckRow key={c.id} check={c} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="rounded-lg bg-slate-100 p-3 text-xs leading-relaxed text-slate-500">
            ⚖️ {result.meta.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
