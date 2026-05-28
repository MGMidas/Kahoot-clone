# 🏗️ Architecture Technique & Modèle de Données

---

## 🗺️ 1. Schéma Global de l'Architecture

L'application utilise une architecture découplée (Client-Serveur) avec communication temps réel :

```text
[ Client Web / Mobile (HTML + CSS + JS Vanilla) ]
       │
       ├─── Requêtes HTTP/JSON ──────────────────▶ [ API REST (Node.js / Express) ]
       │                                                        │
       └─── WebSocket (Socket.io) ◀──────────────▶ [ Serveur Socket.io ]
                                                               │
                                                               ▼
                                                   [ Stockage JSON (fichier) ]
```

---

## 🗄️ 2. Modèle de Données (Structure JSON)

Pas de base de données SQL — les quiz sont stockés dans `server/data/quizzes.json`.

```json
{
  "quizzes": [
    {
      "id": "abc123",
      "titre": "Quiz HTML/CSS",
      "questions": [
        {
          "id": 1,
          "texte": "Quelle balise définit le titre principal ?",
          "timer": 30,
          "reponses": [
            { "label": "A", "texte": "<h1>", "correcte": true },
            { "label": "B", "texte": "<title>", "correcte": false },
            { "label": "C", "texte": "<header>", "correcte": false },
            { "label": "D", "texte": "<main>", "correcte": false }
          ]
        }
      ]
    }
  ]
}
```

---

## 🌐 3. Contrat d'API REST (Routes HTTP)

Toutes les requêtes d'API sont préfixées par `/api`.

| Méthode | Route | Description | Auth requise | Statut |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/api/quizzes` | Récupère la liste des quiz | Non | ❌ En attente |
| `POST` | `/api/quizzes` | Crée un nouveau quiz | Non | ❌ En attente |
| `GET` | `/api/quizzes/:id` | Récupère un quiz par son ID | Non | ❌ En attente |
| `DELETE` | `/api/quizzes/:id` | Supprime un quiz | Non | ❌ En attente |

---

## ⚡ 4. Événements Socket.io (Temps Réel)

La communication en temps réel se fait via des événements Socket.io entre le client et le serveur.

| Émetteur | Événement | Description | Statut |
| :--- | :--- | :--- | :---: |
| Animateur → Serveur | `creer-partie` | Crée une salle avec un code PIN | ❌ En attente |
| Joueur → Serveur | `rejoindre-partie` | Rejoint une salle via le PIN + pseudo | ❌ En attente |
| Serveur → Tous | `joueur-connecte` | Notifie qu'un joueur a rejoint le lobby | ❌ En attente |
| Animateur → Serveur | `lancer-question` | Envoie la question suivante à tous | ❌ En attente |
| Joueur → Serveur | `envoyer-reponse` | Envoie la réponse du joueur | ❌ En attente |
| Serveur → Tous | `afficher-classement` | Envoie le classement mis à jour | ❌ En attente |
| Serveur → Tous | `fin-partie` | Notifie la fin du quiz | ❌ En attente |

---

## 🛠️ 5. Stack Technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | HTML5 / CSS3 / JS Vanilla | Interface utilisateur mobile-first |
| Backend | Node.js + Express | Serveur HTTP et routes API |
| Temps réel | Socket.io | Communication bidirectionnelle |
| Stockage | JSON (fichier) | Sauvegarde des quiz |
| Config | dotenv | Variables d'environnement (.env) |