# 🎯 Brief et Objectifs du Projet

---

## 📝 1. Contexte & Problématique

Les outils de quiz interactifs comme Kahoot sont très utilisés en formation et en classe, mais ils nécessitent un abonnement payant pour accéder à toutes les fonctionnalités. Ce projet propose une version open-source, légère et hébergeable soi-même, permettant à n'importe quel animateur de lancer un quiz en temps réel avec ses apprenants.

> Les participants on besoin de créer un compte. Ils rejoignent la partie depuis leur smartphone via un simple code PIN, ce qui rend l'outil accessible et immédiat en contexte de formation.

---

## 👥 2. Public Cible (Personas)

L'application s'adresse principalement à deux types d'utilisateurs :

1. **L'Animateur (formateur, enseignant)** : Utilise l'application à **100% sur ordinateur / vidéoprojecteur**. Il a besoin de créer rapidement un quiz, de partager un code PIN avec sa salle et de visualiser les résultats en direct.

2. **Le Joueur (apprenant, participant)** : Utilise l'application à **80% sur mobile**. Il a besoin de gros boutons colorés, d'une navigation à une main et d'un retour visuel immédiat après chaque réponse.

---

## 🎯 3. Périmètre Fonctionnel (MVP - Minimum Viable Product)

Voici les fonctionnalités prioritaires indispensables pour la première version de l'application :

### 🎮 Système de jeu temps réel
- [ ] Connexion des joueurs via un code PIN à 6 chiffres.
- [ ] Salle d'attente (lobby) affichant les joueurs connectés en temps réel via Socket.io.
- [ ] Chronomètre synchronisé pour tous les joueurs (20 à 60 secondes par question).
- [ ] Calcul des scores basé sur la justesse et la rapidité de réponse.
- [ ] Classement des 5 premiers joueurs affiché après chaque question.

### 📋 Gestion du Quiz (Animateur)
- [ ] Création d'un quiz avec titre, questions et choix multiples (2 à 4 réponses).
- [ ] Stockage des quiz au format JSON côté serveur.
- [ ] Lancement de la partie avec génération automatique du code PIN.

### 📱 Interface Joueur (Mobile-first)
- [ ] Formulaire de connexion adapté aux écrans tactiles (PIN + pseudo).
- [ ] Affichage des réponses sous forme de grandes zones colorées.
- [ ] Retour visuel immédiat : bonne ou mauvaise réponse après chaque question.

---

## 🚫 4. Hors Périmètre (Pour les futures versions)

Pour garantir le respect des délais, les fonctionnalités suivantes sont reportées à la V2 :

- [ ] Génération automatique de questions par IA (Claude API — nécessite abonnement).
- [ ] Authentification et gestion de comptes utilisateurs.
- [ ] Base de données SQL ou NoSQL (remplacée par JSON en V1).
- [ ] Historique des parties et statistiques.
- [ ] Mode hors-ligne.
- [ ] Traduction multi-langue.