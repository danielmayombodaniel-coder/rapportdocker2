import express from 'express';
import { generateServiceReportForDate, generateUnifiedPdfForDate, generateUnifiedReportForDate, getUnifiedReportData } from '../controllers/unifiedReportController.js';
import { getDailyReportNotes, updateDailyReportNotes } from '../controllers/dailyReportNotesController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();
const activeVisitors = new Map();
const PRESENCE_TTL_MS = 45_000;

const getActiveVisitorCount = () => {
	const now = Date.now();
	for (const [visitorId, lastSeen] of activeVisitors) {
		if (now - lastSeen > PRESENCE_TTL_MS) activeVisitors.delete(visitorId);
	}
	return activeVisitors.size;
};

router.get('/presence', (_req, res) => {
	res.json({ activeVisitors: getActiveVisitorCount() });
});

router.post('/presence', (req, res) => {
	const { visitorId } = req.body || {};
	if (typeof visitorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) {
		return res.status(400).json({ message: 'Identifiant de présence invalide.' });
	}

	activeVisitors.set(visitorId, Date.now());
	return res.json({ activeVisitors: getActiveVisitorCount() });
});

/**
 * Route PUBLIQUE pour générer et télécharger le rapport unifié
 * POST /api/rapport-unifie?date=YYYY-MM-DD
 * 
 * Cette route est accessible sans authentification
 * Si la date n'est pas fournie, utilise aujourd'hui par défaut
 * Accepte un corps JSON avec reportVisibility pour filtrer les rapports individuels
 */
router.post('/', generateUnifiedReportForDate);
router.post('/pdf', generateUnifiedPdfForDate);
router.post('/service', generateServiceReportForDate);

/**
 * Route PUBLIQUE pour récupérer les données JSON du rapport unifié
 * GET /api/rapport-unifie/data?date=YYYY-MM-DD
 * 
 * Cette route est accessible sans authentification
 * Retourne les données structurées pour affichage dans l'interface
 */
router.get('/data', getUnifiedReportData);

router.get('/notes', optionalAuth, getDailyReportNotes);
router.put('/notes', optionalAuth, updateDailyReportNotes);

export default router;
