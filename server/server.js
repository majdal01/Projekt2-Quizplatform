const express = require('express');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
require('dotenv').config();



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json())

app.get("/quiz", (req, res) => {
    const data = fs.readFileSync(path.join(__dirname,"quizzes", "express.json"), "utf-8");
    const quiz = JSON.parse(data);

    res.json(quiz);
});
//ROUTES
const adminRoutes = require('./routes/adminRoutes');

//CONNECTION TIL ROUTES
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});