import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Statuten-Checker · Sportvereine Österreich",
  description:
    "KI-gestützte Erstprüfung von Vereinsstatuten für österreichische Sportvereine (auf Basis der SPORTUNION Musterstatuten, Vereinsgesetz 2002 & Gemeinnützigkeit nach BAO).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
