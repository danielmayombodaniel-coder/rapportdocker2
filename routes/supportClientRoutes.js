import { Router } from 'express';
import {
	detail,
	list,
	remove,
	requestCorrection,
	statistics,
	update,
	validate,
} from '../controllers/supportClientResponsableController.js';
import { getToday, submitToday, updateToday } from '../controllers/supportClientAgentController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { authenticate } from '../middleware/auth.js';
import { requireProfile } from '../middleware/requireProfile.js';
import { getSettingFor, updateSettingFor } from '../controllers/autoValidationController.js';

const router = Router();
const reportPath = '/agent/rapport-du-jour';
const responsableMiddleware = [];

router.get(reportPath, optionalAuth, getToday);
router.put(reportPath, optionalAuth, updateToday);
router.post(`${reportPath}/soumettre`, optionalAuth, submitToday);

router.get('/responsable/rapports', ...responsableMiddleware, list);
router.get('/responsable/rapports/:id', ...responsableMiddleware, detail);
router.put('/responsable/rapports/:id/modifier', ...responsableMiddleware, update);
router.delete('/responsable/rapports/:id', authenticate, requireProfile('admin'), remove);
router.post('/responsable/rapports/:id/valider', ...responsableMiddleware, validate);
router.post('/responsable/rapports/:id/demander-correction', ...responsableMiddleware, requestCorrection);
router.get('/responsable/statistiques', ...responsableMiddleware, statistics);
router.get('/responsable/auto-validation', optionalAuth, getSettingFor('support-client'));
router.put('/responsable/auto-validation', optionalAuth, updateSettingFor('support-client'));

export default router;
