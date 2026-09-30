# Correction de l'URL API

## URL correcte du backend sur Render

L'URL correcte du backend sur Render est : `https://reportflowback.onrender.com` (sans underscore)

## Configuration du frontend

Le frontend a été configuré avec :
- `.env.production` : `VITE_API_URL=https://reportflowback.onrender.com/api`
- `.env.development` : `VITE_API_URL=http://localhost:5000/api`

Le suffixe `/api` est important car le code du frontend construit les chemins comme `${API_URL}${path}`.

## Variables d'environnement du backend

Sur Render, configurez :
- `FRONTEND_URL=https://reportflow-front.onrender.com`
- `MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/plume_noire`
- `JWT_SECRET=<your-secret>`
- `PORT=5000`
- `MAX_UPLOAD_SIZE_MB=50`

## Vérification

L'API backend fonctionne correctement :
- Health check : https://reportflowback.onrender.com/api/health
- Réponse : `{"status":"ok","timestamp":"...","message":"API ReportFlow fonctionnelle"}`
