import { z } from 'zod';
import { isValidPhone, normalizePhone } from '../utils/phone.js';
import { PROFILES, PUBLIC_PROFILES } from '../utils/profiles.js';

export const phoneSchema = z.preprocess(
    normalizePhone,
    z.string()
        .min(1, 'Le numéro de téléphone est requis')
        .refine(isValidPhone, 'Le numéro de téléphone ne doit contenir que des chiffres')
);

const optionalPhoneSchema = z.preprocess(
    (value) => value === undefined ? undefined : normalizePhone(value),
    z.string()
        .min(1, 'Le numéro de téléphone est requis')
        .refine(isValidPhone, 'Le numéro de téléphone ne doit contenir que des chiffres')
        .optional()
);

// The password policy is centralized so register and login use the same rule.
export const passwordSchema = z.string()
    .length(4, 'Le mot de passe doit contenir exactement 4 chiffres')
    .regex(/^\d{4}$/, 'Le mot de passe doit contenir exactement 4 chiffres');

export const registerSchema = z.object({
    nom: z.string().trim().min(1, 'Le nom est requis'),
    prenom: z.string().trim().min(1, 'Le prénom est requis'),
    telephone: phoneSchema,
    password: passwordSchema,
    profile: z.enum(PUBLIC_PROFILES, {
        error: 'Le profil sélectionné est invalide ou ne peut pas être créé publiquement',
    }),
}).strict();

export const userCreationSchema = z.object({
    nom: z.string().trim().min(1, 'Le nom est requis'),
    prenom: z.string().trim().min(1, 'Le prénom est requis'),
    telephone: phoneSchema,
    password: passwordSchema,
    profile: z.enum(PROFILES, { error: 'Le profil sélectionné est invalide' }),
}).strict();

export const loginSchema = z.object({
    telephone: phoneSchema,
    password: passwordSchema,
    profile: z.enum(PROFILES).optional(),
}).strict();

export const userUpdateSchema = z.object({
    nom: z.string().trim().min(1, 'Le nom est requis').optional(),
    prenom: z.string().trim().min(1, 'Le prénom est requis').optional(),
    telephone: optionalPhoneSchema,
    profile: z.enum(PROFILES, { error: 'Le profil sélectionné est invalide' }).optional(),
    status: z.enum(['active', 'inactive'], { error: 'Le statut sélectionné est invalide' }).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Au moins un champ doit être modifié');

export const passwordResetSchema = z.object({
    newPassword: passwordSchema,
}).strict();
