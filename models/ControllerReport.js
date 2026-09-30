import mongoose from 'mongoose';
import {
    configureBaseReportSchema,
    createBaseReportDefinition,
} from './baseReportSchema.js';
import { ERROR_CATEGORIES } from '../utils/errorCategories.js';

const frequentErrorSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ERROR_CATEGORIES,
        required: true,
    },
    customCategory: {
        type: String,
        trim: true,
        validate: {
            validator(value) {
                return !value || this.category === 'autre';
            },
            message: 'customCategory est réservé à la catégorie autre',
        },
    },
    dossiers: {
        type: [String],
        default: [],
    },
}, { _id: false });

/**
 * Mongoose schema for a Controller daily report.
 */
const controllerReportSchema = configureBaseReportSchema(new mongoose.Schema({
    ...createBaseReportDefinition(),
    dossiersAssignes: { type: Number, min: 0, default: 0 },
    dossiersControles: { type: Number, min: 0, default: 0 },
    dossiersEnAttente: { type: Number, min: 0, default: 0 },
    observations: { type: String, trim: true },
    dataEntryPersons: [{
        nom: { type: String, required: true, trim: true },
        zone: { type: String, required: true, trim: true },
    }],
    frequentErrors: {
        type: [frequentErrorSchema],
        default: [],
    },
}));

const ControllerReport = mongoose.model('ControllerReport', controllerReportSchema);

export default ControllerReport;
