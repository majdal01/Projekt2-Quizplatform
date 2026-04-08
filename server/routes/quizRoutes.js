let activeQuizzes = {};

function getQuiz() {
    const data = fs.readFileSync(
        path.join(__dirname, "quizzes", "express.json"),
        "utf-8"
    );

    return JSON.parse(data);
}

app.get("/quiz/:id/start", (req, res) => {
    const quizId = req.params.id;

    const quiz = getQuiz();

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

app.post("/quiz/:id/answer", (req, res) => {
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
        : userAnswer;

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


    res.json({
        message: "STEP 4B OK",
        currentQuestion,
        userAnswer,
        isCorrect
    });

    quizState.currentIndex++;
});