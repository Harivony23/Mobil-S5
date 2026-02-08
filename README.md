# 🚗 Garage Mobile - Application Mobile S5

Application mobile de simulation de garage développée avec Ionic React et Firebase.

## 📋 Fonctionnalités

### ✅ Authentification

- Inscription avec email/mot de passe
- Connexion sécurisée
- Gestion de session avec Firebase Auth

### ✅ Gestion des pannes

- Décrire les pannes de sa voiture
- Sélectionner parmi 8 types de réparations :
  - Frein
  - Vidange
  - Filtre
  - Batterie
  - Amortisseurs
  - Embrayage
  - Pneus
  - Système de refroidissement

### ✅ Suivi des réparations

- Liste de toutes les voitures en réparation
- Détails de chaque voiture avec progression en temps réel
- Barre de progression pour chaque réparation
- Statuts : Pending → In Progress → Ready → Paid

### ✅ Paiement

- Récapitulatif des réparations effectuées
- Calcul automatique du montant total
- Validation du paiement

### ✅ Notifications Push

- Notifications en temps réel quand les réparations sont terminées
- Support des notifications en arrière-plan (app fermée)
- Support des notifications au premier plan (app ouverte)

## 🛠️ Technologies utilisées

- **Framework** : Ionic React 8.5.0
- **Backend** : Firebase
  - Authentication
  - **Firestore** (base de données NoSQL)
  - Cloud Messaging (FCM)
- **UI** : Ionic Components
- **State Management** : React Hooks
- **Notifications** : react-hot-toast + FCM
- **Build** : Vite

## 📦 Installation

```bash
# Cloner le projet
git clone [votre-repo]
cd garage-mobile

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build
```

## 🔧 Configuration

### 1. Firebase

Le projet est déjà configuré avec Firebase Firestore. Les clés sont dans `src/firebase.ts`.

Pour plus de détails, consultez : [FIRESTORE_CONFIG_GUIDE.md](./FIRESTORE_CONFIG_GUIDE.md)

### 2. Notifications Push

Les notifications sont configurées avec FCM.

Guide complet : [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)

## 📱 Structure du projet

```
src/
├── pages/
│   ├── Login.tsx              # Page de connexion
│   ├── Register.tsx           # Page d'inscription
│   ├── Home.tsx               # Dashboard principal
│   ├── AddBreakdown.tsx       # Formulaire de déclaration de panne
│   ├── RepairList.tsx         # Liste des voitures à réparer
│   ├── RepairDetail.tsx       # Détails et progression des réparations
│   └── Payment.tsx            # Page de paiement
├── services/
│   └── notificationService.ts # Service de gestion des notifications
├── firebase.ts                # Configuration Firebase
└── App.tsx                    # Composant racine

public/
└── firebase-messaging-sw.js   # Service Worker pour notifications
```

## 🚀 Utilisation

### 1. S'inscrire / Se connecter

- Ouvrez l'application
- Créez un compte ou connectez-vous
- Acceptez les notifications quand demandé

### 2. Ajouter une voiture en panne

- Cliquez sur "Décrire une panne"
- Renseignez le modèle et la plaque d'immatriculation
- Sélectionnez les réparations nécessaires
- Envoyez au garage

### 3. Suivre les réparations

- Accédez à "Voir toutes les réparations"
- Cliquez sur votre voiture
- Lancez les réparations une par une
- Observez la progression en temps réel

### 4. Payer

- Quand toutes les réparations sont terminées
- Cliquez sur "Passer au paiement"
- Validez le paiement

### 5. Recevoir des notifications

- Vous recevrez automatiquement une notification quand votre voiture est prête
- Fonctionne même si l'app est fermée !

## 🔗 Intégration avec les autres composants

### Avec le Backend Laravel

Le backend Laravel peut envoyer des notifications via l'API Firebase.
Voir : [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) - Section Laravel

### Avec le Jeu Godot

Le jeu Godot lit et écrit dans la même base Firebase Firestore.

- Le jeu lit les voitures en attente
- Le jeu met à jour le statut et la progression
- L'app mobile affiche les changements en temps réel

### Avec l'App Web

L'application web (Vue.js) affiche les statistiques et les réparations en cours.
Elle lit les mêmes données depuis Firebase Firestore.

## 📊 Base de données Firestore

Structure de Firestore :

```
users (collection)
  {userId} (document)
    email: "user@example.com"
    fcmToken: "token-fcm..."
    createdAt: "2026-02-04T..."
    updatedAt: "2026-02-04T..."

cars (collection)
  {carId} (document auto-généré)
    ownerId: "userId"
    ownerEmail: "user@example.com"
    model: "Toyota Corolla"
    licensePlate: "AB-123-CD"
    status: "pending" | "repairing" | "ready" | "paid"
    createdAt: "2026-02-04T..."
    paidAt: "2026-02-04T..."
    repairs: [
      {
        type: "Frein",
        status: "pending" | "in_progress" | "done",
        progress: 0.5
      }
    ]
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test.unit

# Tests E2E
npm run test.e2e
```

## 📱 Déploiement Mobile

### Android

```bash
npx cap add android
npx cap sync
npx cap open android
```

### iOS

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

## 📝 Documentation

- [Guide de configuration Firestore](./FIRESTORE_CONFIG_GUIDE.md)
- [Guide des notifications Push](./NOTIFICATIONS_GUIDE.md)
- [Exemple de Cloud Functions](./firebase-functions-example.js)

## 👥 Équipe

Projet S5 DESIGN - Promotion 4
Groupe de 4 étudiants

## 📅 Livraison

Date limite : 16 février 2026

## 📄 Licence

Projet académique - ITU Madagascar
