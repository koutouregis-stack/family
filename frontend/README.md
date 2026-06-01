# Family Management App - Frontend

Frontend React + Vite pour l'application de gestion familiale.

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créez un fichier `.env` à la racine du dossier frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## Développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173`

## Build

```bash
npm run build
```

## Structure

```
frontend/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── pages/           # Pages de l'application
│   ├── contexts/        # Context API (Auth, Family)
│   ├── hooks/           # Custom hooks
│   ├── services/        # Services API
│   ├── App.jsx          # Composant racine
│   ├── main.jsx         # Entry point
│   └── index.css        # Styles globaux
├── index.html           # HTML principal
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

- ✅ Authentication (Login/Register)
- ✅ Dashboard avec gestion des familles
- ✅ Gestion des tâches
- ✅ Liste de courses
- ✅ Calendrier d'événements
- ✅ Budget/Dépenses
- ✅ Gestion des membres
- ✅ Notifications

## Technologies

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API

## API Endpoints

L'application se connecte à l'API backend sur `http://localhost:5000/api`