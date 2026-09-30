import User from '../models/User.js';
import { getTodayReportDate } from './reportDateUtils.js';
import { isAutoValidationEnabled } from './autoValidationService.js';
import logger from '../utils/logger.js';

const EDITABLE_STATUSES = ['draft', 'needs_correction'];
const FINAL_STATUSES = ['submitted', 'validated'];

const sendValidationError = (error, res) => {
    if (error?.name !== 'ZodError') return false;

    logger.warn({ issues: error.issues }, 'Validation Zod échouée');
    res.status(400).json({
        message: 'Les données du rapport sont invalides',
        errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        })),
    });
    return true;
};

const userDisplayName = (user) => `${user.nom} ${user.prenom}`.trim();

/**
 * Builds the identity and query used for a connected user or a guest.
 *
 * @param {import('express').Request} req
 * @param {string|undefined} requestedName
 * @returns {Promise<{filter: object, submittedBy?: object, submittedByName: string}>}
 */
const resolveIdentity = async (req, requestedName) => {
    if (req.user) {
        const user = await User.findById(req.user.userId);
        if (!user) {
            const error = new Error('Utilisateur authentifié introuvable');
            error.status = 401;
            throw error;
        }

        return {
            filter: { submittedBy: user._id },
            submittedBy: user._id,
            submittedByName: userDisplayName(user),
        };
    }

    const submittedByName = typeof requestedName === 'string' ? requestedName.trim() : '';
    if (!submittedByName) {
        const error = new Error('Le paramètre nom est requis pour un invité');
        error.status = 400;
        throw error;
    }

    // Limitation connue : deux invités portant le même nom le même jour partagent cette clé.
    return {
        filter: { submittedBy: { $exists: false }, submittedByName },
        submittedByName,
    };
};

const findTodayReport = (Model, identity) => Model.findOne({
    ...identity.filter,
    reportDate: getTodayReportDate(),
});

const validateMeaningfulReport = (report, meaningfulFields) => {
    // Toujours permettre la soumission - même les rapports vides sont acceptés
    return true;
};

const defaultReport = (base, identity) => ({
    ...base,
    submittedByName: identity.submittedByName,
    reportDate: getTodayReportDate(),
    status: 'draft',
});

/**
 * Creates the agent report handlers for one report model.
 *
 * @param {{Model: import('mongoose').Model, schema: import('zod').ZodType, empty: object, meaningfulFields: string[], allowedProfiles: string[]}} options
 * @returns {{getToday: Function, updateToday: Function, submitToday: Function}}
 */
export const createReportController = ({ Model, schema, empty, meaningfulFields, allowedProfiles, service }) => ({
    getToday: async (req, res) => {
        try {
            if (req.user && !allowedProfiles.includes(req.user.profile)) {
                return res.status(403).json({ message: 'Ce profil ne peut pas accéder à ce service' });
            }
            const identity = await resolveIdentity(req, req.query.nom);
            const report = await findTodayReport(Model, identity);
            return res.status(200).json({ report: report || defaultReport(empty, identity) });
        } catch (error) {
            return res.status(error.status || 500).json({ message: error.message });
        }
    },

    updateToday: async (req, res) => {
        try {
            if (req.user && !allowedProfiles.includes(req.user.profile)) {
                return res.status(403).json({ message: 'Ce profil ne peut pas accéder à ce service' });
            }
            const data = schema.parse(req.body);
            const identity = await resolveIdentity(req, data.submittedByName);
            const report = await findTodayReport(Model, identity);

            if (report && !EDITABLE_STATUSES.includes(report.status)) {
                return res.status(403).json({ message: 'Ce rapport ne peut plus être modifié après soumission' });
            }

            const values = { ...data };
            delete values.submittedByName;
            if (report) {
                report.set({ ...values, submittedByName: identity.submittedByName, correction: null, status: report.status === 'needs_correction' ? 'draft' : report.status });
                await report.save();
            } else {
                await Model.create({ ...values, ...identity, reportDate: getTodayReportDate(), status: 'draft' });
            }

            const savedReport = await findTodayReport(Model, identity);
            return res.status(200).json({ report: savedReport });
        } catch (error) {
            if (sendValidationError(error, res)) return;
            if (error.code === 11000) return res.status(409).json({ message: 'Un rapport existe déjà pour cette journée' });
            return res.status(error.status || 500).json({ message: error.message });
        }
    },

    submitToday: async (req, res) => {
        try {
            if (req.user && !allowedProfiles.includes(req.user.profile)) {
                return res.status(403).json({ message: 'Ce profil ne peut pas accéder à ce service' });
            }
            const identity = await resolveIdentity(req, req.body?.submittedByName || req.query.nom);
            const report = await findTodayReport(Model, identity);

            if (!report) {
                return res.status(400).json({ message: 'Aucun brouillon à soumettre pour aujourd’hui' });
            }
            if (FINAL_STATUSES.includes(report.status)) {
                return res.status(400).json({ message: 'Ce rapport a déjà été soumis ou validé' });
            }
            if (!validateMeaningfulReport(report, meaningfulFields)) {
                return res.status(400).json({ message: 'Le rapport ne peut pas être soumis car il est vide' });
            }

            report.status = 'submitted';
            report.submittedAt = new Date();
            if (service && await isAutoValidationEnabled(service)) {
                report.status = 'validated';
                report.validatedAt = new Date();
                if (req.user?.userId) report.validatedBy = req.user.userId;
            }
            await report.save();
            return res.status(200).json({ report });
        } catch (error) {
            return res.status(error.status || 500).json({ message: error.message });
        }
    },
});
