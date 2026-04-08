const express = require("express");
const router = express.Router();
const { requireUser, requireAdmin } = require("../middleware/authMiddleware.js");

router.post("/quiz",
    requireUser,
    requireAdmin,
    (req,res) => { 
            return res.status(200).json({ 
                message: "Admin adgang OK",
                user: { 
                    username: req.user.username,
                    role: req.user.role
                }   
            }); 
    });

module.exports = router;