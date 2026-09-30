// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB connecté');
//   } catch (error) {
//     console.error('Erreur de connexion MongoDB:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Charger le fichier .env depuis le dossier courant (ReportflowBack/)
dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    logger.error('MONGO_URI non défini dans les variables d\'environnement');
    process.exit(1);
}
 
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB connecté avec succès');
    } catch (err) {
        logger.error({ err }, 'Erreur de connexion à MongoDB');
        process.exit(1);
    }
};

export default connectDB;