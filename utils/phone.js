/**
 * Removes whitespace from a phone number before validation and storage.
 *
 * @param {unknown} value
 * @returns {string}
 */
export const normalizePhone = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.replace(/\s/g, '');
};

/**
 * Checks the normalized phone format used by the API.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isValidPhone = (value) => /^\d+$/.test(value);
