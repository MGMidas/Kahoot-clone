# 🎨 Wireframes & Design — Kahoot Clone

---

## 📐 1. Choix de Design

| Élément | Valeur |
|---------|--------|
| Style | Gaming Dark — fond sombre, couleurs vives |
| Police | Segoe UI / Roboto / Arial |
| Couleur de fond | `#13121a` |
| Couleur surface | `#1e1b29` |
| Couleur primaire | `#46178f` (violet Kahoot) |
| Couleur bouton | `#26890c` (vert) |

### Couleurs des pavés de réponse (identiques au vrai Kahoot)
| Lettre | Couleur | Code hex |
|--------|---------|----------|
| A | Rouge | `#e21b3c` |
| B | Bleu | `#1368ce` |
| C | Jaune | `#d89e00` |
| D | Vert | `#26890c` |

---

## 📱 2. Page 1 — `index.html` (Accueil / Rejoindre)

**URL :** `http://localhost:3000/`  
**Rôle :** Permet au joueur d'entrer son code PIN et son pseudo pour rejoindre une partie.

```
┌─────────────────────────────┐
│                             │
│      Kahoot Clone !         │  ← h1 avec dégradé blanc
│                             │
│  Entre ton code PIN         │  ← texte indicatif
│                             │
│  ┌─────────────────────┐    │
│  │   Code PIN          │    │  ← input#input-pin
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Pseudo            │    │  ← input#input-pseudo
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │      Valider        │    │  ← button#btn-valider (vert)
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │    Créer un Quiz    │    │  ← lien vers host.html (violet)
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**User Stories liées :** US-07  
**Événement Socket.io :** `player_join_game` → `join_success` / `join_error`

---

## 🖥️ 3. Page 2 — `host.html` (Animateur)

**URL :** `http://localhost:3000/host.html`  
**Rôle :** Permet à l'animateur de créer un quiz et de lancer la partie.

```
┌─────────────────────────────┐
│                             │
│      Kahoot-Clone           │  ← h1
│      Créer le quiz          │  ← h2
│                             │
│  ┌─────────────────────┐    │
│  │   Titre du quiz     │    │  ← input#titre-quiz
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Question          │    │  ← input#question
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Réponse A         │    │  ← input#reponse-a
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │   Réponse B         │    │  ← input#reponse-b
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │   Réponse C         │    │  ← input#reponse-c
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │   Réponse D         │    │  ← input#reponse-d
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  Bonne réponse : A ▼│    │  ← select#bonne-reponse
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Lancer la partie  │    │  ← button#btn-lancer (vert)
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**User Stories liées :** US-01, US-02, US-03  
**Événement Socket.io :** `host_create_game` → `game_created` (reçoit le PIN)

---

## 📱 4. Page 3 — `player.html` (Joueur en jeu)

**URL :** `http://localhost:3000/player.html`  
**Rôle :** Interface du joueur pendant la partie — 3 écrans qui s'alternent via JavaScript.

### Écran A — Salle d'attente (`#screen-waiting`)

```
┌─────────────────────────────┐
│  Pseudo: Joueur1  Score: 0  │  ← header.player-status
├─────────────────────────────┤
│                             │
│      Tu es connecté !       │
│   Regarde l'écran principal │
│                             │
│           ◌ (spinner)       │  ← animation rotation
│                             │
│  En attente du lancement... │
│                             │
└─────────────────────────────┘
```

### Écran B — Jeu (`#screen-game`) — masqué par défaut

```
┌─────────────────────────────┐
│  Pseudo: Joueur1  Score: 0  │
├─────────────────────────────┤
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │    ▲     │ │    ♦     │  │  ← Rouge (A) / Bleu (B)
│  │  btn-red │ │ btn-blue │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │    ●     │ │    ■     │  │  ← Jaune (C) / Vert (D)
│  │btn-yellow│ │btn-green │  │
│  └──────────┘ └──────────┘  │
│                             │
└─────────────────────────────┘
```

### Écran C — Feedback (`#screen-feedback`) — masqué par défaut

```
┌─────────────────────────────┐
│  Pseudo: Joueur1  Score: 0  │
├─────────────────────────────┤
│                             │
│         ✅ Correct !        │  ← ou ❌ Incorrect !
│                             │
│    🔥 +100 points           │
│                             │
└─────────────────────────────┘
```

**User Stories liées :** US-08, US-09, US-10  
**Événements Socket.io :**  
- Reçoit : `new_question`, `show_feedback`, `show_leaderboard`  
- Émet : `player_answer`

---

## 🔄 5. Flux de Navigation

```
index.html
    │
    ├── [Valider PIN + Pseudo] ──→ player.html (écran attente)
    │                                   │
    │                                   ├── [Partie lancée] ──→ écran jeu
    │                                   │                           │
    │                                   │                    [Réponse cliquée]
    │                                   │                           │
    │                                   └── [Feedback] ──→ écran attente suivant
    │
    └── [Créer un Quiz] ──→ host.html
                                │
                         [Lancer la partie]
                                │
                         PIN généré + affiché
                                │
                         Attente des joueurs
```