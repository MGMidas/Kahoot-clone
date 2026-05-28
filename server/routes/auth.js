const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');

const userfile = path.join(__dirname, '../data/users.json');
 
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const data = fs.readFileSync(userfile, 'utf8');
    const users = JSON.parse(data);

    const userVerify = users.some(user => user.email === email);
    if (userVerify) {
        return res.status(409).json({ message: "cet email est deja utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: users.lenght + 1,
        email: email,
        password: hashedPassword
    };
})

module.exports = router;