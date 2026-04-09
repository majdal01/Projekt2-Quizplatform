const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const rateLimit = require("express-rate-limit");


if (!process.env.REDIS_URL) {
    console.error("REDIS_URL mangler i .env. Stopper server af sikkerhedshensyn.");
    process.exit(1);
}

if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET mangler i .env. Stopper server af sikkerhedshensyn.");
    process.exit(1);
}

if (isProduction) {
    app.set("trust proxy", 1);
}

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
    console.error("Redis fejl:", err);
});

app.use(cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session({
    name: "quiz.sid",
    store: new RedisStore({
        client: redisClient,
        prefix: "quiz:sess:"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/quiz", quizRoutes);

async function startServer() {
    try {
        await redisClient.connect();
        app.listen(PORT, () => {
            console.log("Serveren kører på http://localhost:" + PORT);
        });
    } catch (err) {
        console.error("Kunne ikke forbinde til Redis. Stopper server.", err);
        process.exit(1);
    }
}

startServer();