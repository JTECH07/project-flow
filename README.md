# ProjectFlow - Plateforme de Gestion de Projets Collaborative

ProjectFlow est une plateforme complète et moderne de gestion de projets basée sur la méthode Kanban. Elle offre une interface utilisateur haut de gamme (Dark Premium UI) et permet la collaboration en temps réel entre les membres d'une équipe.

## 🌟 Fonctionnalités Principales

- **Tableau Kanban Interactif** : Gestion des tâches par glisser-déposer.
- **Collaboration en Temps Réel** : Synchronisation instantanée des modifications grâce aux WebSockets (Socket.io).
- **Interface Utilisateur Premium** : Design moderne avec un thème sombre élégant et des animations fluides.
- **Bilingue (i18n)** : Support complet de l'anglais et du français.
- **Gestion des Tâches Avancée** : Modales détaillées, commentaires en temps réel, assignation des membres.
- **Contrôle d'Accès (RBAC)** : Gestion des rôles et des autorisations au sein des projets.
- **Notifications en Temps Réel** : Alertes instantanées pour les invitations et les mises à jour de tâches.

## 🛠️ Stack Technique

- **Frontend** : React, TypeScript, Vite, Socket.io-client, i18n
- **Backend** : Node.js, Express, TypeScript, Socket.io
- **Base de données & ORM** : Prisma, SQLite (pour le développement)

## 🚀 Installation et Lancement

### Prérequis

- Node.js (version 16 ou supérieure recommandée)
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/JTECH07/CodeAlpha_projet-manager.git
   cd CodeAlpha_projet-manager
   ```

2. **Installer les dépendances (Backend & Frontend) :**
   ```bash
   npm run install:all
   ```

3. **Configuration de l'environnement :**
   - Créez un fichier `.env` dans le dossier `backend` et configurez vos variables (clés JWT, URL de base de données, etc.).
   - Initialisez la base de données Prisma :
     ```bash
     cd backend
     npx prisma db push
     # ou npx prisma migrate dev
     ```

4. **Lancer l'application en mode développement :**
   Retournez à la racine du projet et exécutez la commande suivante pour démarrer simultanément le frontend et le backend :
   ```bash
   npm run dev
   ```

5. **Accéder à l'application :**
   - Le Frontend sera généralement accessible sur `http://localhost:5173`
   - Le Backend écoutera sur `http://localhost:5000` (ou le port défini dans votre `.env`)

## 📝 Auteur

Joseph Alaye (jamstech07@gmail.com)
