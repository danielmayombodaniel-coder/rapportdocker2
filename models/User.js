import mongoose from 'mongoose';
import { PROFILES } from '../utils/profiles.js';

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
    },
    telephone: {
        type: String,
        required: [true, 'Le numéro de téléphone est requis'],
        unique: true,
        index: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        select: false,
    },
    profile: {
        type: String,
        enum: PROFILES,
        required: [true, 'Le profil est requis'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
