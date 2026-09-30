/**
 * Capitalise la première lettre d'un texte
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte avec la première lettre en majuscule
 */
export const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) return text;
  
  return trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
};

/**
 * Applique la capitalisation sur les champs spécifiés d'un objet
 * @param {Object} data - L'objet contenant les données
 * @param {Array} fields - Les champs à capitaliser
 * @returns {Object} - L'objet avec les champs capitalisés
 */
export const capitalizeFields = (data, fields) => {
  const formattedData = { ...data };
  
  fields.forEach(field => {
    if (formattedData[field]) {
      formattedData[field] = capitalizeFirstLetter(formattedData[field]);
    }
  });
  
  return formattedData;
};