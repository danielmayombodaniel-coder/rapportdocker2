import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET est absent des variables d'environnement");
    }

    return process.env.JWT_SECRET;
};

/**
 * Ensures JWT signing can be used before the server starts accepting requests.
 *
 * @returns {void}
 */
export const assertJwtSecret = () => {
    getJwtSecret();
};

/**
 * Creates the access token returned after authentication.
 *
 * @param {{ userId: string, profile: string }} payload
 * @returns {string}
 */
export const createAccessToken = (payload) => jwt.sign(
    payload,
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

/**
 * Verifies an access token using the configured secret.
 *
 * @param {string} token
 * @returns {import('jsonwebtoken').JwtPayload}
 */
export const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());
