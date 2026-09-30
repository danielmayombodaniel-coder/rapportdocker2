import { Router } from 'express';
import {
	detail,
	list,
	requestCorrection,
	statistics,
	update,
	validate,
} from '../controllers/controllerResponsableController.js';
import { getToday, submitToday, updateToday } from '../controllers/controllerAgentController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
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
router.post('/responsable/rapports/:id/valider', ...responsableMiddleware, validate);
router.post('/responsable/rapports/:id/demander-correction', ...responsableMiddleware, requestCorrection);
router.get('/responsable/statistiques', ...responsableMiddleware, statistics);
router.get('/responsable/auto-validation', optionalAuth, getSettingFor('controleur'));
router.put('/responsable/auto-validation', optionalAuth, updateSettingFor('controleur'));

export default router;
