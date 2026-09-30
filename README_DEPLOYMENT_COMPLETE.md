# Guide de déploiement complet - ReportFlow

## État actuel

✅ **Corrections effectuées** :
- Ajout du package `zod` au backend (résout l'erreur de déploiement)
- Configuration CORS pour supporter local et production
- Configuration des fichiers d'environnement Vite pour le frontend
- Correction de l'URL API pour le frontend
- Guides de déploiement créés dans chaque projet

## URLs de production

- **Frontend** : https://reportflow-front.onrender.com
- **Backend** : https://reportflowback.onrender.com (sans underscore)

## Étapes restantes sur Render

### Backend (ReportflowBack)

#### Variables d'environnement à configurer sur Render

| Variable | Valeur | Description |
|----------|--------|-------------|
| `MONGO_URI` | Votre chaîne de connexion MongoDB Atlas | Connexion à la base de données |
| `JWT_SECRET` | Une chaîne secrète forte | Pour signer les tokens JWT |
| `PORT` | `5000` | Port du serveur |
| `MAX_UPLOAD_SIZE_MB` | `50` | Taille max des fichiers uploadés |
| `FRONTEND_URL` | `https://reportflow-front.onrender.com` | URL du frontend pour CORS |

#### Configuration MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (si ce n'est pas déjà fait)
3. Créez un utilisateur de base de données avec mot de passe
4. Dans "Network Access", autorisez l'accès depuis `0.0.0.0/0`
5. Copiez la chaîne de connexion

Format de la chaîne de connexion :
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/plume_noire
```

### Frontend (ReportFlow_Front)

Le frontend est déjà configuré avec les bonnes variables d'environnement :
- `.env.production` : `VITE_API_URL=https://reportflowback.onrender.com/api`
- `.env.development` : `VITE_API_URL=http://localhost:5000/api`

## Workflow de développement

### Travailler en local

1. **Backend** :
   ```bash
   cd ReportflowBack
   npm install
   # Configurez votre .env local
   npm run dev
   ```

2. **Frontend** :
   ```bash
   cd ReportFlow_Front
   npm install
   npm run dev
   ```
   - Utilise `.env.development` automatiquement
   - Communique avec `http://localhost:5000/api`

### Déployer en production

1. Faites vos changements
2. Committez et poussez :
   ```bash
   git add .
   git commit -m "votre message"
   git push
   ```
3. Render détecte et déploie automatiquement

## Vérification après déploiement

1. **Backend** :
   - Vérifiez les logs sur Render
   - Testez : `https://reportflowback.onrender.com/api/health`
   - Vérifiez qu'il n'y a plus d'erreur "Cannot find package 'zod'"

2. **Frontend** :
   - Accédez à `https://reportflow-front.onrender.com`
   - Testez l'authentification
   - Vérifiez que les appels API fonctionnent
