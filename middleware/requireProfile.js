/**
 * Restricts a route to the requested profiles and always allows administrators.
 *
 * @param {...string} profiles
 * @returns {import('express').RequestHandler}
 */
export const requireProfile = (...profiles) => (req, res, next) => {
    const allowedProfiles = new Set([...profiles, 'admin']);

    if (!req.user || !allowedProfiles.has(req.user.profile)) {
        return res.status(403).json({ message: 'Ce profil ne peut pas accéder à cette ressource' });
    }

    return next();
};
