import mongoose from 'mongoose';
import {
    configureBaseReportSchema,
    createBaseReportDefinition,
} from './baseReportSchema.js';

/**
 * Mongoose schema for a Data Entry Operator daily report.
 */
const dataEntryOperatorReportSchema = configureBaseReportSchema(new mongoose.Schema({
    ...createBaseReportDefinition(),
    dossiersRecus: { type: Number, min: 0, default: 0 },
    dossiersTraites: { type: Number, min: 0, default: 0 },
    dossiersRestants: { type: Number, min: 0, default: 0 },
    observations: { type: String, trim: true },
}));

const DataEntryOperatorReport = mongoose.model(
    'DataEntryOperatorReport',
    dataEntryOperatorReportSchema
);

export default DataEntryOperatorReport;
