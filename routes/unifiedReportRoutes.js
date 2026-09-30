import express from 'express';
import { generateServiceReportForDate, generateUnifiedPdfForDate, generateUnifiedReportForDate, getUnifiedReportData } from '../controllers/unifiedReportController.js';
import { getDailyReportNotes, updateDailyReportNotes } from '../controllers/dailyReportNotesController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

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
