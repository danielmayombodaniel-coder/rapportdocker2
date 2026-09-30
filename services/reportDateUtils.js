/**
 * Returns today's date at UTC midnight for stable daily report queries.
 *
 * @param {Date} [value]
 * @returns {Date}
 */
export const getTodayReportDate = (value = new Date()) => {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
