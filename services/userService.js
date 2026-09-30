import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { passwordSchema, userCreationSchema } from '../validators/authValidators.js';

/**
 * Creates a user after applying the shared phone and PIN rules.
 *
 * @param {object} input
 * @returns {Promise<import('../models/User.js').default>}
 */
export const createUser = async (input) => {
    const data = userCreationSchema.parse(input);
    const passwordHash = await bcrypt.hash(data.password, 12);

    try {
        return await User.create({
            nom: data.nom,
            prenom: data.prenom,
            telephone: data.telephone,
            passwordHash,
            profile: data.profile,
        });
    } catch (error) {
        if (error?.code === 11000) {
            const conflict = new Error('Ce numéro de téléphone est déjà utilisé');
            conflict.status = 409;
            throw conflict;
        }
        throw error;
    }
};

/**
 * Replaces a user's password with a bcrypt hash.
 *
 * @param {import('mongoose').Document} user
 * @param {string} newPassword
 * @returns {Promise<import('mongoose').Document>}
 */
export const resetUserPassword = async (user, newPassword) => {
    const password = passwordSchema.parse(newPassword);
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    return user;
};

/**
 * Removes sensitive fields before an API response.
 *
 * @param {object} user
 * @returns {object}
 */
export const sanitizeUser = (user) => {
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.passwordHash;
    return userObject;
};
