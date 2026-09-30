import mongoose from 'mongoose';
import {
    configureBaseReportSchema,
    createBaseReportDefinition,
} from './baseReportSchema.js';

/**
 * Mongoose schema for an Individual daily report.
 */
const individualReportSchema = configureBaseReportSchema(new mongoose.Schema({
    ...createBaseReportDefinition(),
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
        validate: {
            validator: (value) => value.trim().length > 0,
            message: 'Le titre ne peut pas être vide',
        },
    },
    activitesRealisees: { type: String, trim: true },
    tachesEffectuees: { type: String, trim: true },
    problemesRencontres: { type: String, trim: true },
    observations: { type: String, trim: true },
    autresInformations: { type: String, trim: true },
}));

const IndividualReport = mongoose.model('IndividualReport', individualReportSchema);

export default IndividualReport;
