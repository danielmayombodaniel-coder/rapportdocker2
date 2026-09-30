import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireProfile } from '../middleware/requireProfile.js';
import {
    createAdminUser,
    deleteUser,
    getUser,
    listUsers,
    resetPassword,
    updateUser,
} from '../controllers/adminUsersController.js';
import { getGlobalStatistics } from '../controllers/adminStatsController.js';

const router = Router();
const adminOnly = [authenticate, requireProfile('admin')];

router.use(...adminOnly);
router.get('/utilisateurs', listUsers);
router.get('/utilisateurs/:id', getUser);
router.post('/utilisateurs', createAdminUser);
router.put('/utilisateurs/:id', updateUser);
router.delete('/utilisateurs/:id', deleteUser);
router.post('/utilisateurs/:id/reinitialiser-mot-de-passe', resetPassword);
router.get('/statistiques', getGlobalStatistics);

export default router;
