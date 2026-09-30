import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import supportClientRoutes from './routes/supportClientRoutes.js';
import controllerRoutes from './routes/controllerRoutes.js';
import dataEntryRoutes from './routes/dataEntryRoutes.js';
import individualReportRoutes from './routes/individualReportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import unifiedReportRoutes from './routes/unifiedReportRoutes.js';

const app = express();
app.use(helmet());

// Configuration CORS
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL,'https://rapportd.onrender.com', 'http://localhost:5173', 'http://localhost:3000']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(cookieParser());
app.use('/static', express.static(path.join(process.cwd(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/support-client', supportClientRoutes);
app.use('/api/controleur', controllerRoutes);
app.use('/api/operateur-saisie', dataEntryRoutes);
app.use('/api/rapport-individuel', individualReportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rapport-unifie', unifiedReportRoutes);

// Route de santé pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API ReportFlow fonctionnelle'
  });
});

app.get('/', (req, res) => {  
  res.send('Bienvenue sur ReportFlow API !');
});

// Export de l'application Express
export default app;
  