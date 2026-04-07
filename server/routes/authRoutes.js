const { hashPassword, comparePassword, isStrongPassword } = require('../utils/crypto.js');
const rateLimit = require("express-rate-limit");
const express = require('express');
const router = express.Router();
const { readUsers, saveUsers } = require('../utils/fileHandler.js');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "For mange registreringsforsøg, prøv igen senere."
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "For mange loginforsøg, prøv igen senere.",
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/register", registerLimiter, async (req,res)=>{
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const { username, password} = body;
        const role = "user";

        if(!username || !password || typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password.trim()){
            return res.status(400).json({ message: "Udfyld alle felter" });
        }
        const cleanUsername = username.trim().toLowerCase();
        
        if (password !== password.trim()) {
            return res.status(400).json({ message: "Password må ikke starte eller slutte med mellemrum" });
        }

        if(!isStrongPassword(password)){
            return res.status(400).json({ message: "Password er ikke stærkt nok" });
        }

        //læs brugere fra fil   
        const users = readUsers();

        //tjek for duplikat username
        const existingUser = users.find(u => u.username === cleanUsername);
        if(existingUser){
            return res.status(409).json({ message: "Vælg et andet brugernavn" });
        }
        //hash password
        const hashedPassword = await hashPassword(password);

        //opret bruger objekt
        const newUser = {
            username: cleanUsername,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        };

        //gem bruger i fil
        users.push(newUser);
        saveUsers(users);

        //returnér success response
        return res.status(201).json({ message: "Bruger oprettet" });

    } catch (err) {
        console.error("Fejl i /register route:", err);
        return res.status(500).json({ message: "Serverfejl ved oprettelse af bruger" });
    }
})

router.post("/login", loginLimiter, async (req,res)=>{
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const { username, password } = body;
        //valideér input
        if(!username || !password || typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password.trim()){
            return res.status(400).json({ message: "Udfyld alle felter" });
        }
        const cleanUsername = username.trim().toLowerCase();

        //læs brugere fra fil
        const users = readUsers();

        //find bruger
        const user = users.find(u => u.username === cleanUsername);
        if(!user){
            return res.status(401).json({ message: "Forkert brugernavn eller password" });
        }

        if (password !== password.trim()) {
            return res.status(401).json({ message: "Forkert brugernavn eller password" });
        }

        //sammenlign password
        const isMatch = await comparePassword(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: "Forkert brugernavn eller password" });
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        req.session.user = {
            username: user.username,
            role: user.role
        };

        return res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Fejl i /login route:", err);
        return res.status(500).json({ message: "Serverfejl ved login" });
    }
}); 

router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Ikke logget ind" });
    }
    res.status(200).json(req.session.user);
});

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Kunne ikke logge ud" });
        }
        res.clearCookie("quiz.sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/"
        });
        res.status(200).json({ message: "Logout successful" });
    });
});

module.exports = router;