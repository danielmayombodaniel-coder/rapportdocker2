import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authenticates a request using Authorization: Bearer <token>.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
        ? authorization.slice(7).trim()
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Token d’authentification requis' });
    }

    try {
        const payload = verifyAccessToken(token);
        if (!payload.userId || !payload.profile) {
            return res.status(401).json({ message: 'Token d’authentification invalide' });
        }

        req.user = {
            userId: payload.userId,
            profile: payload.profile,
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token d’authentification invalide ou expiré' });
    }
};
