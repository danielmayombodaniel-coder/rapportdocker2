import mongoose from 'mongoose';
import { z } from 'zod';
import {
    countReportStatuses,
    findReportsForDate,
    getReportDateRange,
    sumValidatedFields,
} from './reportAggregation.js';

const correctionSchema = z.object({
    reason: z.string().trim().min(1, 'La raison de correction est obligatoire'),
}).strict();

const sendError = (res, error) => res.status(error.status || 500).json({ message: error.message });

/**
 * Creates the common responsible workflow for one report model.
 *
 * @param {{Model: import('mongoose').Model, summary: Function, totals: Record<string, string>, extraStats?: Function}} options
 * @returns {object}
 */
export const createResponsableController = ({ Model, summary, totals, extraStats }) => ({
    list: async (req, res) => {
        try {
            const range = getReportDateRange(req.query.date);
            const reports = await findReportsForDate(Model, range);
            reports.sort((first, second) => {
                const firstSubmittedAt = first.submittedAt ? new Date(first.submittedAt).getTime() : 0;
                const secondSubmittedAt = second.submittedAt ? new Date(second.submittedAt).getTime() : 0;
                return secondSubmittedAt - firstSubmittedAt || new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
            });
            return res.status(200).json({
                date: range.date,
                reports: reports.map((report) => ({
                    id: report.id,
                    submittedByName: report.submittedByName,
                    status: report.status,
                    reportDate: report.reportDate,
                    submittedAt: report.submittedAt,
                    summary: summary(report),
                })),
            });
        } catch (error) {
            return sendError(res, error);
        }
    },

    detail: async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Rapport introuvable' });
        }

        try {
            const report = await Model.findById(req.params.id);
            if (!report) return res.status(404).json({ message: 'Rapport introuvable' });
            return res.status(200).json({ report });
        } catch (error) {
            return sendError(res, error);
        }
    },

    validate: async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Rapport introuvable' });
        }

        try {
            const report = await Model.findById(req.params.id);
            if (!report) return res.status(404).json({ message: 'Rapport introuvable' });
            if (report.status !== 'submitted') {
                return res.status(400).json({ message: 'Seul un rapport soumis peut être validé' });
            }

            report.status = 'validated';
            if (req.user?.userId) report.validatedBy = req.user.userId;
            report.validatedAt = new Date();
            await report.save();
            return res.status(200).json({ report });
        } catch (error) {
            return sendError(res, error);
        }
    },

    requestCorrection: async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Rapport introuvable' });
        }

        try {
            const { reason } = correctionSchema.parse(req.body);
            const report = await Model.findById(req.params.id);
            if (!report) return res.status(404).json({ message: 'Rapport introuvable' });
            if (report.status !== 'submitted') {
                return res.status(400).json({ message: 'Seul un rapport soumis peut faire l’objet d’une correction' });
            }

            report.status = 'needs_correction';
            report.correction = {
                ...(req.user?.userId ? { requestedBy: req.user.userId } : {}),
                reason,
                requestedAt: new Date(),
            };
            await report.save();
            return res.status(200).json({ report });
        } catch (error) {
            if (error?.name === 'ZodError') {
                return res.status(400).json({
                    message: 'La raison de correction est obligatoire',
                    errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
                });
            }
            return sendError(res, error);
        }
    },

    update: async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Rapport introuvable' });
        }

        try {
            const report = await Model.findById(req.params.id);
            if (!report) return res.status(404).json({ message: 'Rapport introuvable' });

            // Les responsables peuvent modifier n'importe quel rapport de leur service
            // Quel que soit son statut (draft, submitted, needs_correction, validated)
            
            // Mettre à jour tous les champs du rapport avec les données reçues
            // On exclut les champs protégés qui ne doivent pas être modifiés directement
            const protectedFields = ['_id', 'id', '__v', 'createdAt', 'updatedAt', 'submittedBy', 'submittedAt'];
            const updateData = { ...req.body };
            
            // Supprimer les champs protégés
            protectedFields.forEach(field => {
                delete updateData[field];
            });

            // Appliquer les modifications
            Object.assign(report, updateData);
            
            // Si le rapport était en "needs_correction" et qu'on le modifie,
            // on le remet en "submitted" pour indiquer qu'il est prêt à être revalidé
            if (report.status === 'needs_correction') {
                report.status = 'submitted';
                report.correction = undefined; // Supprimer la demande de correction
            }

            // Enregistrer les modifications
            await report.save();
            
            return res.status(200).json({ 
                message: 'Rapport modifié avec succès',
                report 
            });
        } catch (error) {
            return sendError(res, error);
        }
    },

    statistics: async (req, res) => {
        try {
            const range = getReportDateRange(req.query.date);
            const reports = await findReportsForDate(Model, range);
            const stats = {
                date: range.date,
                counts: countReportStatuses(reports),
                totals: sumValidatedFields(reports, totals),
            };
            if (extraStats) Object.assign(stats, extraStats(reports));
            return res.status(200).json(stats);
        } catch (error) {
            return sendError(res, error);
        }
    },
});
