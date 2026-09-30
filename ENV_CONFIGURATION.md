# Configuration des variables d'environnement - ReportFlow

## 📁 Fichiers de configuration

### Backend (ReportflowBack)
- **`.env`** : Fichier principal utilisé par Render (maintenant versionné)
- **`.env.example`** : Template pour référence

### Frontend (ReportFlow_Front)  
- **`.env`** : Fichier principal utilisé par Render (maintenant versionné)
- **`.env.local`** : Pour développement local (non versionné)
- **`.env.example`** : Template pour référence

## 🔧 Variables actuelles

### Backend (.env)
```env
# MongoDB connection string
MONGO_URI=mongodb+srv://daniel:test123@cluster0.5aylk.mongodb.net/plume_noire?retryWrites=true&w=majority&connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000

# JWT secret used to sign admin tokens
JWT_SECRET=reportflow_jwt_secret_secure_2024

# Server port
PORT=5000

# Max upload size for files (in MB)
MAX_UPLOAD_SIZE_MB=50

# CORS configuration for production
FRONTEND_URL=https://reportflow-front.onrender.com
```

### Frontend (.env)
```env
# API URL for production
VITE_API_URL=https://reportflowback.onrender.com/api
```

### Frontend (.env.local) - Développement local
```env
# API URL for local development
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Workflow

### En local

1. **Backend** :
   ```bash
   cd ReportflowBack
   # Le fichier .env contient déjà la configuration
   npm install
   npm run dev
   ```

2. **Frontend** :
   ```bash
   cd ReportFlow_Front
   # Le fichier .env.local contient la configuration locale
   npm install
   npm run dev
   ```

### En production (Render)

Les fichiers `.env` sont déjà configurés et poussés sur GitHub. Render les utilisera automatiquement.

### Pour déployer des changements

1. Modifiez les fichiers `.env` si nécessaire
2. Committez et poussez :
   ```bash
   git add .
   git commit -m "Update environment configuration"
   git push
   ```
3. Render détectera les changements et redéploiera

## ⚠️ Sécurité

Les fichiers `.env` sont maintenant versionnés car vous utilisez Render qui les lit directement. Pour plus de sécurité, vous pourriez :

1. Utiliser les secrets de Render au lieu du fichier `.env`
2. Utiliser des variables d'environnement directement dans le dashboard Render

Mais pour l'instant, cette configuration fonctionne pour votre workflow.

## 🔄 Changements effectués

- **Backend** : Nettoyage du fichier `.env` (suppression des variables de l'ancien projet)
- **Frontend** : Ajout du fichier `.env` avec l'URL de production
- **Git** : Les fichiers `.env` sont maintenant versionnés pour Render
- **Local** : `.env.local` reste non versionné pour le développement local
