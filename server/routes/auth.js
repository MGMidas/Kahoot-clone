const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userfile = path.join(__dirname, "../data/users.json");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const data = fs.readFileSync(userfile, "utf8");
  const users = JSON.parse(data);

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
  fs.writeFileSync(userfile, JSON.stringify(users, null, 2));
  return res.status(201).json({ message: " ressource créée avec succès" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const data = fs.readFileSync(userfile, "utf-8");
  const users = JSON.parse(data);

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
