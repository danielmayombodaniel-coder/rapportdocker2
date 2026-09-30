import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Attaches authenticated user data when a valid Bearer token is present.
 * Missing or invalid optional credentials leave the request unauthenticated.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const optionalAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
        ? authorization.slice(7).trim()
        : null;

    if (token) {
        try {
            const payload = verifyAccessToken(token);
            if (payload.userId && payload.profile) {
                req.user = { userId: payload.userId, profile: payload.profile };
            }
        } catch (error) {
            // Optional authentication must not block guest report workflows.
        }
    }

    return next();
};
