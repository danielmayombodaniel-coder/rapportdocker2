import IndividualReport from '../models/IndividualReport.js';
import { individualReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';
import { getTodayReportDate } from '../services/reportDateUtils.js';
import logger from '../utils/logger.js';

const EDITABLE_STATUSES = ['draft', 'needs_correction'];
const FINAL_STATUSES = ['submitted', 'validated'];

const resolveIdentity = async (req, requestedName) => {
    const User = (await import('../models/User.js')).default;
    if (req.user) {
        const user = await User.findById(req.user.userId);
        if (!user) {
            const error = new Error('Utilisateur authentifie introuvable');
            error.status = 401;
            throw error;
        }

        return {
            filter: { submittedBy: user._id },
            submittedBy: user._id,
            submittedByName: `${user.nom} ${user.prenom}`.trim(),
        };
    }

    const submittedByName = typeof requestedName === 'string' ? requestedName.trim() : '';
    if (!submittedByName) {
        const error = new Error('Le parametre nom est requis pour un invite');
        error.status = 400;
        throw error;
    }

    return {
        filter: { submittedBy: { $exists: false }, submittedByName },
        submittedByName,
    };
};

const findTodayReport = (Model, identity) => Model.findOne({
    ...identity.filter,
    reportDate: getTodayReportDate(),
});

const validateMeaningfulReport = (report, meaningfulFields) => meaningfulFields.some((field) => {
    const value = report[field];
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return value > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value && Object.values(value).some((item) => item > 0 || (typeof item === 'string' && item.trim()));
});

const controller = createReportController({
    Model: IndividualReport,
    schema: individualReportSchema,
    empty: {
        title: '',
        activitesRealisees: '',
    },
    meaningfulFields: ['title', 'activitesRealisees'],
    allowedProfiles: ['rapport_individuel'],
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;

// Version personnalisee pour les rapports individuels : validation automatique apres soumission
export const submitToday = async (req, res) => {
    try {
        const identity = await resolveIdentity(req, req.body?.submittedByName || req.query.nom);
        const report = await findTodayReport(IndividualReport, identity);

        if (!report) {
            return res.status(400).json({ message: 'Aucun brouillon a soumettre pour aujourd\'hui' });
        }
        if (FINAL_STATUSES.includes(report.status)) {
            return res.status(400).json({ message: 'Ce rapport a deja ete soumis ou valide' });
        }
        
        const meaningfulFields = ['title', 'activitesRealisees'];
        if (!validateMeaningfulReport(report, meaningfulFields)) {
            return res.status(400).json({ message: 'Le rapport ne peut pas etre soumis car il est vide' });
        }

        // Pour les rapports individuels, validation automatique apres soumission
        report.status = 'validated';
        report.submittedAt = new Date();
        report.validatedAt = new Date();
        if (req.user?.userId) report.validatedBy = req.user.userId;
        
        await report.save();
        logger.info({ reportId: report._id, submittedByName: identity.submittedByName }, 'Rapport individuel valide automatiquement apres soumission');
        
        return res.status(200).json({ report });
    } catch (error) {
        logger.error({ error: error.message }, 'Erreur lors de la soumission du rapport individuel');
        return res.status(error.status || 500).json({ message: error.message });
    }
};