const { hashPassword, comparePassword, isStrongPassword } = require('../utils/authUtils.js');

const express = require('express');
const router = express.Router();
const { readUsers, saveUsers } = require('../utils/fileHandler.js');

router.post("/register", async (req,res)=>{
    //læs username og password, role fra request body
    const { username, password} = req.body;

    //valideér input (tjek om username og password findes, om roller er user eller admin - default er user - om password er stærkt nok)
    if(!username || !password || !role){
        return res.status(400).json({ message: "Udfyld alle felter" });
    }
    if(role !== "user" && role !== "admin"){
        return res.status(400).json({ message: "Ugyldig rolle" });
    }
    if(!isStrongPassword(password)){
        return res.status(400).json({ message: "Password er ikke stærkt nok" });
    }

    //læs brugere fra fil   
    const users = readUsers();

    //tjek for duplikat username
    const existingUser = users.find(u => u.username === username);
    if(existingUser){
        return res.status(400).json({ message: "Vælg et andet brugernavn" });
    }
    //hash password
    const hashedPassword = await hashPassword(password);

    //opret bruger objekt
    const newUser = {
        username,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
    };

    //gem bruger i fil
    users.push(newUser);
    saveUsers(users);

    //returnér success response
    res.status(201).json({ message: "Bruger oprettet" });
})

router.post("/login", async (req,res)=>{
    //læs username og password fra request body
    const { username, password } = req.body;

    //valideér input
    if(!username.trim() || !password.trim()){
        return res.status(400).json({ message: "Udfyld alle felter" });
    }

    //læs brugere fra fil
    const users = readUsers();

    //find bruger
    const user = users.find(u => u.username === username);
    if(!user){
        return res.status(400).json({ message: "Forkert brugernavn eller password" });
    }

    //sammenlign password
    const isMatch = await comparePassword(password, user.password);
    if(!isMatch){
        return res.status(400).json({ message: "Forkert brugernavn eller password" });
    }

    //gem bruger i session
    req.session.user = {
        username: user.username,
        role: user.role
    };

    //returnér success response
    res.status(200).json({ 
        message: "Login successful",
        user: {
            username: user.username,
            role: user.role
        }
     });
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
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logout successful" });
    });
});

module.exports = router;