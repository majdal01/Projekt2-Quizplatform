const express = require('express');
const router = express.Router();

const fileHandler = require('../utils/fileHandler'); 
const { sanitizeQuizData } = require('../utils/sanitizer');


router.get('/logs', (req, res) => {
    // MANGLER AUTH CHECK
    const logs = fileHandler.getData('logs');
    res.json(logs);
});

router.post('/quiz', (req, res) => {
    //MANGLER AUTH
    try {
        const rawQuizData = req.body; 
        const cleanQuizData = sanitizeQuizData(rawQuizData);
        const allQuizzes = fileHandler.getData('quizzes');
        const newQuiz = {
            id: Date.now().toString(),
            ...cleanQuizData,
            createdAt: new Date().toISOString()
        };
        allQuizzes.push(newQuiz);
        fileHandler.saveData('quizzes', allQuizzes);
        res.status(201).json({ 
            message: "Quiz oprettet og gemt korrekt!", 
            quizId: newQuiz.id 
        });
    } catch (error) {
        res.status(500).json({ error: "Kunne ikke gemme quizzen" });
    }
});

router.delete('/quiz/:id', (req, res) => {
    //MANGLER AUTH
    try {
        const quizId = req.params.id;
        const allQuizzes = fileHandler.getData('quizzes');
        const quizExists = allQuizzes.some(q => q.id === quizId);
        if (!quizExists) {
            return res.status(404).json({ error: "Quizzen blev ikke fundet" });
        }
        const updatedQuizzes = allQuizzes.filter(quiz => quiz.id !== quizId);
        fileHandler.saveData('quizzes', updatedQuizzes);
        res.json({ message: `Quiz med id: ${quizId} er blevet slettet.` });
    } catch (error) {
        res.status(500).json({ error: "Der skete en fejl under sletning" });
    }
});

module.exports = router;