const authRoutes = require('./routes/authRoutes');

const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use("/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});