import { Router } from 'express';
import { getToday, submitToday, updateToday } from '../controllers/individualReportController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();
const reportPath = '/rapport-du-jour';

router.get(reportPath, optionalAuth, getToday);
router.put(reportPath, optionalAuth, updateToday);
router.post(`${reportPath}/soumettre`, optionalAuth, submitToday);

export default router;
