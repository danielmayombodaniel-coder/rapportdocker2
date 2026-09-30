import { getReportDateRange, findReportsForDate, sumValidatedFields } from './reportAggregation.js';
import SupportClientReport from '../models/SupportClientReport.js';
import IndividualReport from '../models/IndividualReport.js';
import ControllerReport from '../models/ControllerReport.js';
import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';
import DailyReportNotes from '../models/DailyReportNotes.js';

/**
 * Formate une date en français (ex: "Vendredi 4 septembre 2026")
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDateInFrench(date) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const dayName = days[date.getUTCDay()];
    const dayNumber = date.getUTCDate();
    const monthName = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    
    return `${dayName} ${dayNumber} ${monthName} ${year}`;
}

/**
 * Construit les données de support client pour le rapport unifié
 *
 * @param {Array} reports - Rapports validés de SupportClient
 * @returns {object}
 */
function buildSupportClientData(reports, dailyNotes = {}) {
    const validatedReports = reports.filter(r => r.status === 'validated');
    
    if (validatedReports.length === 0) {
        return {
            title: 'Support Client - Kinshasa',
            hasData: false,
            agents: [],
            defisRencontres: dailyNotes.defisRencontres || '',
            observations: dailyNotes.observations || ''
        };
    }

    // Calculer les totaux agrégés
    const totals = sumValidatedFields(reports, {
        demandesSouscription: 'mails.demandesSouscription',
        questionsDiverses: 'mails.questionsDiverses',
        mailsTraites: 'mails.mailsTraites',
        attenteRegularisation: 'mails.dossiersEnAttenteRegularisation',
        dossiersAssignesTotal: 'dossiers.assignes',
        dossiersEnCours: 'dossiers.enCours',
        dossiersSaisis: 'dossiers.saisis',
        mailsTotal: 'mails.demandesSouscription'
    });

    // Calculer le total des mails reçus
    totals.mailsTotal = validatedReports.reduce((sum, r) => 
        sum + (r.mails?.demandesSouscription || 0) + (r.mails?.questionsDiverses || 0) + (r.mails?.mailsTraites || 0) + (r.mails?.dossiersEnAttenteRegularisation || 0), 0);

    // Construire le détail par agent
    const agents = validatedReports.map(r => ({
        nom: r.submittedByName || 'Inconnu',
        demandes: r.mails?.demandesSouscription || 0,
        questions: r.mails?.questionsDiverses || 0,
        mailsTraites: r.mails?.mailsTraites || 0,
        attente: r.mails?.dossiersEnAttenteRegularisation || 0,
        assignes: r.dossiers?.assignes || 0,
        enCours: r.dossiers?.enCours || 0,
        saisis: r.dossiers?.saisis || 0,
        observation: r.observations?.trim() || ''
    }));

    return {
        title: 'Support Client - Kinshasa',
        hasData: true,
        ...totals,
        agents,
        defisRencontres: dailyNotes.defisRencontres || '',
        observations: dailyNotes.observations || ''
    };
}

/**
 * Construit les données des rapports individuels
 *
 * @param {Array} reports - Rapports validés de IndividualReport
 * @returns {Array<object>}
 */
function buildIndividualReportsData(reports) {
    const validatedReports = reports.filter(r => r.status === 'validated');
    
    return validatedReports.map(r => ({
        titre: `${r.title} - ${r.submittedByName || 'Inconnu'}`,
        note: 'rapport individuel',
        contenu: [
            r.activitesRealisees ? `Activités réalisées : ${r.activitesRealisees}` : ''
        ].filter(line => line && line.length > 0).join('\n')
    }));
}

/**
 * Construit les données du contrôleur
 *
 * @param {Array} reports - Rapports validés de ControllerReport
 * @returns {object}
 */
