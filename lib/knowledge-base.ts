// ============================================================================
// Wissensbasis / Prüfkatalog für österreichische Sportvereins-Statuten
// ----------------------------------------------------------------------------
// Grundlagen:
//   • Vereinsgesetz 2002 (VerG) – insb. § 3 Abs 2 (zwingender Mindestinhalt)
//     und § 5 (Vereinsorgane, u. a. mind. zwei Rechnungsprüfende)
//   • Bundesabgabenordnung (BAO §§ 34–47) & § 4a EStG – Gemeinnützigkeit /
//     Steuerbegünstigung (Körpersport ist gemeinnützig nach § 35 Abs 2 BAO)
//   • Vereinsrichtlinien des Bundesministeriums für FINANZEN (BMF) – Maßstab
//     v. a. für die Auflösungs-/Vermögensbindungsklausel
//   • SPORTUNION Musterstatuten (Haupt- & Zweigverein) – bilden die
//     BMF-konforme Fassung inkl. Begünstigungswürdigkeit ab
//
// „erstpruefung: true“ markiert die Punkte, auf die eine Anwältin/ein Anwalt
// bei der Erstprüfung ZUERST achtet (Erfahrungswissen SPORTUNION OÖ). Diese
// werden im Prompt höher gewichtet und im UI als „Anwalts-Erstblick“ eigens
// hervorgehoben.
//
// Schweregrad: „kritisch“ = Statuten (rechtlich/steuerlich) nicht haltbar,
// „wichtig“ = sollte korrigiert werden, „empfohlen“ = Best Practice.
// Die Ampel wird daraus in scoring.ts berechnet.
// ============================================================================

import type { Category, Check } from "./types";

export const CATEGORY_META: Record<
  Category,
  { label: string; kurz: string; beschreibung: string }
> = {
  gesetzlich: {
    label: "Gesetzliche Pflichtangaben",
    kurz: "Vereinsgesetz 2002",
    beschreibung:
      "Zwingender Mindestinhalt nach § 3 Abs 2 VerG 2002. Fehlt einer dieser Punkte, kann die Vereinsbehörde die Statuten zurückweisen bzw. die Gründung untersagen.",
  },
  gemeinnuetzigkeit: {
    label: "Gemeinnützigkeit & Steuer",
    kurz: "BAO §§ 34 ff / EStG",
    beschreibung:
      "Voraussetzungen für die abgabenrechtliche Begünstigung – für die meisten Sportvereine der wichtigste Block. Maßstab (v. a. für die Auflösungsklausel) sind die Musterstatuten der Vereinsrichtlinien des BMF, nicht jene des BMI. Fehler hier gefährden die Steuerbegünstigung.",
  },
  sportunion: {
    label: "SPORTUNION-Vorgaben",
    kurz: "Dachverband",
    beschreibung:
      "Anforderungen aus der Mitgliedschaft im Dachverband SPORTUNION (Landesverband). Für die rechtliche Gültigkeit nicht zwingend, aber für die Verbandsanerkennung relevant.",
  },
  qualitaet: {
    label: "Governance, Qualität & Best Practice",
    kurz: "Formales & Governance",
    beschreibung:
      "Governance-Best-Practices (virtuelle/hybride Versammlungen, Funktionsperiode bis zur Neuwahl, Kooptierung), Datenschutz & Urheberrecht sowie Vollständigkeit/Klarheit (offene Platzhalter, Widerspruchsfreiheit). Selten rechtlich fatal, aber aus Anwaltssicht fester Teil der Erstprüfung.",
  },
};

