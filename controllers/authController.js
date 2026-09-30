import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createAccessToken } from '../utils/jwt.js';
import { loginSchema, registerSchema } from '../validators/authValidators.js';
import { createUser } from '../services/userService.js';

const formatUser = (user) => {
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.passwordHash;
    return userObject;
};

const validationErrorResponse = (error, res) => {
    if (error?.name !== 'ZodError') {
        return false;
    }

    return res.status(400).json({
        message: 'Les données envoyées sont invalides',
        errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        })),
    });
};

/**
 * Creates a public user account and returns an access token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const register = async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await createUser(data);

        return res.status(201).json({
            user: formatUser(user),
            token: createAccessToken({ userId: user.id, profile: user.profile }),
        });
    } catch (error) {
        if (validationErrorResponse(error, res)) return;
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }
        if (error?.status === 409) {
            return res.status(409).json({ message: error.message });
        }
        throw error;
    }
};

/**
 * Authenticates a user by phone number and password.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await User.findOne({ telephone: data.telephone }).select('+passwordHash');
        const isPasswordValid = user && user.status === 'active'
            ? await bcrypt.compare(data.password, user.passwordHash)
            : false;

        if (!isPasswordValid || (data.profile && user.profile !== data.profile)) {
            return res.status(401).json({ message: 'Numéro de téléphone ou mot de passe incorrect' });
        }

        return res.status(200).json({
            user: formatUser(user),
            token: createAccessToken({ userId: user.id, profile: user.profile }),
        });
    } catch (error) {
        if (validationErrorResponse(error, res)) return;
        throw error;
    }
};

/**
 * Returns the authenticated user's current profile.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const me = async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (!user || user.status !== 'active') {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    return res.status(200).json({ user: formatUser(user) });
};
