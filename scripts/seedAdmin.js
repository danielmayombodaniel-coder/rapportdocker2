import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { createUser } from '../services/userService.js';

dotenv.config();

const requiredVariables = ['ADMIN_IDENTIFIER', 'ADMIN_PASSWORD'];

/**
 * Creates the first administrator when none exists.
 *
 * @returns {Promise<void>}
 */
const seedAdmin = async () => {
    const configuredIdentifier = (process.env.ADMIN_IDENTIFIER ?? process.env.ADMIN_TELEPHONE ?? '').trim();
    const configuredPassword = (process.env.ADMIN_PASSWORD ?? '').trim();

    if (!configuredIdentifier || !configuredPassword) {
        throw new Error('Variables manquantes : ADMIN_IDENTIFIER et ADMIN_PASSWORD. Ajoutez-les dans le .env du backend avant d\'exécuter npm run seed:admin.');
    }

    await connectDB();
    const existingConfiguredUser = await User.findOne({ telephone: configuredIdentifier }).select('+passwordHash');

    if (existingConfiguredUser) {
        existingConfiguredUser.profile = 'admin';
        existingConfiguredUser.status = 'active';
        existingConfiguredUser.passwordHash = await bcrypt.hash(configuredPassword, 12);
        await existingConfiguredUser.save();
        console.log(`Le compte ${configuredIdentifier} est maintenant administrateur.`);
        return;
    }

    const admin = await createUser({
        nom: 'Administrateur',
        prenom: 'Principal',
        telephone: configuredIdentifier,
        password: configuredPassword,
        profile: 'admin',
    });
    console.log(`Compte admin créé pour l'identifiant ${admin.telephone}.`);
};

try {
    await seedAdmin();
} catch (error) {
    console.error(`Seed admin impossible : ${error.message}`);
    process.exitCode = 1;
} finally {
    await mongoose.connection.close();
}