function buildControleurData(reports, dailyNotes = {}) {
    const validatedReports = reports.filter(r => r.status === 'validated');
    
    if (validatedReports.length === 0) {
        return {
            title: 'Contrôleur — Kinshasa',
            hasData: false,
            agents: [],
            observationResponsable: dailyNotes.observationsControleur || ''
        };
    }

    const agents = validatedReports.map(r => {
        // Construire l'observation de l'agent pour la colonne du rapport Word
        const observationParts = [];
        
        if (r.dataEntryPersons && r.dataEntryPersons.length > 0) {
            const persons = r.dataEntryPersons.map(p => `${p.nom} (${p.zone})`).join(', ');
            observationParts.push(`Saisisseurs / zones : ${persons}`);
        }
        
        if (r.frequentErrors && r.frequentErrors.length > 0) {
            const errors = r.frequentErrors.map(e => {
                const category = e.category === 'autre' && e.customCategory ? e.customCategory : e.category;
                const dossiers = e.dossiers && e.dossiers.length > 0 ? ` (${e.dossiers.join(', ')})` : '';
                return `${category}${dossiers}`;
            }).join(', ');
            observationParts.push(`Erreurs fréquentes : ${errors}`);
        }
        
        if (r.observations && r.observations.trim()) {
            observationParts.push(r.observations.trim());
        }

        const observation = observationParts.join('\n');

        return {
            nom: r.submittedByName || 'Inconnu',
            assignes: r.dossiersAssignes || 0,
            controles: r.dossiersControles || 0,
            enAttente: r.dossiersEnAttente || 0,
            etaAnterieure: 0, // Pas de champ correspondant dans le modèle
            sansDeclaration: 0, // Pas de champ correspondant dans le modèle
            sansPieces: 0, // Pas de champ correspondant dans le modèle
            valides: r.dossiersControles || 0, // Utiliser contrôlés comme validés
            observation
        };
    });

    return {
        title: 'Contrôleur — Kinshasa',
        hasData: true,
        agents,
        observationResponsable: dailyNotes.observationsControleur || ''
    };
}

/**
 * Construit les données des opérateurs de saisie
 *
 * @param {Array} reports - Rapports validés de DataEntryOperatorReport
 * @returns {object}
 */
function buildOperateurData(reports) {
    const validatedReports = reports.filter(r => r.status === 'validated');
    
    if (validatedReports.length === 0) {
        return {
            title: 'Opérateurs de Saisie - Kinshasa',
            hasData: false,
            agents: []
        };
    }

    // Calculer les totaux
    const totals = validatedReports.reduce((acc, r) => ({
        dossiersRecus: acc.dossiersRecus + (r.dossiersRecus || 0),
        dossiersTraites: acc.dossiersTraites + (r.dossiersTraites || 0),
        dossiersRestants: acc.dossiersRestants + (r.dossiersRestants || 0)
    }), { dossiersRecus: 0, dossiersTraites: 0, dossiersRestants: 0 });

    // Construire le détail par agent
    const agents = validatedReports.map(r => ({
        nom: r.submittedByName || 'Inconnu',
        recus: r.dossiersRecus || 0,
        traites: r.dossiersTraites || 0,
        restants: r.dossiersRestants || 0,
        observation: r.observations?.trim() || ''
    }));

    // Concaténer les observations
    const observationsList = validatedReports
        .map(r => r.observations?.trim())
        .filter(text => text && text.length > 0);
    const observations = observationsList.length > 0 ? observationsList.join('; ') : '';

    return {
        title: 'Opérateurs de Saisie - Kinshasa',
        hasData: true,
        ...totals,
        agents,
        observations
    };
}

/**
 * Construit l'objet de données complet pour le rapport unifié d'une date donnée
 *
 * @param {string} date - Date au format YYYY-MM-DD (optionnel, défaut aujourd'hui)
 * @returns {Promise<object>} Données structurées pour generateUnifiedReport
 */
export async function buildReportDataForDate(date) {
    const range = getReportDateRange(date);
    
    // Récupérer tous les rapports validés de la date
    const [supportReports, individualReports, controllerReports, operatorReports, dailyNotes] = await Promise.all([
        findReportsForDate(SupportClientReport, range),
        findReportsForDate(IndividualReport, range),
        findReportsForDate(ControllerReport, range),
        findReportsForDate(DataEntryOperatorReport, range),
        DailyReportNotes.findOne({ reportDate: range.date })
    ]);

    return {
        dateLabel: formatDateInFrench(range.date),
        introduction: dailyNotes?.introduction || '',
        problemesTechniques: dailyNotes?.problemesTechniques || '',
        supportClient: buildSupportClientData(supportReports, dailyNotes || {}),
        rapportsIndividuels: buildIndividualReportsData(individualReports),
        controleur: buildControleurData(controllerReports, dailyNotes || {}),
        operateurSaisie: buildOperateurData(operatorReports)
    };
}

export default buildReportDataForDate;
