import mongoose from 'mongoose';
import { configureBaseReportSchema, normalizeReportDate } from './baseReportSchema.js';

const dailyReportNotesSchema = configureBaseReportSchema(new mongoose.Schema({
    reportDate: {
        type: Date,
        required: true,
        set: normalizeReportDate,
    },
    introduction: { type: String, trim: true, default: '' },
    problemesTechniques: { type: String, trim: true, default: '' },
    defisRencontres: { type: String, trim: true, default: '' },
    observations: { type: String, trim: true, default: '' },
    observationsControleur: { type: String, trim: true, default: '' },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}));

dailyReportNotesSchema.index({ reportDate: 1 }, { unique: true });

const DailyReportNotes = mongoose.model('DailyReportNotes', dailyReportNotesSchema);

export default DailyReportNotes;