export const CHECKS: Check[] = [
  // ──────────────────────────── GESETZLICH (VerG 2002) ──────────────────────
  {
    id: "g-name",
    titel: "Vereinsname",
    paragraph: "§ 1",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 1 VerG 2002",
    anforderung:
      "Die Statuten müssen einen Vereinsnamen festlegen. Der Name muss einen Schluss auf den Vereinszweck zulassen und darf nicht irreführend sein.",
    pruefhinweis:
      "Ist ein konkreter Name eingetragen (kein Platzhalter wie „____“)? Der Name darf keinen unzulässigen Zusatz führen, der eine andere Rechtsform (z. B. GmbH) vortäuscht.",
  },
  {
    id: "g-sitz",
    titel: "Vereinssitz",
    paragraph: "§ 1",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 2 VerG 2002",
    anforderung:
      "Die Statuten müssen den Sitz des Vereins (eine konkrete österreichische Gemeinde/Ort) angeben.",
    pruefhinweis:
      "Ist ein konkreter Ort genannt (nicht „PLZ Ort…“)? Der Sitz muss in Österreich liegen; er bestimmt die zuständige Vereinsbehörde.",
  },
  {
    id: "g-zweck",
    titel: "Vereinszweck (klar & umfassend)",
    paragraph: "§ 2",
    category: "gesetzlich",
    severity: "kritisch",
    erstpruefung: true,
    rechtsgrundlage: "§ 3 Abs 2 Z 3 VerG 2002",
    anforderung:
      "Der Vereinszweck muss klar und umfassend umschrieben und erkennbar ideell (nicht auf Gewinn gerichtet) sein.",
    pruefhinweis:
      "Anwalts-Erstblick: Kommt der Zweck konkret und die Sportart eingesetzt heraus (nicht „…… sports“)? Die gemeinnützigkeitsrechtliche Beurteilung des Körpersport-Zwecks erfolgt zusätzlich unter „Gemeinnützigkeit“.",
  },
  {
    id: "g-mittel",
    titel: "Mittel zur Zweckerreichung (ideell & materiell)",
    paragraph: "§ 3",
    category: "gesetzlich",
    severity: "kritisch",
    erstpruefung: true,
    rechtsgrundlage: "§ 3 Abs 2 Z 4 VerG 2002",
    anforderung:
      "Die Statuten müssen die zur Verwirklichung des Zwecks dienenden ideellen Mittel (Tätigkeiten) UND die Art der Aufbringung der finanziellen (materiellen) Mittel anführen.",
    pruefhinweis:
      "Beides muss vorhanden sein: Tätigkeiten (z. B. Trainings, Wettkämpfe) und Einnahmequellen (Mitgliedsbeiträge, Subventionen, Spenden …). Die saubere Trennung beider wird gesondert geprüft (Anwalts-Erstblick).",
  },
  {
    id: "g-mitgliedschaft",
    titel: "Erwerb & Beendigung der Mitgliedschaft",
    paragraph: "§§ 4–5",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 5 VerG 2002",
    anforderung:
      "Die Statuten müssen Arten der Mitgliedschaft, deren Erwerb (Aufnahme) und deren Beendigung (Tod/Verlust Rechtspersönlichkeit, Austritt, Ausschluss) regeln.",
    pruefhinweis:
      "Sind Aufnahmeverfahren, Austrittsmodalitäten und Ausschlussgründe samt zuständigem Organ geregelt? Beendigungsarten sollten vollständig sein.",
  },
  {
    id: "g-rechte-pflichten",
    titel: "Rechte & Pflichten der Mitglieder",
    paragraph: "§ 6",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 6 VerG 2002",
    anforderung:
      "Die Statuten müssen die Rechte und Pflichten der Vereinsmitglieder festlegen.",
    pruefhinweis:
      "Enthalten: Teilnahme-/Stimm-/Wahlrecht, Informationsrecht (inkl. Recht auf Ausfolgung der Statuten und Information über den Rechnungsabschluss) sowie Pflichten (Beitragszahlung, Förderung des Vereinszwecks). Das Recht von mind. 1/10 der Mitglieder, eine Generalversammlung zu verlangen, sollte enthalten sein (§ 5 Abs 2 VerG).",
  },
  {
    id: "g-organe",
    titel: "Vereinsorgane & ihre Aufgaben",
    paragraph: "§ 7",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 7 VerG 2002",
    anforderung:
      "Die Statuten müssen die Organe des Vereins und ihre Aufgaben benennen – insbesondere Mitgliederversammlung (Generalversammlung) und Leitungsorgan (Vorstand).",
    pruefhinweis:
      "Üblich und vollständig: Generalversammlung, Vorstand, Rechnungsprüfende, Schlichtungseinrichtung. Die Aufgaben jedes Organs müssen geregelt sein.",
  },
  {
    id: "g-vertretung",
    titel: "Vertretung nach außen & Zeichnung",
    paragraph: "§ 11",
    category: "gesetzlich",
    severity: "kritisch",
    erstpruefung: true,
    rechtsgrundlage: "§ 3 Abs 2 Z 7 VerG 2002",
    anforderung:
      "Die Statuten müssen klar und nachvollziehbar angeben, wer die Vereinsgeschäfte führt und wer den Verein nach außen vertritt, sowie die Art der Zeichnung (Unterfertigung) verbindlicher Urkunden.",
    pruefhinweis:
      "Anwalts-Erstblick: Ist die Vertretung nach außen eindeutig und nachvollziehbar geregelt – idealerweise Vier-Augen-Prinzip (z. B. Obfrau/Obmann gemeinsam mit weiterem Vorstandsmitglied; in Geldangelegenheiten mit der/dem Kassierenden)? Unklare Vertretungsregeln sind ein häufiger Zurückweisungsgrund.",
  },
  {
    id: "g-bestellung",
    titel: "Art der Bestellung der Organe",
    paragraph: "§§ 8, 10, 12",
    category: "gesetzlich",
    severity: "wichtig",
    rechtsgrundlage: "§ 3 Abs 2 Z 8 VerG 2002",
    anforderung:
      "Die Statuten müssen die Art der Bestellung der Vereinsorgane regeln (Wahl/Bestellung, Funktionsperiode, Nachbesetzung).",
    pruefhinweis:
      "Sind Wahl durch die Generalversammlung, Funktionsdauer und Vorgehen bei Ausscheiden geregelt? (Kontinuität bis zur Neuwahl und Kooptierung werden gesondert bewertet.)",
  },
  {
    id: "g-beschluss",
    titel: "Erfordernisse gültiger Beschlussfassung",
    paragraph: "§§ 8, 10",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 9 VerG 2002",
    anforderung:
      "Die Statuten müssen die Erfordernisse für gültige Beschlüsse der Organe regeln: Beschlussfähigkeit, Einberufung und erforderliche Mehrheiten.",
    pruefhinweis:
      "Geregelt sein müssen u. a.: Einberufungsfrist & -form der Generalversammlung, Beschlussfähigkeit, einfache vs. qualifizierte Mehrheiten (Statutenänderung/Vorstandsabwahl meist 2/3, Auflösung meist 3/4) sowie Beschlussfähigkeit/Mehrheiten des Vorstands.",
  },
  {
    id: "g-schlichtung",
    titel: "Schlichtungseinrichtung (Streitbeilegung)",
    paragraph: "§ 13",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 10 VerG 2002",
    anforderung:
      "Die Statuten müssen eine vereinsinterne Einrichtung zur Schlichtung von Streitigkeiten aus dem Vereinsverhältnis vorsehen (Zusammensetzung & Verfahren mit beiderseitigem Gehör).",
    pruefhinweis:
      "Es muss eine „Schlichtungseinrichtung“ sein – KEIN Schiedsgericht nach §§ 577 ff ZPO. Häufiger Fehler: Bezeichnung/Ausgestaltung als echtes Schiedsgericht. Bestellung der Mitglieder und beiderseitiges Gehör müssen geregelt sein.",
  },
  {
    id: "g-aufloesung",
    titel: "Freiwillige Auflösung & Vermögensverwertung",
    paragraph: "§ 15",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 3 Abs 2 Z 11 VerG 2002",
    anforderung:
      "Die Statuten müssen die freiwillige Auflösung des Vereins UND die Verwertung des Vereinsvermögens im Fall der Auflösung regeln.",
    pruefhinweis:
      "Beide Bestandteile müssen vorhanden sein: Beschlussfassung über die Auflösung (zuständiges Organ, Mehrheit) und Regelung über das verbleibende Vermögen. (Die inhaltliche steuerliche Bindung wird gesondert unter „Gemeinnützigkeit“ geprüft.)",
  },
  {
    id: "g-rechnungspruefer",
    titel: "Mindestens zwei Rechnungsprüfende",
    paragraph: "§ 12",
    category: "gesetzlich",
    severity: "kritisch",
    rechtsgrundlage: "§ 5 Abs 5 VerG 2002",
    anforderung:
      "Die Statuten müssen mindestens zwei Rechnungsprüfende vorsehen, die die Finanzgebarung auf Ordnungsmäßigkeit und statutengemäße Mittelverwendung prüfen.",
    pruefhinweis:
      "Es müssen mind. ZWEI Rechnungsprüfende sein. Sie dürfen keinem Organ angehören, dessen Tätigkeit Gegenstand der Prüfung ist (Unvereinbarkeit). Bestelldauer und Prüfauftrag sollten geregelt sein.",
  },
  {
    id: "g-leitungsorgan",
    titel: "Leitungsorgan aus mind. zwei Personen",
    paragraph: "§ 10",
    category: "gesetzlich",
    severity: "wichtig",
    rechtsgrundlage: "§ 5 Abs 3 VerG 2002",
    anforderung:
      "Das Leitungsorgan (Vorstand) muss aus mindestens zwei natürlichen Personen bestehen.",
    pruefhinweis:
      "Mindestbesetzung erkennbar (z. B. Obfrau/Obmann + Stellvertretung + Schriftführung + Kassier)? Funktionen und Vertretung im Verhinderungsfall sollten geregelt sein.",
  },

  // ──────────────────────── GEMEINNÜTZIGKEIT (BAO / EStG) ───────────────────
  {
    id: "gn-zweck-ausschliesslich",
    titel: "Körpersport-Zweck + ausschließliche & unmittelbare Förderung",
    paragraph: "§§ 2, 3a",
    category: "gemeinnuetzigkeit",
    severity: "kritisch",
    erstpruefung: true,
    rechtsgrundlage: "§§ 34, 35 Abs 2, 39, 41 BAO",
    anforderung:
      "Eine konkrete Form des Körpersports (z. B. Fußball, Schifahren, Turnen) muss als gemeinnütziger Zweck klar zum Ausdruck kommen, und die Statuten müssen ausdrücklich die AUSSCHLIESSLICHE und UNMITTELBARE Förderung dieses Zwecks im Sinne der §§ 34 ff BAO vorsehen.",
    pruefhinweis:
      "Anwalts-Erstblick Nr. 1: Kommt der Körpersport als gemeinnütziger Zweck ordentlich heraus? Nr. 2: Stehen die Worte „ausschließlich und unmittelbar“ und der Bezug zu den §§ 34 ff BAO ausdrücklich in den Statuten? Fehlt eines davon → orange bzw. rot.",
  },
  {
    id: "gn-kein-gewinn",
    titel: "Kein Gewinnstreben",
    paragraph: "§§ 2, 3a",
    category: "gemeinnuetzigkeit",
    severity: "kritisch",
    rechtsgrundlage: "§ 39 Z 1 BAO",
    anforderung:
      "Die Statuten müssen festhalten, dass der Verein nicht auf Gewinn gerichtet ist.",
    pruefhinweis:
      "Aussage wie „nicht auf Gewinn ausgerichtet“ vorhanden? Zweck und Mittel dürfen kein vorrangiges Erwerbsstreben erkennen lassen.",
  },
  {
    id: "gn-mittel-trennung",
    titel: "Ideelle & materielle Mittel sauber getrennt (nicht vermischt)",
    paragraph: "§ 3",
    category: "gemeinnuetzigkeit",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "§ 39 BAO / Vereinsrichtlinien BMF",
    anforderung:
      "Ideelle Mittel (was der Verein TUT – seine Tätigkeiten) und materielle Mittel (WOHER der Verein Geld bzw. Einnahmen bezieht) müssen in getrennten Abschnitten dargestellt und dürfen NICHT vermischt sein.",
    pruefhinweis:
      "Anwalts-Erstblick: Sind ideelle Mittel (Tätigkeiten) und materielle Mittel (Einnahmequellen) klar getrennt gegliedert? Häufiger Fehler: Einnahmequellen stehen zwischen den Tätigkeiten (oder umgekehrt) – das gilt als „vermischt“ und ist zu beanstanden.",
  },
  {
    id: "gn-mittelverwendung",
    titel: "Mittelverwendung nur für begünstigte Zwecke",
    paragraph: "§ 3a",
    category: "gemeinnuetzigkeit",
    severity: "kritisch",
    rechtsgrundlage: "§ 39 Z 1 BAO",
    anforderung:
      "Die Statuten müssen vorsehen, dass die Mittel des Vereins ausschließlich für die begünstigten (statutarischen) Zwecke verwendet werden.",
    pruefhinweis:
      "Klausel zur ausschließlichen Mittelverwendung vorhanden? Auch gesammelte Spenden und Zufallsgewinne dürfen nur zweckgewidmet verwendet werden.",
  },
  {
    id: "gn-kein-vermoegensvorteil",
    titel: "Keine Zuwendungen/Gewinnanteile an Mitglieder",
    paragraph: "§ 3a",
    category: "gemeinnuetzigkeit",
    severity: "kritisch",
    rechtsgrundlage: "§ 39 Z 2 u. 3 BAO",
    anforderung:
      "Die Statuten müssen ausschließen, dass Mitglieder Gewinnanteile oder (in ihrer Eigenschaft als Mitglieder) sonstige Zuwendungen aus Mitteln des Vereins erhalten, und dürfen keine unverhältnismäßig hohen Vergütungen zulassen.",
    pruefhinweis:
      "Klausel gegen Begünstigung von Personen durch zweckfremde oder unverhältnismäßig hohe Vergütungen vorhanden? Entgelte müssen einem Drittvergleich standhalten.",
  },
  {
    id: "gn-vermoegensbindung",
    titel: "Vermögensbindung/Auflösung nach BMF-Vereinsrichtlinien",
    paragraph: "§ 15",
    category: "gemeinnuetzigkeit",
    severity: "kritisch",
    erstpruefung: true,
    rechtsgrundlage: "§ 39 Z 5 BAO, § 41 BAO, § 4a Abs 2 EStG; VereinsR BMF",
    anforderung:
      "Die Auflösungsbestimmung (Vermögen bei freiwilliger ODER behördlicher Auflösung UND bei Wegfall des begünstigten Zwecks) muss den Musterstatuten der Vereinsrichtlinien des BUNDESMINISTERIUMS FÜR FINANZEN entsprechen: Das Restvermögen muss weiterhin für begünstigte (gemeinnützige) Zwecke – Förderung des Körpersports – gebunden bleiben; eine Verteilung an Mitglieder ist unzulässig.",
    pruefhinweis:
      "WICHTIGSTE Steuer-Klausel und häufigster Ablehnungsgrund des Finanzamts. Maßstab sind die BMF-Vereinsrichtlinien – NICHT die (steuerlich unzureichenden) Musterstatuten des BMI. Beide Fälle nennen: „Auflösung“ UND „Wegfall des begünstigten Zwecks“. Die korrekte Formulierung variiert: nur gemeinnützig vs. gemeinnützig UND spendenbegünstigt (dann § 4a-EStG-konforme Fassung wie in den SPORTUNION-Musterstatuten). Fehlt, unvollständig oder nur „BMI-Fassung“ → in der Regel rot.",
  },
  {
    id: "gn-beguenstigungswuerdigkeit",
    titel: "Begünstigungswürdigkeit (bei Spendenbegünstigung)",
    paragraph: "§ 3a",
    category: "gemeinnuetzigkeit",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "§ 4a EStG, §§ 34 ff BAO; VereinsR BMF",
    anforderung:
      "Will der Verein spendenbegünstigt sein, müssen die Statuten einen eigenen, ausführlichen Abschnitt „Begünstigungswürdigkeit“ (wie § 3a der SPORTUNION-Musterstatuten) enthalten, der die Voraussetzungen der §§ 34 ff BAO / § 4a EStG detailliert abbildet.",
    pruefhinweis:
      "Nur relevant, wenn Spendenbegünstigung angestrebt wird. Ist ein solcher Abschnitt vorhanden → auf Vollständigkeit prüfen (in den SPORTUNION-OÖ-Musterstatuten unter § 3a vorbildlich abgebildet). Gibt es keinerlei Hinweis auf angestrebte Spendenbegünstigung und keinen solchen Abschnitt → status = nicht_anwendbar (mit kurzem Hinweis).",
  },
  {
    id: "gn-klarheit",
    titel: "Klare, vollständige & widerspruchsfreie Gemeinnützigkeits-Regelungen",
    paragraph: "§§ 2, 3, 3a, 15",
    category: "gemeinnuetzigkeit",
    severity: "wichtig",
    rechtsgrundlage: "§ 41 BAO / Vereinsrichtlinien BMF",
    anforderung:
      "Die abgabenrechtlich relevanten Bestimmungen (Zweck, Mittel, Mittelverwendung, Vermögensbindung) müssen klar, vollständig und widerspruchsfrei sein und zueinander passen.",
    pruefhinweis:
      "Passen Zweck (§ 2) und Mittel (§ 3) zusammen? Gibt es Widersprüche (z. B. erwerbswirtschaftliche Tätigkeiten, die den begünstigten Zweck überlagern)? Begünstigungsschädliche Betriebe nur mit Ausnahmegenehmigung (§ 44/§ 45a BAO).",
  },

  // ───────────────────────────── SPORTUNION ────────────────────────────────
  {
    id: "su-mitgliedschaft-verband",
    titel: "Mitgliedschaft in SPORTUNION & Anerkennung der Statuten",
    paragraph: "§ 1",
    category: "sportunion",
    severity: "wichtig",
    rechtsgrundlage: "SPORTUNION Musterstatuten § 1",
    anforderung:
      "Die Statuten sollten festhalten, dass der Verein Mitglied der SPORTUNION Österreich sowie des zuständigen SPORTUNION Landesverbands ist und deren Statuten anerkennt.",
    pruefhinweis:
      "Bezug zur SPORTUNION Österreich und zum Landesverband vorhanden? Für die Verbandsanerkennung erforderlich.",
  },
  {
    id: "su-antidoping",
    titel: "Anti-Doping-Bestimmungen",
    paragraph: "§ 14",
    category: "sportunion",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "SPORTUNION Musterstatuten § 14 / ADBG",
    anforderung:
      "Die Statuten sollten ein Bekenntnis / eine Unterwerfung des Vereins und seiner Mitglieder unter die geltenden nationalen und internationalen Anti-Doping-Bestimmungen enthalten.",
    pruefhinweis:
      "Anwalts-Erstblick: Ist ein Bekenntnis zu den Anti-Doping-Bestimmungen enthalten? Für Sportvereine (Wettkampf, Förderungen, Verbandszugehörigkeit) praktisch unverzichtbar.",
  },
  {
    id: "su-statutenaenderung-zustimmung",
    titel: "Statutenänderung mit Zustimmung des Landesverbands",
    paragraph: "§ 8",
    category: "sportunion",
    severity: "empfohlen",
    rechtsgrundlage: "SPORTUNION Musterstatuten § 8",
    anforderung:
      "Die Statuten sollten vorsehen, dass eine Statutenänderung der vorherigen Zustimmung des SPORTUNION Landesverbands bedarf.",
    pruefhinweis:
      "Zustimmungsvorbehalt des Landesverbands bei Statutenänderungen vorhanden?",
  },
  {
    id: "su-aufloesung-empfaenger",
    titel: "Auflösungsvermögen an SPORTUNION Landesverband",
    paragraph: "§ 15",
    category: "sportunion",
    severity: "empfohlen",
    rechtsgrundlage: "SPORTUNION Musterstatuten § 15 / § 4a EStG",
    anforderung:
      "Die Statuten sollten als Empfänger des Auflösungsvermögens den SPORTUNION Landesverband (mit zwingender Zweckwidmung Körpersport) sowie eine Ersatzregelung vorsehen.",
    pruefhinweis:
      "Konkreter begünstigter Empfänger genannt und Ersatzregelung für den Fall vorhanden, dass dieser nicht mehr existiert/begünstigt ist? Ergänzt die steuerliche Vermögensbindung.",
  },
  {
    id: "su-ehrenkodex",
    titel: "Werte / Ehrenkodex der SPORTUNION",
    paragraph: "§ 2",
    category: "sportunion",
    severity: "empfohlen",
    rechtsgrundlage: "SPORTUNION Musterstatuten § 2",
    anforderung:
      "Die Statuten können ein Bekenntnis zu den Werten und zum Ehrenkodex der SPORTUNION sowie zur Gleichbehandlung enthalten.",
    pruefhinweis:
      "Wertebekenntnis/Ehrenkodex vorhanden? Optional, aber Teil der Musterstatuten.",
  },
  {
    id: "su-zweigstruktur",
    titel: "Verhältnis Haupt-/Zweigverein",
    paragraph: "§ 16",
    category: "sportunion",
    severity: "empfohlen",
    nurMitZweigstruktur: true,
    rechtsgrundlage: "SPORTUNION Musterstatuten § 16",
    anforderung:
      "Bei Vereinen mit Haupt-/Zweigvereinsstruktur müssen die Statuten das Verhältnis regeln (Entsendungsrecht in den Vorstand, automatische Mitgliedschaft, Zustimmung zu Statutenänderungen, ggf. Abführungsbetrag).",
    pruefhinweis:
      "Nur relevant, wenn der Verein als Haupt- oder Zweigverein organisiert ist. Für eigenständige Vereine nicht anwendbar.",
  },

  // ─────────────────── GOVERNANCE, QUALITÄT & BEST PRACTICE ─────────────────
  {
    id: "q-virtuelle-versammlungen",
    titel: "Virtuelle & hybride Versammlungen/Sitzungen",
    paragraph: "§§ 8, 10",
    category: "qualitaet",
    severity: "empfohlen",
    erstpruefung: true,
    rechtsgrundlage: "VirtGesG (§§ 2, 4) / Best Practice",
    anforderung:
      "Die Statuten sollten die Abhaltung virtueller und/oder hybrider Mitgliederversammlungen (Generalversammlung) und möglichst auch virtueller/hybrider Vorstandssitzungen vorsehen.",
    pruefhinweis:
      "Anwalts-Erstblick: Sind virtuelle/hybride Versammlungen geregelt (Bezug auf das VirtGesG)? Fehlen sie → orange (moderne, empfohlene Regelung; in den Musterstatuten enthalten).",
  },
  {
    id: "q-funktionsperiode-neuwahl",
    titel: "Funktionsperiode dauert bis zur Neuwahl",
    paragraph: "§ 10",
    category: "qualitaet",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "Best Practice / Handlungsfähigkeit der Organe",
    anforderung:
      "Die Statuten sollten vorsehen, dass die Funktionsperiode der Funktionäre jeweils bis zur Neuwahl (Bestellung der Nachfolger) andauert, um Vertretungslücken zu vermeiden.",
    pruefhinweis:
      "Anwalts-Erstblick: Steht sinngemäß „die Funktionsperiode dauert bis zur Neuwahl / bis zur Bestellung eines neuen Vorstands an“? Fehlt diese Kontinuitätsklausel → orange.",
  },
  {
    id: "q-kooptierung",
    titel: "Kooptierung ausscheidender Vorstandsmitglieder",
    paragraph: "§ 10",
    category: "qualitaet",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "Best Practice / § 3 Abs 2 Z 8 VerG",
    anforderung:
      "Die Statuten sollten vorsehen, dass während der Funktionsperiode ausscheidende Vorstandsmitglieder durch Kooptierung ersetzt werden (mit nachträglicher Genehmigung durch die Generalversammlung).",
    pruefhinweis:
      "Anwalts-Erstblick: Ist eine Kooptierungs-Regelung für ausscheidende Vorstandsmitglieder vorhanden (inkl. späterer Genehmigung durch die GV)? Fehlt → orange.",
  },
  {
    id: "q-datenschutz",
    titel: "Datenschutz (DSGVO)",
    paragraph: "§ 6",
    category: "qualitaet",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "DSGVO / DSG",
    anforderung:
      "Die Statuten sollten Bestimmungen zur Verarbeitung personenbezogener Daten der Mitglieder (DSGVO) enthalten.",
    pruefhinweis:
      "Anwalts-Erstblick: Datenschutz-/DSGVO-Klausel vorhanden (Verarbeitung, Übermittlung an übergeordnete Verbände, Information nach Art. 13 DSGVO)? Fehlt → orange.",
  },
  {
    id: "q-urheberrecht",
    titel: "Urheber- & Bildrechte",
    paragraph: "§ 6",
    category: "qualitaet",
    severity: "empfohlen",
    erstpruefung: true,
    rechtsgrundlage: "UrhG / Recht am eigenen Bild",
    anforderung:
      "Die Statuten sollten Regelungen zu Bild- und Urheberrechten enthalten (Zustimmung zur Herstellung/Verwendung von Fotos und Medien der Mitglieder, Verwertungsrechte, Widerspruchsmöglichkeit).",
    pruefhinweis:
      "Anwalts-Erstblick: Bild-/Urheberrechts-Klausel vorhanden (Foto-/Medienverwendung, Verwertungsrechte, Widerspruchsrecht des Mitglieds)? Fehlt → orange.",
  },
  {
    id: "q-platzhalter",
    titel: "Keine offenen Platzhalter",
    paragraph: "gesamt",
    category: "qualitaet",
    severity: "wichtig",
    rechtsgrundlage: "Formale Vollständigkeit",
    anforderung:
      "Die Statuten dürfen keine unausgefüllten Platzhalter enthalten (z. B. „____“, „[Name]“, „PLZ Ort“, „TT. Monat Jahr“, „…… sports“, „[Sportart]“).",
    pruefhinweis:
      "Alle Leerstellen ausgefüllt? Offene Platzhalter führen regelmäßig zu Rückfragen/Zurückweisung durch die Vereinsbehörde. (Eine deterministische Platzhalter-Erkennung läuft zusätzlich.)",
  },
  {
    id: "q-sportart",
    titel: "Konkrete Sportart eingesetzt",
    paragraph: "§§ 2–3",
    category: "qualitaet",
    severity: "wichtig",
    erstpruefung: true,
    rechtsgrundlage: "Bestimmtheit des Zwecks",
    anforderung:
      "Die konkret betriebene Sportart (Form des Körpersports) muss überall dort eingesetzt sein, wo die Vorlage Platzhalter vorsieht (Zweck und Tätigkeiten).",
    pruefhinweis:
      "Anwalts-Erstblick: Ist die Sportart konkret benannt statt generischer Platzhalter („…… sports“)? Ein unbestimmter Zweck schwächt die vereins- und steuerrechtliche Beurteilung.",
  },
  {
    id: "q-datum-organ",
    titel: "Beschlussdatum & beschließendes Organ",
    paragraph: "Kopf",
    category: "qualitaet",
    severity: "empfohlen",
    rechtsgrundlage: "Formales",
    anforderung:
      "Die Statuten sollten erkennen lassen, wann und durch welches Organ (Gründungs-/Generalversammlung) sie beschlossen wurden.",
    pruefhinweis:
      "Beschlussvermerk mit Datum vorhanden (kein „TT. Monat Jahr“)? Für die Einreichung relevant.",
  },
  {
    id: "q-verweise",
    titel: "Konsistente Querverweise & Nummerierung",
    paragraph: "gesamt",
    category: "qualitaet",
    severity: "empfohlen",
    rechtsgrundlage: "Formales",
    anforderung:
      "Interne Verweise (§/Abs./lit.) und die Nummerierung der Paragrafen müssen stimmig sein.",
    pruefhinweis:
      "Verweisen Querverweise auf existierende und passende Stellen? Sind Paragrafen lückenlos/folgerichtig nummeriert?",
  },
  {
    id: "q-widerspruchsfrei",
    titel: "Verständlichkeit & Widerspruchsfreiheit",
    paragraph: "gesamt",
    category: "qualitaet",
    severity: "empfohlen",
    rechtsgrundlage: "Formales",
    anforderung:
      "Die Statuten sollten in sich schlüssig, verständlich und frei von inhaltlichen Widersprüchen sein.",
    pruefhinweis:
      "Gibt es widersprüchliche Regelungen (z. B. unterschiedliche Mehrheiten/Fristen für dieselbe Sache, abweichende Organbezeichnungen)?",
  },
];

/** Liefert die für den erkannten Vereinstyp anwendbaren Prüfpunkte. */
export function applicableChecks(_istZweigstruktur: boolean): Check[] {
  // Der Zweigstruktur-Punkt bleibt im Katalog und wird später als
  // „nicht_anwendbar“ gewertet, wenn keine Haupt-/Zweigstruktur vorliegt.
  return CHECKS;
}

export const CHECK_BY_ID: Record<string, Check> = Object.fromEntries(
  CHECKS.map((c) => [c.id, c]),
);

/** Anzahl der als „Anwalts-Erstprüfung“ markierten Punkte. */
export const ERSTPRUEFUNG_IDS: string[] = CHECKS.filter((c) => c.erstpruefung).map(
  (c) => c.id,
);
