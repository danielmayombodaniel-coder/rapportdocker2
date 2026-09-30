# Backend ReportFlow

Backend API pour l'application ReportFlow - Collecte, validation et génération automatisée de rapports journaliers.

## Structure du projet

```
ReportflowBack/
├── server.js              # Point d'entrée du serveur
├── app.js                # Configuration Express
├── config/
│   └── db.js            # Connexion MongoDB
├── controllers/          # Contrôleurs (à créer)
├── routes/              # Routes (à créer)
├── models/              # Modèles Mongoose (à créer)
├── services/            # Services métier (à créer)
├── middleware/          # Middleware personnalisé (à créer)
├── validators/          # Validateurs (à créer)
├── utils/               # Utilitaires
│   ├── logger.js       # Logger Pino
│   ├── app-error.js    # Gestion des erreurs
│   └── ...             # Autres utilitaires
└── public/              # Fichiers statiques
```

## Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (cluster ou instance locale)
- npm ou yarn

## Installation

1. **Cloner le projet** (si nécessaire)
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Configuration de l'environnement** :

   Le fichier `.env` se trouve dans le dossier `ReportflowBack/` (à côté de `app.js` et `server.js`).

   Exemple de `.env` :
   ```env
   MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
   PORT=5000
   # Autres variables d'environnement...
   ```

## Démarrage

### Mode développement
```bash
npm run dev
```
Le serveur démarre avec nodemon (rechargement automatique).

### Mode production
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Retourne l'état de l'API
  - Exemple de réponse :
    ```json
    {
      "status": "ok",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "message": "API ReportFlow fonctionnelle"
    }
    ```

### Route racine
- **GET** `/`
  - Message de bienvenue

## Connexion MongoDB

La connexion à MongoDB est gérée dans `config/db.js` :
- Se connecte avec les options de timeout appropriées
- Vérifie que `MONGO_URI` est défini
- Logge le succès ou l'échec
- Arrête le processus en cas d'échec de connexion

## Configuration CORS

En développement, le CORS est configuré de manière permissive (`origin: '*'`).  
**À restreindre pour la production** en spécifiant les origines autorisées.

## Logging

Le projet utilise Pino pour le logging :
- Niveau info pour les succès
- Niveau error pour les erreurs
- Sortie structurée en JSON

## Prochaines étapes

1. **Créer les modèles Mongoose** dans `models/`
2. **Créer les routes** dans `routes/`
3. **Créer les contrôleurs** dans `controllers/`
4. **Implémenter l'authentification**
5. **Ajouter la validation** avec `express-validator`
6. **Configurer les tests**

## Scripts disponibles

- `npm run dev` : Démarre le serveur en mode développement avec nodemon
- `npm start` : Démarre le serveur en mode production
- `npm test` : Exécute les tests (à configurer)

## Dépannage

### Erreur de connexion MongoDB
- Vérifier que `MONGO_URI` est correct dans le fichier `.env` dans le dossier `ReportflowBack/`
- Vérifier que le cluster MongoDB est accessible
- Vérifier les credentials

### Le serveur ne démarre pas
- Vérifier que le port 5000 n'est pas déjà utilisé
- Vérifier que toutes les dépendances sont installées
- Vérifier les logs pour les erreurs spécifiques