const express = require('express');
const router = express.Router();
const { requireUser } = require("../middleware/authMiddleware.js");

const fileHandler = require('../utils/fileHandler'); 

let activeQuizzes = {};

function getQuizzes() {
     const data = fileHandler.getData('quizzes');
     return typeof data === 'string' ? JSON.parse(data) : data;
}

//Alle Quiz endpoint
router.get("/", requireUser, (req, res) => {
    try {
        const allQuizzes = getQuizzes();
        const quizList = allQuizzes.map(quiz => {
            return {
                id: quiz.id,
                title: quiz.title || quiz.name, 
                questionCount: quiz.questions ? quiz.questions.length : 0
            };
        });
        res.json(quizList);
    } catch (error) {
        console.error("Fejl ved hentning af quizzer:", error);
        res.status(500).json({ error: "Kunne ikke hente listen af quizzer" });
    }
});

router.get("/:id/start", requireUser, (req, res) => {
    const quizId = req.params.id;
    const userId = req.user.username;
    const allQuizzes = getQuizzes();
    const quiz = allQuizzes.find(q => q.id === quizId || q.id === Number(quizId));
    if (!quiz) {
        return res.status(404).json({ error: "Quizzen blev ikke fundet i databasen" });
    }

    //spørgsmålene blandes

    const shuffledQuestions = JSON.parse(JSON.stringify(quiz.questions))
    .sort(() => Math.random() - 0.5);

    //gem state i server memory
activeQuizzes[userId] = {
        quizId: quizId,
        questions: shuffledQuestions,
        currentIndex: 0,
        score: 0,
        startTime: new Date().toISOString() 
    };

    res.json({
        quizId: quizId,
        question: shuffledQuestions[0],
        totalQuestions: shuffledQuestions.length
    });
});

router.post("/:id/answer", requireUser, (req, res) => {
    const userId = req.user.username;
    const userAnswer = req.body.answer;

    const quizState = activeQuizzes[userId];

    if (!quizState) {
        return res.status(404).json({ error: "Quiz ikke fundet eller ikke startet" });
    }

    const currentQuestion = quizState.questions[quizState.currentIndex];

    const answer = Array.isArray(userAnswer)
        ? userAnswer.map(Number)
        : Number(userAnswer);

    console.log("CURRENT QUESTION:", currentQuestion);
    console.log("USER ANSWER:", userAnswer);
    console.log("INDEX:", quizState.currentIndex);
    console.log("CORRECT ANSWERS:", currentQuestion.correctAnswers);
    console.log("NORMALIZED ANSWER:", answer);
    console.log("ACTIVE QUIZZES:", activeQuizzes);
    console.log("QUIZ STATE:", quizState);

    let correctCount = 0;
    let wrongCount = 0;

    //MC-single
    if (currentQuestion.type === "mc-single") {
        const selected = answer;

        if (currentQuestion.correctAnswers.includes(selected)) {
            correctCount = 1;
        } else {
            wrongCount = 1;
        }
    }

    //MC-multi

    if (currentQuestion.type === "mc-multi") {
        const correct = currentQuestion.correctAnswers;

        answer.forEach(a => {
            if (correct.includes(a)) {
                correctCount++;
            } else {
                wrongCount++;
            }
        });
    }

    //Cloze-text

    if (currentQuestion.type === "cloze-text") {
        const normalized = String(answer).trim().toLowerCase();
        const correct = currentQuestion.correctAnswers
        .map(a => a.trim().toLowerCase());

        if (correct.includes(normalized)) {
            correctCount = 1;
        } else {
            wrongCount = 1;
        }
    }

    const deltaScore =
    (correctCount * 0.5) - (wrongCount * 0.5);

    quizState.score += deltaScore;
    quizState.score = Math.round(quizState.score * 10) / 10;



    const isLastQuestion = quizState.currentIndex === quizState.questions.length -1;

    if (isLastQuestion) {
        const endTime = new Date().toISOString();

        const newLog = {
            id: Date.now().toString(),
            userId: userId,
            quizId: quizState.quizId,
            startTime: quizState.startTime,
            endTime: endTime,
            score: quizState.score
        };

        let logs = fileHandler.getData('logs');
        if (!Array.isArray(logs)) logs = [];
        logs.push(newLog);
        fileHandler.saveData('logs', logs);
        delete activeQuizzes[userId];

        return res.json({
            message: "Quiz færdig",
            score: quizState.score,
            total: quizState.questions.length
        });
    }

    quizState.currentIndex++;

    return res.json({
        deltaScore,
        score: quizState.score,
        nextQuestion: quizState.questions[quizState.currentIndex],
        currentIndex: quizState.currentIndex,
        total: quizState.questions.length
    });
});

router.get("/history", requireUser, (req, res) => {
    try {
        const userId = req.user.username; 
        let logs = fileHandler.getData('logs');
        if (!Array.isArray(logs)) logs = [];
        
        const allQuizzes = getQuizzes();

        const userHistory = logs
            .filter(log => log.userId === userId)
            .map(log => {
                const quiz = allQuizzes.find(q => String(q.id) === String(log.quizId));
                return {
                    id: log.id,
                    quizId: log.quizId,
                    quizTitle: quiz ? (quiz.title || quiz.name) : "Slettet / Ukendt quiz",
                    score: log.score,
                    startTime: log.startTime,
                    endTime: log.endTime
                };
            });
        userHistory.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

        res.json(userHistory);
    } catch (error) {
        console.error("Fejl ved hentning af historik:", error);
        res.status(500).json({ error: "Kunne ikke hente historik" });
    }
});

module.exports = router;