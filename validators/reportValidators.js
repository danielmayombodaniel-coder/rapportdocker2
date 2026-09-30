import { z } from 'zod';
import { ERROR_CATEGORIES } from '../utils/errorCategories.js';

const optionalText = z.string().trim().nullable().optional().transform((value) => value ?? '');
const nonNegativeNumber = z.coerce.number().finite().min(0, 'La valeur doit être supérieure ou égale à 0').optional().default(0);
const submittedByName = z.string().trim().optional().transform((value) => value ?? '');

const frequentErrorCategory = z.string().transform((val) => val === 'Autre' ? 'autre' : val).pipe(z.enum(ERROR_CATEGORIES));

const frequentError = z.object({
    category: frequentErrorCategory,
    customCategory: optionalText,
    dossiers: z.array(z.string().trim()).default([]),
}).superRefine((value, context) => {
    if (value.category === 'autre' && !value.customCategory) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['customCategory'], message: 'Précisez la catégorie autre' });
    }
});

export const supportClientReportSchema = z.object({
    submittedByName,
    mails: z.object({
        demandesSouscription: nonNegativeNumber,
        questionsDiverses: nonNegativeNumber,
        mailsTraites: nonNegativeNumber,
        dossiersEnAttenteRegularisation: nonNegativeNumber,
    }).optional(),
    dossiers: z.object({
        assignes: nonNegativeNumber,
        enCours: nonNegativeNumber,
        saisis: nonNegativeNumber,
    }).optional(),
    observations: optionalText,
});

export const controllerReportSchema = z.object({
    submittedByName,
    dossiersAssignes: nonNegativeNumber,
    dossiersControles: nonNegativeNumber,
    dossiersEnAttente: nonNegativeNumber,
    observations: optionalText,
    dataEntryPersons: z.array(z.object({
        nom: z.string().trim(),
        zone: z.string().trim(),
    })).optional().default([]),
    frequentErrors: z.array(frequentError).optional().default([]),
});

export const dataEntryOperatorReportSchema = z.object({
    submittedByName,
    dossiersRecus: nonNegativeNumber,
    dossiersTraites: nonNegativeNumber,
    dossiersRestants: nonNegativeNumber,
    observations: optionalText,
});

export const individualReportSchema = z.object({
    submittedByName,
    title: z.string().trim().min(1, 'Le titre ne peut pas etre vide'),
    activitesRealisees: optionalText,
});
