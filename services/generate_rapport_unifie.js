/**
 * Générateur du RAPPORT UNIFIÉ DES SERVICES (.docx)
 * ---------------------------------------------------
 * Ce script est conçu pour être repris tel quel dans le backend
 * (ex: server/services/unifiedReportGenerator.js). La fonction
 * generateUnifiedReport(data) prend un objet de données déjà agrégé
 * (venant de MongoDB pour une date donnée) et retourne un Buffer .docx
 * prêt à être envoyé en téléchargement.
 *
 * Les données ci-dessous (const data = {...}) sont un JEU D'EXEMPLE
 * reprenant le rapport du 4 septembre 2026 fourni, pour vérifier le
 * rendu. En production, ce sera remplacé par les données réelles
 * calculées par reportAggregation.js pour la date choisie.
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageOrientation, VerticalAlign, PageNumber,
} = require("docx");
const fs = require("fs");

// ---------- Palette (reprise du rapport existant) ----------
const COLOR_TITLE = "1F3864";
const COLOR_SECTION = "2E74B5";
const COLOR_SUBLABEL = "1B5583";
const COLOR_TABLE_HEADER_FILL = "2F5496";
const COLOR_TOTAL_FILL = "D9E2F3";
const COLOR_BAND_FILL = "F7F9FA";
const FONT = "Calibri";

// ==========================================================
// DONNÉES D'EXEMPLE (à remplacer par les vraies données agrégées)
// ==========================================================
const data = {
  dateLabel: "Vendredi 4 septembre 2026",

  supportClient: {
    title: "Support Client - Kinshasa",
    mailsTotal: 186,
    demandesSouscription: 186,
    questionsDiverses: 0,
    mailsTraites: 186,
    attenteRegularisation: 0,
    dossiersAssignesTotal: 0,
    dossiersEnCours: 0,
    dossiersSaisis: 0,
    agents: [
      { nom: "Amanda", demandes: 0, questions: 0, mailsTraites: 0, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
      { nom: "Adidia", demandes: 60, questions: 0, mailsTraites: 60, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
      { nom: "Dorothée", demandes: 0, questions: 0, mailsTraites: 0, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
      { nom: "Elioth", demandes: 60, questions: 0, mailsTraites: 60, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
      { nom: "Héritier", demandes: 0, questions: 0, mailsTraites: 0, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
      { nom: "Romuald", demandes: 66, questions: 0, mailsTraites: 66, attente: 0, assignes: 0, enCours: 0, saisis: 0 },
    ],
    defisRencontres: "Aucun.",
    observations: "Priorité aux mails pour l'exercice des nouveaux.",
  },

  // Un ou plusieurs "Rapport Individuel" du jour (tableau, peut être vide)
  rapportsIndividuels: [
    {
      titre: "Mr HUGOR | Kinshasa",
      note: "rapport individuel",
      contenu:
        "Au cours de la journée, 99 dossiers ont été attribués au contrôleur pour vérification. " +
        "Les contrôles effectués ont principalement porté sur la conformité et la cohérence des " +
        "informations saisies, ainsi que sur la présence des documents requis. Les anomalies et " +
        "erreurs relevées ont été signalées en vue de leur correction et afin de garantir la " +
        "conformité des dossiers traités.",
    },
  ],

  controleur: {
    title: "Contrôleur — Kinshasa",
    agents: [
      { nom: "Elie MUNANGA", assignes: 50, controles: 46, enAttente: 4, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 0,
        observation: "Observation : comme les jours précédents, un problème de connexion a de nouveau été rencontré, ce qui n'a pas permis au contrôleur de bien évoluer et d'atteindre sa target du jour." },
      { nom: "Eliakim Mokemo", assignes: 50, controles: 50, enAttente: 26, etaAnterieure: 1, sansDeclaration: 0, sansPieces: 0, valides: 0,
        observation: "Erreurs fréquentes : problèmes liés au mode de conditionnement (poids BRUT, NET et CBM), à l'identification de la marchandise (HS, IMO, colis, emballage), aux valeurs (Fret, FOB, assurance, Incoterm) et à l'expédition (embarquement, lieu de départ, arrivée, ETA, ETD, transitaire).\nObservation : les agents de Mombassa commettent encore trop d'erreurs dans le conditionnement." },
      { nom: "Daniel LUBANGULA", assignes: 50, controles: 50, enAttente: 50, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 0,
        observation: "Observation : au cours de la journée, 50 dossiers ont été contrôlés. Les principales anomalies relevées concernent les erreurs sur les valeurs FOB, FRET et BAF, les factures de fret non jointes, les surcharges non renseignées, ainsi que l'absence ou l'insuffisance de description des marchandises." },
      { nom: "Honoré NGBOTO", assignes: 50, controles: 36, enAttente: 50, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 1,
        observation: "Saisisseurs / zones : petits correctifs apportés sur les frais additionnels des dossiers saisis par Hans Michaela, Purity MUTHONI et AGINGA Linet.\nErreurs fréquentes : problèmes liés au mode de conditionnement (poids BRUT, NET et CBM) et aux valeurs (Fret, FOB, assurance, Incoterm)." },
      { nom: "ZOLA Glodi", assignes: 50, controles: 35, enAttente: 1, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 0,
        observation: "Saisisseurs / zones : SHEILLA ARADI — Mombassa ; Purity MUTHONI — Mombassa ; Baartman MJ — Cape Town." },
      { nom: "Nathalis NGOMBO", assignes: 50, controles: 38, enAttente: 50, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 2,
        observation: "Observation : problème de connexion rencontré. Plusieurs dossiers présentent des saisisseurs qui ne renseignent pas les autres surcharges." },
      { nom: "Holly BOKAMBANDJA", assignes: 50, controles: 50, enAttente: 35, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 4,
        observation: "Résumé global : exportateur, frais additionnels, Incoterm, mauvais documents joints dans Synapta, pas de facture de fret dans Sygrem, fret de base, code HS et nom du navire / numéro de voyage." },
    ],
  },

  operateurSaisie: {
    title: "Opérateurs de Saisie - Kinshasa",
    hasData: false, // aucune soumission validée ce jour dans cet exemple
    dossiersRecus: 0,
    dossiersTraites: 0,
    dossiersRestants: 0,
    agents: [],
    observations: "",
  },
};

// ---------- Helpers de style ----------

function sectionTitle(numeral, text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
    border: {
      bottom: { color: COLOR_SECTION, space: 4, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({ text: `${numeral}.  ${text}`, color: COLOR_SECTION, bold: false, size: 30, font: FONT }),
    ],
  });
}

function subLabel(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, color: COLOR_SUBLABEL, size: 22, font: FONT })],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: 21, ...opts })],
  });
}

function multilineBody(text) {
  // Découpe sur \n pour produire un TextRun par ligne, avec un vrai saut
  // de ligne (break), jamais de "\n" littéral dans un TextRun (gotcha docx-js).
  const lines = text.split("\n");
  const runs = [];
  lines.forEach((line, i) => {
    const boldMatch = line.match(/^([^:]+:)(.*)$/);
    if (boldMatch) {
      runs.push(new TextRun({ text: boldMatch[1], bold: true, font: FONT, size: 20 }));
      runs.push(new TextRun({ text: boldMatch[2], font: FONT, size: 20 }));
    } else {
      runs.push(new TextRun({ text: line, font: FONT, size: 20 }));
    }
    if (i < lines.length - 1) runs.push(new TextRun({ text: "", break: 1 }));
  });
  return new Paragraph({ spacing: { after: 60 }, children: runs });
}

function headerCell(text, widthDXA) {
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: COLOR_TABLE_HEADER_FILL, color: "auto" },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", font: FONT, size: 19 })],
    })],
  });
}

function dataCell(content, widthDXA, opts = {}) {
  const paragraphs = Array.isArray(content) ? content : [
    new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(content), font: FONT, size: 19, bold: !!opts.bold })],
    }),
  ];
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: "auto" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: paragraphs,
  });
}

// ---------- Construction du document ----------

function buildSupportClientSection(sc) {
  const totalsCols = [2500, 2500, 2500, 2900]; // somme = 10400 (portrait usable width)
  const totalsHeader = new TableRow({
    children: [
      headerCell("Demandes de Souscription", totalsCols[0]),
      headerCell("Questions Diverses", totalsCols[1]),
      headerCell("Mails traités", totalsCols[2]),
      headerCell("Dossiers en attente de régularisation", totalsCols[3]),
    ],
  });
  const totalsRow = new TableRow({
    children: [
      dataCell(sc.demandesSouscription, totalsCols[0], { center: true }),
      dataCell(sc.questionsDiverses, totalsCols[1], { center: true }),
      dataCell(sc.mailsTraites, totalsCols[2], { center: true }),
      dataCell(sc.attenteRegularisation, totalsCols[3], { center: true }),
    ],
  });

  const dossiersCols = [5200, 5200];
  const dossiersTable = new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: dossiersCols,
    rows: [
      new TableRow({ children: [headerCell("Dossiers en cours", dossiersCols[0]), headerCell("Dossiers saisis", dossiersCols[1])] }),
      new TableRow({ children: [dataCell(sc.dossiersEnCours, dossiersCols[0], { center: true }), dataCell(sc.dossiersSaisis, dossiersCols[1], { center: true })] }),
    ],
  });

  const agentCols = [1400, 1300, 1300, 1300, 1300, 1300, 1300, 1200];
  const agentHeader = new TableRow({
    children: [
      headerCell("Agent", agentCols[0]),
      headerCell("Demandes Souscription", agentCols[1]),
      headerCell("Questions Diverses", agentCols[2]),
      headerCell("Mails Traités", agentCols[3]),
      headerCell("Attente Régularisation", agentCols[4]),
      headerCell("Dossiers Assignés", agentCols[5]),
      headerCell("Dossiers en Cours", agentCols[6]),
      headerCell("Dossiers Saisis / Traités", agentCols[7]),
    ],
  });
  const agentRows = sc.agents.map((a, i) => new TableRow({
    children: [
      dataCell(a.nom, agentCols[0], { bold: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.demandes, agentCols[1], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.questions, agentCols[2], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.mailsTraites, agentCols[3], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.attente, agentCols[4], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.assignes, agentCols[5], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.enCours, agentCols[6], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.saisis, agentCols[7], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
    ],
  }));

  return [
    sectionTitle("I", sc.title),
    subLabel("1. Mails Reçus"),
    bodyText(`Nombre total de mails reçus : ${sc.mailsTotal}`, { bold: true }),
    new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: totalsCols, rows: [totalsHeader, totalsRow] }),
    subLabel("2. Dossiers Assignés"),
    bodyText(`Nombre total de dossiers assignés : ${sc.dossiersAssignesTotal}`, { bold: true }),
    dossiersTable,
    subLabel("Détail des activités par Agent :"),
    new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: agentCols, rows: [agentHeader, ...agentRows] }),
    subLabel("3. DÉFIS RENCONTRÉS"),
    bodyText(sc.defisRencontres, { bold: true }),
    subLabel("4. OBSERVATIONS"),
    bodyText(sc.observations),
  ];
}

function buildIndividualSections(rapports, startNumeral) {
  const out = [];
  rapports.forEach((r, idx) => {
    const numeral = toRoman(startNumeral + idx);
    out.push(sectionTitle(numeral, r.note ? `${r.titre} [${r.note}]` : r.titre));
    out.push(bodyText(r.contenu));
  });
  return out;
}

function buildControleurSection(ctrl, numeral) {
  // Colonnes modifiées : suppression de la colonne "Heure" (750)
  const cols = [1500, 950, 950, 900, 4800]; // somme ~9100, tient dans la largeur landscape utile
  const header = new TableRow({
    children: [
      headerCell("Nom du contrôleur", cols[0]),
      headerCell("Assignés", cols[1]),
      headerCell("Contrôlés", cols[2]),
      headerCell("En attente", cols[3]),
      headerCell("Observations", cols[4]),
    ],
  });

  const totals = ctrl.agents.reduce((acc, a) => ({
    assignes: acc.assignes + a.assignes,
    controles: acc.controles + a.controles,
    enAttente: acc.enAttente + a.enAttente,
    etaAnterieure: acc.etaAnterieure + a.etaAnterieure,
    sansDeclaration: acc.sansDeclaration + a.sansDeclaration,
    sansPieces: acc.sansPieces + a.sansPieces,
    valides: acc.valides + a.valides,
  }), { assignes: 0, controles: 0, enAttente: 0, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 0 });

  const rows = ctrl.agents.map((a) => new TableRow({
    children: [
      dataCell(a.nom, cols[0], { bold: true }),
      dataCell(a.assignes, cols[1], { center: true }),
      dataCell(a.controles, cols[2], { center: true }),
      dataCell(a.enAttente, cols[3], { center: true }),
      dataCell([multilineBody(a.observation || "")], cols[4]),
    ],
  }));

  const totalRow = new TableRow({
    children: [
      dataCell("TOTAL", cols[0], { bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.assignes, cols[1], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.controles, cols[2], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.enAttente, cols[3], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell("", cols[4], { fill: COLOR_TOTAL_FILL }),
    ],
  });

  return {
    heading: sectionTitle(numeral, ctrl.title),
    table: new Table({ width: { size: 9100, type: WidthType.DXA }, columnWidths: cols, rows: [header, ...rows, totalRow] }),
  };
}

function buildOperateurSection(op, numeral) {
  const children = [sectionTitle(numeral, op.title)];
  if (!op.hasData || op.agents.length === 0) {
    children.push(bodyText("Aucune donnée validée pour cette date."));
    return children;
  }
  children.push(subLabel("Activité du jour"));
  children.push(bodyText(`Dossiers reçus : ${op.dossiersRecus}  |  Traités : ${op.dossiersTraites}  |  Restants : ${op.dossiersRestants}`, { bold: true }));

  const cols = [3000, 2500, 2500, 2400];
  const header = new TableRow({
    children: [headerCell("Agent", cols[0]), headerCell("Dossiers reçus", cols[1]), headerCell("Dossiers traités", cols[2]), headerCell("Dossiers restants", cols[3])],
  });
  const rows = op.agents.map((a, i) => new TableRow({
    children: [
      dataCell(a.nom, cols[0], { bold: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.recus, cols[1], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.traites, cols[2], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.restants, cols[3], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
    ],
  }));
  children.push(new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: cols, rows: [header, ...rows] }));
  if (op.observations) {
    children.push(subLabel("Observations"));
    children.push(bodyText(op.observations));
  }
  return children;
}

function toRoman(n) {
  const map = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return map[n - 1] || String(n);
}

async function generateUnifiedReport(reportData) {
  const d = reportData || data;

  const titlePage = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "RAPPORT UNIFIÉ DES SERVICES", bold: true, color: COLOR_TITLE, size: 40, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: d.dateLabel, italics: true, size: 22, font: FONT })],
    }),
  ];

  const scSection = buildSupportClientSection(d.supportClient);
  let numeral = 2;
  const individualSections = buildIndividualSections(d.rapportsIndividuels, numeral);
  numeral += d.rapportsIndividuels.length;

  const ctrlBuilt = buildControleurSection(d.controleur, toRoman(numeral));
  numeral += 1;

  const opSection = buildOperateurSection(d.operateurSaisie, toRoman(numeral));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 21 } } },
    },
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })],
            })],
          }),
        },
        children: [...titlePage, ...scSection, ...individualSections],
      },
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 700, bottom: 700, left: 700, right: 700 },
          },
        },
        children: [ctrlBuilt.heading, ctrlBuilt.table],
      },
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } },
        },
        children: [...opSection],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateUnifiedReport };

// Exécution directe (test local) : produit un fichier de démonstration
if (require.main === module) {
  generateUnifiedReport(data).then((buffer) => {
    fs.writeFileSync("/home/claude/rapport_model/Rapport_Unifie_genere.docx", buffer);
    console.log("OK — fichier généré : Rapport_Unifie_genere.docx");
  });
}
