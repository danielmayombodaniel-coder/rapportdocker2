import mongoose from 'mongoose';
import User from '../models/User.js';
import SupportClientReport from '../models/SupportClientReport.js';
import ControllerReport from '../models/ControllerReport.js';
import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';
import IndividualReport from '../models/IndividualReport.js';
import {
    passwordResetSchema,
    userCreationSchema,
    userUpdateSchema,
} from '../validators/authValidators.js';
import { createUser, resetUserPassword, sanitizeUser } from '../services/userService.js';
import { PROFILES } from '../utils/profiles.js';

const reportSources = [
    { Model: SupportClientReport, service: 'support-client' },
    { Model: ControllerReport, service: 'controleur' },
    { Model: DataEntryOperatorReport, service: 'operateur-saisie' },
    { Model: IndividualReport, service: 'rapport-individuel' },
];

const sendValidationError = (error, res) => {
    if (error?.name !== 'ZodError') return false;
    res.status(400).json({
        message: 'Les données envoyées sont invalides',
        errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
    return true;
};

const validIdOr404 = (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ message: 'Utilisateur introuvable' });
        return false;
    }
    return true;
};

/**
 * Lists users without exposing password hashes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const listUsers = async (req, res) => {
    const { profile, search } = req.query;
    if (profile && !PROFILES.includes(profile)) {
        return res.status(400).json({ message: 'Le profil demandé est invalide' });
    }

    const filter = {};
    if (profile) filter.profile = profile;
    if (search?.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const expression = new RegExp(escaped, 'i');
        filter.$or = [{ nom: expression }, { prenom: expression }, { telephone: expression }];
    }

    const users = await User.find(filter).sort({ nom: 1, prenom: 1 });
    return res.status(200).json({ users: users.map(sanitizeUser) });
};

/**
 * Returns one user and the latest reports submitted by that user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getUser = async (req, res) => {
    if (!validIdOr404(req.params.id, res)) return;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const histories = await Promise.all(reportSources.map(async ({ Model, service }) => {
        const reports = await Model.find({ submittedBy: user._id })
            .select('reportDate status submittedAt createdAt')
            .sort({ reportDate: -1, createdAt: -1 })
            .limit(10)
            .lean();
        return reports.map((report) => ({
            service,
            reportId: report._id,
            reportDate: report.reportDate,
            status: report.status,
            submittedAt: report.submittedAt,
        }));
    }));

    const history = histories.flat()
        .sort((first, second) => new Date(second.reportDate) - new Date(first.reportDate))
        .slice(0, 10);
    return res.status(200).json({ user: sanitizeUser(user), reportHistory: history });
};

/**
 * Creates an account from the admin area, including another admin account.
 */
export const createAdminUser = async (req, res) => {
    try {
        const data = userCreationSchema.parse(req.body);
        const user = await createUser(data);
        return res.status(201).json({ user: sanitizeUser(user) });
    } catch (error) {
        if (sendValidationError(error, res)) return;
        if (error.status === 409) return res.status(409).json({ message: error.message });
        throw error;
    }
};

/**
 * Updates non-password account fields.
 */
export const updateUser = async (req, res) => {
    if (!validIdOr404(req.params.id, res)) return;
    try {
        const data = userUpdateSchema.parse(req.body);
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        if (data.telephone && data.telephone !== user.telephone) {
            const duplicate = await User.findOne({ telephone: data.telephone, _id: { $ne: user._id } });
            if (duplicate) return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }

        Object.assign(user, data);
        await user.save();
        return res.status(200).json({ user: sanitizeUser(user) });
    } catch (error) {
        if (sendValidationError(error, res)) return;
        if (error?.code === 11000) return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        throw error;
    }
};

/**
 * Deletes an account, except for the currently authenticated admin.
 */
export const deleteUser = async (req, res) => {
    if (!validIdOr404(req.params.id, res)) return;
    if (req.params.id === req.user.userId) {
        return res.status(400).json({ message: 'Un administrateur ne peut pas supprimer son propre compte' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.status(200).json({ message: 'Utilisateur supprimé', user: sanitizeUser(user) });
};

/**
 * Resets an account password without returning the clear-text value.
 */
export const resetPassword = async (req, res) => {
    if (!validIdOr404(req.params.id, res)) return;
    try {
        const { newPassword } = passwordResetSchema.parse(req.body);
        const user = await User.findById(req.params.id).select('+passwordHash');
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
        await resetUserPassword(user, newPassword);
        return res.status(200).json({ message: 'Mot de passe réinitialisé', user: sanitizeUser(user) });
    } catch (error) {
        if (sendValidationError(error, res)) return;
        throw error;
    }
};
