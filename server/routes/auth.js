const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userfile = path.join(__dirname, "../data/users.json");

// Helper pour lire les utilisateurs (async)
async function getUsers() {
    try {
        if (!fs.existsSync(userfile)) {
            return [];
        }
        const data = await fs.promises.readFile(userfile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Erreur lecture users.json:", error);
        return [];
    }
}

// Helper pour sauvegarder les utilisateurs (async)
async function saveUsers(users) {
    try {
        await fs.promises.writeFile(userfile, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Erreur écriture users.json:", error);
    }
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const users = await getUsers();

  const userVerify = users.some((user) => user.email === email);
  if (userVerify) {
    return res.status(409).json({ message: " cet email est deja utilisé" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    email: email,
    password: hashedPassword,
  };

  users.push(newUser);
  await saveUsers(users);
  return res.status(201).json({ message: " ressource créée avec succès" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await getUsers();

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: " utilisateur introuvable " });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: " mot de passe incorrecte "});
  }
  
  const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ message: " connexion réussie ", token: token });
});

module.exports = router;
