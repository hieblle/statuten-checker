import StatutenChecker from "@/components/StatutenChecker";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          🇦🇹 Österreich · Sportvereine
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Statuten-Checker für Sportvereine
        </h1>
        <p className="mt-2 text-slate-600">
          Lade den Entwurf eurer Vereinsstatuten hoch und erhalte eine
          KI-gestützte Erstprüfung mit Ampel-Bewertung – auf Basis des{" "}
          <strong>Vereinsgesetzes 2002</strong>, der{" "}
          <strong>Gemeinnützigkeit nach BAO/EStG</strong> und der{" "}
          <strong>SPORTUNION-Musterstatuten</strong>.
        </p>

        {/* Ampel-Legende */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" /> grün – geht durch
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" /> orange –
            Kleinigkeiten prüfen
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" /> rot – grobe Mängel
          </span>
        </div>
      </header>

      <StatutenChecker />

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        Keine Rechtsberatung · Erstprüfung zur Orientierung · maßgeblich sind
        Vereinsbehörde, Finanzamt &amp; SPORTUNION
      </footer>
    </main>
  );
}
