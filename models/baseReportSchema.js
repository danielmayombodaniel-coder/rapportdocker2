import mongoose from 'mongoose';

export const REPORT_STATUSES = Object.freeze([
    'draft',
    'submitted',
    'needs_correction',
    'validated',
]);

/**
 * Normalizes a report date to UTC midnight so day-based queries are stable.
 *
 * @param {Date|string|number} value
 * @returns {Date}
 */
export const normalizeReportDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return date;
    }

    date.setUTCHours(0, 0, 0, 0);
    return date;
};

/**
 * Returns the fields shared by every report model.
 *
 * A factory is used instead of discriminators because the four report types
 * are stored independently and only share fields and indexes.
 *
 * @returns {mongoose.SchemaDefinition}
 */
export const createBaseReportDefinition = () => ({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    submittedByName: {
        type: String,
        required: [true, 'Le nom du soumetteur est requis'],
        trim: true,
    },
    reportDate: {
        type: Date,
        required: [true, 'La date du rapport est requise'],
        set: normalizeReportDate,
    },
    status: {
        type: String,
        enum: REPORT_STATUSES,
        default: 'draft',
    },
    submittedAt: {
        type: Date,
        required: false,
    },
    correction: {
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        reason: {
            type: String,
            trim: true,
            required: false,
        },
        requestedAt: {
            type: Date,
            required: false,
        },
    },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    validatedAt: {
        type: Date,
        required: false,
    },
});

/**
 * Applies common report options and indexes to a schema.
 *
 * @param {mongoose.Schema} schema
 * @returns {mongoose.Schema}
 */
export const configureBaseReportSchema = (schema) => {
    schema.set('timestamps', true);
    schema.index({ submittedBy: 1, reportDate: 1 });
    schema.index({ reportDate: 1, status: 1 });
    return schema;
};
