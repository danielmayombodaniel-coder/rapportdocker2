export const PROFILES = Object.freeze([
    'support_client_agent',
    'support_client_responsable',
    'controleur_agent',
    'controleur_responsable',
    'operateur_saisie_agent',
    'operateur_saisie_responsable',
    'rapport_individuel',
    'admin',
]);

export const PUBLIC_PROFILES = Object.freeze(
    PROFILES.filter((profile) => profile !== 'admin')
);
