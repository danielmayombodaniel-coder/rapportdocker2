import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { createUser } from '../services/userService.js';

dotenv.config();

const requiredVariables = ['ADMIN_TELEPHONE', 'ADMIN_PASSWORD'];

/**
 * Creates the first administrator when none exists.
 *
 * @returns {Promise<void>}
 */
const seedAdmin = async () => {
    const missing = requiredVariables.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(`Variables manquantes : ${missing.join(', ')}. Ajoutez-les dans ReportflowBack/.env avant d'exécuter npm run seed:admin.`);
    }

    await connectDB();
    const configuredTelephone = process.env.ADMIN_TELEPHONE.replace(/\s/g, '');
    const existingConfiguredUser = await User.findOne({ telephone: configuredTelephone }).select('+passwordHash');

    if (existingConfiguredUser) {
        existingConfiguredUser.profile = 'admin';
        existingConfiguredUser.status = 'active';
        existingConfiguredUser.passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await existingConfiguredUser.save();
        console.log(`Le compte ${configuredTelephone} est maintenant administrateur.`);
        return;
    }

    const admin = await createUser({
        nom: 'Administrateur',
        prenom: 'Principal',
        telephone: process.env.ADMIN_TELEPHONE,
        password: process.env.ADMIN_PASSWORD,
        profile: 'admin',
    });
    console.log(`Compte admin créé pour le numéro ${admin.telephone}.`);
};

try {
    await seedAdmin();
} catch (error) {
    console.error(`Seed admin impossible : ${error.message}`);
    process.exitCode = 1;
} finally {
    await mongoose.connection.close();
}
