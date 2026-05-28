## 📅 Mercredi 27 Mai 2026

**🎯 Objectifs de la session :**


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