import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';
import { assertJwtSecret } from './utils/jwt.js';

// Charger le fichier .env depuis le dossier courant (ReportflowBack/)
dotenv.config();

// Port du serveur
const PORT = process.env.PORT || 5000;

/**
 * Fonction pour démarrer le serveur
 */
const startServer = async () => {
    try {
        assertJwtSecret();
        // Connexion à MongoDB
        await connectDB();
        
        // Démarrer le serveur Express
        app.listen(PORT, () => {
            logger.info({ port: PORT }, `Serveur ReportFlow démarré sur le port ${PORT}`);
            logger.info(`Health check disponible sur: http://localhost:${PORT}/api/health`);
        });
        
    } catch (error) {
        logger.error({ error }, 'Erreur lors du démarrage du serveur');
        process.exit(1);
    }
};

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Exception non capturée');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Rejet non géré');
    process.exit(1);
});

// Démarrer le serveur
startServer();