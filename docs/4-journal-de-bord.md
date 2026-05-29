## 📅 mardi 25 Mai 2026
absent

## 📅 Mercredi 26 Mai 2026

**🎯 Objectifs de la session :**
- [x] Restructurer les dossiers (player.html, player.js, server.js)
- [x] Mettre à jour package.json avec le script npm start
- [x] Adopter et comprendre le nouveau CSS (box-sizing, background-clip, translateY)
- [x] Finaliser les 3 pages HTML (index, host, player)
- [ ] Implémenter Socket.io côté serveur
- [ ] Implémenter Socket.io côté client (host.js, player.js)

**✅ Réalisations :**
- Renommage play.html → player.html et play.js → player.js via PowerShell
- server/index.js déplacé vers server/server.js, sous-dossiers supprimés
- Nouveau CSS adopté et compris (3 concepts expliqués)
- 3 pages HTML finalisées avec classes CSS correctes

**🚧 Difficultés & Bugs rencontrés :**
- Rename-Item PowerShell échoue avec les slashes / — utiliser des backslashes \
- Les 3 écrans de player.html s'affichaient tous en même temps — classe .hidden manquante dans le CSS

**💡 Solutions & Apprentissages :**
- box-sizing: border-box inclut le padding dans la largeur déclarée
- background-clip: text applique un dégradé à l'intérieur des lettres
- translateY(6px) + box-shadow simule un bouton physique qui s'enfonce au clic

**⏭️ Prochaines étapes (To-Do) :**
- Coder la logique Socket.io dans server/server.js
- Brancher host.js et player.js côté client

---

## 📅 Jeudi 27 Mai 2026

**🎯 Objectifs de la session :**
- [x] Implémenter Socket.io côté serveur (server.js)
- [x] Implémenter Socket.io côté client (host.js)
- [x] Comprendre chaque ligne de code (fiches révision)

**✅ Réalisations :**
- server.js : gameState, generatePIN, événements Socket.io 
  (host_create_game, player_join_game, disconnect)
- host.js : création de partie + réception du PIN fonctionnelle
- Fiches de révision rédigées ligne par ligne avec analogies

**🚧 Difficultés & Bugs rencontrés :**
- Mauvaise utilisation de Claude comme outil magique 
  sans comprendre le code

**💡 Solutions & Apprentissages :**
- Décision de rédiger des fiches d'analyse pour chaque fichier
- Analogie boîte de nuit : PIN = code d'entrée, 
  vigile = validation, patron = animateur

**⏭️ Prochaines étapes :**
- Coder player.js
- Démarrer l'authentification

---

## 📅 Vendredi 28 Mai 2026

**🎯 Objectifs de la session :**
- [x] Démarrer le système d'authentification
- [x] Créer la structure auth (routes, middleware, data)

**✅ Réalisations :**
- Création des dossiers server/routes/, server/middleware/, server/data/
- Création de auth.js avec tous les requires nécessaires
- Création de users.json (tableau vide)
- Route POST /register en cours (email, password, bcrypt.hash)
- Push du projet sur GitHub (MGMidas/Kahoot-clone)

**🚧 Difficultés & Bugs rencontrés :**
- Git push échoué — branche master vs main
- Vim ouvert lors du merge — commande :wq pour sortir

**💡 Solutions & Apprentissages :**
- git branch -M main pour renommer la branche
- require() = importer / app.use() = brancher les routes
- bcrypt.hash(password, 10) + await pour hacher le mot de passe
- module.exports doit être en dernier (colis emballé en dernier)

**⏭️ Prochaines étapes :**
- Finir route /register (newUser, writeFile)
- Coder route /login
- Créer authMiddleware.js
- Créer les pages HTML login/register

chaque matin 9h15 et 9h30 je remplie mon tableau de bord noter ce que je doit faire et le soir brief sur les difficulté et les solution & apprentissage

## 📅 Vendredi 29 Mai 2026

**🎯 Objectifs de la session :**
- [x] Système d'authentification complet
- [x] Pages HTML login et register
- [x] JavaScript register.js en cours

**✅ Réalisations :**
- auth.js : routes /register et /login (bcrypt + JWT)
- authMiddleware.js : vérification token JWT
- server.js : ajout express.json() + branchement authRoutes
- login.html et register.html créés et stylisés
- register.js : fetch POST /api/auth/register en cours
- Pushes réguliers sur GitHub (MGMidas/Kahoot-clone)

**🚧 Difficultés & Bugs rencontrés :**
- const app = express() déclaré deux fois dans server.js
- async/await mal placé sur le fetch
- Confusion entre méthodes HTTP et codes HTTP

**💡 Solutions & Apprentissages :**
- app.use(express.json()) obligatoire pour lire req.body
- bcrypt.compare(password, user.password) pour vérifier
- jwt.sign({payload}, secret, {expiresIn}) pour créer le token
- try/catch pour gérer les erreurs de jwt.verify()
- async () => {} pour utiliser await dans un addEventListener

**⏭️ Prochaines étapes :**
- Finir register.js (traitement réponse fetch)
- Coder login.js
- Tester l'auth avec Thunder Client
- Coder player.js (rejoindre une partie via PIN + pseudo)
- Relier auth au jeu (seul un host connecté peut créer une partie)
- Ajouter les liens entre pages (login → host, register → login)
- Créer/stocker les quiz dans un fichier JSON
- Afficher les questions en temps réel via Socket.io