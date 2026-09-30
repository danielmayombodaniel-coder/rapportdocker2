# Guide de déploiement sur Render - Backend

## Configuration automatique

Le fichier `.env` est maintenant configuré et versionné. Render l'utilisera automatiquement lors du déploiement.

### Conversion des rapports en PDF

Le backend utilise LibreOffice en mode headless pour convertir le même document DOCX généré en PDF, sans reconstruire sa mise en page. Le fichier `Dockerfile` installe automatiquement LibreOffice.

Dans Render, configurez le service backend avec le runtime **Docker** et le contexte `ReportflowBack`. Le fichier `render.yaml` contient cette configuration. La route PDF est ensuite disponible via `POST /api/rapport-unifie/pdf`.

Après le changement de runtime, lancez un déploiement manuel ou poussez le commit. Un ancien service Render configuré en Node.js ne possède pas LibreOffice et renverra une erreur `503`.

### Variables d'environnement actuelles (.env)

```
MONGO_URI=mongodb+srv://daniel:test123@cluster0.5aylk.mongodb.net/plume_noire
JWT_SECRET=reportflow_jwt_secret_secure_2024
PORT=5000
MAX_UPLOAD_SIZE_MB=50
FRONTEND_URL=https://reportflow-front.onrender.com
```

## Workflow de développement

### Travailler en local
```bash
cd ReportflowBack
npm install
npm run dev
```

### Déployer en production
```bash
git add .
git commit -m "votre message"
git push
```
Render détecte automatiquement les changements et redéploie.

## Résolution des problèmes

### Erreur "Cannot find package 'zod'"
✅ **Résolu** : Le package a été ajouté aux dépendances.

### Erreur CORS
✅ **Résolu** : `FRONTEND_URL` est configuré dans le fichier `.env`.

### Connexion MongoDB
La connexion utilise votre cluster MongoDB Atlas existant.
