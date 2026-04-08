const { readUsers } = require("../utils/fileHandler.js");

function requireUser(req, res, next) {
    try {
        if (!req.session || !req.session.user || !req.session.user.username) {
            return res.status(401).json({ message: "Ikke logget ind" });
        }

        const sessionUsername = String(req.session.user.username).trim().toLowerCase();
        const users = readUsers();
        const user = users.find((u) => u.username.trim().toLowerCase() === sessionUsername);

        if (!user) {
            return res.status(401).json({ message: "Bruger findes ikke længere" });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("Fejl i requireUser:", err);
        res.status(500).json({ message: "Serverfejl i auth middleware" });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user) {
       return res.status(401).json({ message: "Ikke logget ind" });
    }

    if (!req.user.role || req.user.role !== "admin") {
        return res.status(403).json({ message: "Ingen adgang" });
    }

    next();
}


module.exports = {
    requireUser,
    requireAdmin
};