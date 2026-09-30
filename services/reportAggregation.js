import { getTodayReportDate } from './reportDateUtils.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Builds a UTC date range from YYYY-MM-DD, defaulting to today.
 *
 * @param {string|undefined} value
 * @returns {{start: Date, end: Date, date: Date}}
 */
export const getReportDateRange = (value) => {
    const dateValue = value || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const error = new Error('La date doit respecter le format YYYY-MM-DD');
        error.status = 400;
        throw error;
    }

    const start = getTodayReportDate(new Date(`${dateValue}T00:00:00.000Z`));
    if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== dateValue) {
        const error = new Error('La date demandée est invalide');
        error.status = 400;
        throw error;
    }

    return { start, end: new Date(start.getTime() + DAY_IN_MS), date: start };
};

/**
 * Builds the requested reporting period around a reference date.
 *
 * @param {'jour'|'semaine'|'mois'} period
 * @param {string|undefined} value
 * @returns {{start: Date, end: Date, date: Date}}
 */
export const getPeriodDateRange = (period = 'jour', value) => {
    if (period === 'jour') return getReportDateRange(value);

    const reference = getReportDateRange(value).date;
    let start = new Date(reference);
    let end;

    if (period === 'semaine') {
        const day = start.getUTCDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        start.setUTCDate(start.getUTCDate() + mondayOffset);
        end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);
    } else if (period === 'mois') {
        start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    } else {
        const error = new Error('La période doit être jour, semaine ou mois');
        error.status = 400;
        throw error;
    }

    return { start, end, date: reference };
};

/**
 * Retrieves every report whose normalized reportDate belongs to a day.
 *
 * @param {import('mongoose').Model} Model
 * @param {{start: Date, end: Date}} range
 * @returns {Promise<Array>}
 */
export const findReportsForDate = (Model, range) => Model.find({
    reportDate: { $gte: range.start, $lt: range.end },
}).sort({ submittedByName: 1, createdAt: 1 });

/**
 * Retrieves reports inside any inclusive-start/exclusive-end period.
 *
 * @param {import('mongoose').Model} Model
 * @param {{start: Date, end: Date}} range
 * @returns {Promise<Array>}
 */
export const findReportsForRange = (Model, range) => Model.find({
    reportDate: { $gte: range.start, $lt: range.end },
}).sort({ reportDate: 1, createdAt: 1 });

/**
 * Calculates status counters for a set of reports.
 *
 * @param {Array} reports
 * @returns {{expected: number, submitted: number, validated: number, needsCorrection: number, draft: number}}
 */
export const countReportStatuses = (reports) => reports.reduce((counts, report) => {
    counts.expected += 1;
    if (report.status === 'submitted') counts.submitted += 1;
    if (report.status === 'validated') counts.validated += 1;
    if (report.status === 'needs_correction') counts.needsCorrection += 1;
    if (report.status === 'draft') counts.draft += 1;
    return counts;
}, {
    expected: 0,
    submitted: 0,
    validated: 0,
    needsCorrection: 0,
    draft: 0,
});

const readPath = (value, path) => path.split('.').reduce((current, key) => current?.[key], value) || 0;

/**
 * Sums configured numeric fields from validated reports only.
 *
 * @param {Array} reports
 * @param {Record<string, string>} fields
 * @returns {object}
 */
export const sumValidatedFields = (reports, fields) => reports
    .filter((report) => report.status === 'validated')
    .reduce((totals, report) => {
        Object.entries(fields).forEach(([outputKey, path]) => {
            totals[outputKey] = (totals[outputKey] || 0) + Number(readPath(report, path));
        });
        return totals;
    }, Object.fromEntries(Object.keys(fields).map((key) => [key, 0])));

/**
 * Groups frequent errors from validated controller reports.
 *
 * @param {Array} reports
 * @returns {Array<{category: string, count: number, dossiers: string[]}>}
 */
export const aggregateFrequentErrors = (reports) => {
    const grouped = new Map();

    reports.filter((report) => report.status === 'validated').forEach((report) => {
        (report.frequentErrors || []).forEach((error) => {
            const category = error.category === 'autre' && error.customCategory
                ? error.customCategory
                : error.category;
            const current = grouped.get(category) || { category, count: 0, dossiers: new Set() };
            current.count += 1;
            (error.dossiers || []).forEach((dossier) => current.dossiers.add(dossier));
            grouped.set(category, current);
        });
    });

    return [...grouped.values()]
        .map((entry) => ({ ...entry, dossiers: [...entry.dossiers] }))
        .sort((first, second) => second.count - first.count || first.category.localeCompare(second.category));
};

/**
 * Counts validated reports for each day in a period.
 *
 * @param {Array} reports
 * @param {{start: Date, end: Date}} range
 * @returns {Array<{date: string, count: number}>}
 */
export const countValidatedByDay = (reports, range) => {
    const counts = new Map();
    for (let date = new Date(range.start); date < range.end; date.setUTCDate(date.getUTCDate() + 1)) {
        counts.set(date.toISOString().slice(0, 10), 0);
    }

    reports.filter((report) => report.status === 'validated').forEach((report) => {
        const date = new Date(report.reportDate).toISOString().slice(0, 10);
        if (counts.has(date)) counts.set(date, counts.get(date) + 1);
    });

    return [...counts].map(([date, count]) => ({ date, count }));
};
