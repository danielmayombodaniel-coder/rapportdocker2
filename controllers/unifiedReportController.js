import { buildReportDataForDate } from '../services/unifiedReportDataBuilder.js';
import { generateServiceReport, generateUnifiedReport } from '../services/unifiedReportGenerator.js';
import { convertDocxToPdf } from '../services/docxToPdf.js';

/**
 * Recalcule les totaux pour un service après filtrage des agents
 */
function recalculateTotals(data, service) {
    if (!data[service]?.agents || data[service].agents.length === 0) {
        return;
    }

    const agents = data[service].agents;
    
    if (service === 'supportClient') {
        data[service].mailsTotal = agents.reduce((sum, a) => sum + (a.demandes || 0) + (a.questions || 0) + (a.mailsTraites || 0) + (a.attente || 0), 0);
        data[service].demandesSouscription = agents.reduce((sum, a) => sum + (a.demandes || 0), 0);
        data[service].questionsDiverses = agents.reduce((sum, a) => sum + (a.questions || 0), 0);
        data[service].mailsTraites = agents.reduce((sum, a) => sum + (a.mailsTraites || 0), 0);
        data[service].attenteRegularisation = agents.reduce((sum, a) => sum + (a.attente || 0), 0);
        data[service].dossiersAssignesTotal = agents.reduce((sum, a) => sum + (a.assignes || 0), 0);
        data[service].dossiersEnCours = agents.reduce((sum, a) => sum + (a.enCours || 0), 0);
        data[service].dossiersSaisis = agents.reduce((sum, a) => sum + (a.saisis || 0), 0);
    }
    
    if (service === 'operateurSaisie') {
        data[service].dossiersRecus = agents.reduce((sum, a) => sum + (a.recus || 0), 0);
        data[service].dossiersTraites = agents.reduce((sum, a) => sum + (a.traites || 0), 0);
        data[service].dossiersRestants = agents.reduce((sum, a) => sum + (a.restants || 0), 0);
    }
}

/**
 * Génère et télécharge le rapport unifié pour une date donnée
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const buildDocument = async (req) => {
    const { date } = req.query;
    const { visibility } = req.body || {};
    const reportData = await buildReportDataForDate(date);

    if (visibility) {
        if (visibility.supportClient && Array.isArray(visibility.supportClient) && reportData.supportClient.agents) {
            reportData.supportClient.agents = reportData.supportClient.agents.filter((_, index) => visibility.supportClient[index] !== false);
            recalculateTotals(reportData, 'supportClient');
        }
        if (visibility.controleur && Array.isArray(visibility.controleur) && reportData.controleur.agents) {
            reportData.controleur.agents = reportData.controleur.agents.filter((_, index) => visibility.controleur[index] !== false);
        }
        if (visibility.operateurSaisie && Array.isArray(visibility.operateurSaisie) && reportData.operateurSaisie.agents) {
            reportData.operateurSaisie.agents = reportData.operateurSaisie.agents.filter((_, index) => visibility.operateurSaisie[index] !== false);
            recalculateTotals(reportData, 'operateurSaisie');
        }
        if (visibility.rapportsIndividuels && Array.isArray(visibility.rapportsIndividuels) && reportData.rapportsIndividuels) {
            reportData.rapportsIndividuels = reportData.rapportsIndividuels.filter((_, index) => visibility.rapportsIndividuels[index] !== false);
        }
    }

    return {
        date: date || new Date().toISOString().slice(0, 10),
        docxBuffer: await generateUnifiedReport(reportData),
    };
};

export const generateUnifiedReportForDate = async (req, res) => {
    try {
        const { date: dateForFilename, docxBuffer } = await buildDocument(req);
        const filename = `rapport-unifie-${dateForFilename}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(docxBuffer);
    } catch (error) {
        console.error('Erreur lors de la génération du rapport unifié:', error);
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ 
            error: 'Erreur lors de la génération du rapport unifié',
            message: error.message 
        });
    }
};

export const generateServiceReportForDate = async (req, res) => {
    const service = req.query.service;
    const serviceNames = {
        supportClient: 'support-client',
        controleur: 'controleur',
        operateurSaisie: 'operateur-saisie',
    };

    if (!Object.prototype.hasOwnProperty.call(serviceNames, service)) {
        return res.status(400).json({ error: 'Service de rapport invalide.' });
    }

    try {
        const { date } = req.query;
        const reportData = await buildReportDataForDate(date);
        const docxBuffer = await generateServiceReport(reportData, service);
        const filename = `rapport-${serviceNames[service]}-${date || new Date().toISOString().slice(0, 10)}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(docxBuffer);
    } catch (error) {
        console.error('Erreur lors de la génération du rapport de service:', error);
        res.status(error.status || 500).json({ error: error.message || 'Erreur lors de la génération du rapport de service' });
    }
};

export const generateUnifiedPdfForDate = async (req, res) => {
    try {
        const { date, docxBuffer } = await buildDocument(req);
        const pdfBuffer = await convertDocxToPdf(docxBuffer);
        const filename = `rapport-unifie-${date}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erreur lors de la conversion PDF du rapport unifié:', error);
        res.status(error.status || 500).json({ error: error.message || 'Erreur lors de la conversion PDF' });
    }
};

/**
 * Récupère les données JSON du rapport unifié pour une date donnée
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const getUnifiedReportData = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Construire les données pour la date demandée
        const reportData = await buildReportDataForDate(date);
        
        // Retourner les données en JSON
        res.json(reportData);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données du rapport unifié:', error);
        
        // Gérer les erreurs de validation de date
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        
        // Gérer les autres erreurs
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données du rapport unifié',
            message: error.message 
        });
    }
};

export default { generateUnifiedReportForDate, getUnifiedReportData };
