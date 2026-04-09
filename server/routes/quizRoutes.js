const express = require('express');
const router = express.Router();

const fileHandler = require('../utils/fileHandler'); 

let activeQuizzes = {};

function getQuizzes() {
     const data = fileHandler.getData('quizzes');
     return typeof data === 'string' ? JSON.parse(data) : data;
}



router.get("/:id/start", (req, res) => {
    const quizId = req.params.id;
    const allQuizzes = getQuizzes();
    
    const quiz = allQuizzes.find(q => q.id === quizId || q.id === Number(quizId));
    if (!quiz) {
        return res.status(404).json({ error: "Quizzen blev ikke fundet i databasen" });
    }

    //spørgsmålene blandes

    const shuffledQuestions = JSON.parse(JSON.stringify(quiz.questions))
    .sort(() => Math.random() - 0.5);

    //gem state i server memory
    activeQuizzes[quizId] = {
        questions: shuffledQuestions,
        currentIndex: 0,
        score: 0
    };

    res.json({
        quizId: quizId,
        question: shuffledQuestions[0],
        totalQuestions: shuffledQuestions.length
    });
});

router.post("/:id/answer", (req, res) => {
    const quizId = req.params.id;
    const userAnswer = req.body.answer;

    const quizState = activeQuizzes[quizId];

    if (!quizState) {
        return res.status(404).json({ error: "Quiz ikke fundet eller ikke startet" });
    }

    const currentQuestion = quizState.questions[quizState.currentIndex];

    let isCorrect = false;


    const answer = Array.isArray(userAnswer)
        ? userAnswer.map(Number)
        : Number(userAnswer);

    if (currentQuestion.type === "mc-single") {
        isCorrect = currentQuestion.correctAnswers.includes(Number(answer));
    }

    if (currentQuestion.type === "mc-multi") {
        const correct = currentQuestion.correctAnswers;

        isCorrect = 
        Array.isArray(answer) &&
        answer.length === correct.length &&
        answer.every(a => correct.includes(a));
    }

    if (currentQuestion.type === "cloze-text") {
        isCorrect = currentQuestion.correctAnswers
            .map(a => a.trim().toLowerCase())
            .includes(String(answer).trim().toLowerCase());
    }

    console.log("CURRENT QUESTION:", currentQuestion);
    console.log("USER ANSWER:", userAnswer);
    console.log("IS CORRECT:", isCorrect);
    console.log("INDEX:", quizState.currentIndex);
    console.log("CORRECT ANSWERS:", currentQuestion.correctAnswers);
    console.log("NORMALIZED ANSWER:", answer);
    console.log("ACTIVE QUIZZES:", activeQuizzes);
    console.log("QUIZ STATE:", quizState);

    if (isCorrect) {
        quizState.score++;
    }

    const isLastQuestion = quizState.currentIndex >= quizState.questions.length -1;

    if (isLastQuestion) {
        return res.json({
            message: "Quiz færdig",
            isCorrect,
            score: quizState.score,
            total: quizState.questions.length
        });
    }

    quizState.currentIndex++;

    return res.json({
        isCorrect,
        score: quizState.score,
        nextQuestion: quizState.questions[quizState.currentIndex],
        currentIndex: quizState.currentIndex,
        total: quizState.questions.length
    });
});

module.exports = router;