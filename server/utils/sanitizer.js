const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
  allowedTags: [ 'b', 'i', 'em', 'strong', 'br', 'span', 'p', 'ul', 'li', 'ol' ],
  allowedAttributes: {
    'span': [ 'class', 'style' ] 
  }
};

function sanitizeQuizData(data) {
  if (typeof data === 'string') {
    return sanitizeHtml(data, sanitizeOptions);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeQuizData(item));
  }
  if (typeof data === 'object' && data !== null) {
    const sanitizedObject = {};
    for (const key in data) {
      sanitizedObject[key] = sanitizeQuizData(data[key]);
    }
    return sanitizedObject;
  }
  return data;
}

function validateQuizData(data) {
    if (!data || typeof data !== 'object') {
        return "Ugyldigt dataformat. Det skal være et JSON-objekt.";
    }
    if (!data.title || typeof data.title !== 'string') {
        return "Quizzen mangler en gyldig 'title'.";
    }
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
        return "En quiz skal have et 'questions' array med mindst ét spørgsmål.";
    }

    for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        if (!q.type || !['mc-single', 'mc-multi', 'cloze-text'].includes(q.type)) {
            return `Spørgsmål ${i + 1} har en ugyldig eller manglende 'type' (skal være 'mc-single', 'mc-multi' eller 'cloze-text').`;
        }
        if (!q.question || typeof q.question !== 'string') {
            return `Spørgsmål ${i + 1} mangler en tekst i 'question'.`;
        }
        if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
            return `Spørgsmål ${i + 1} mangler 'correctAnswers'.`;
        }
        if (q.type === 'mc-single' || q.type === 'mc-multi') {
            if (!Array.isArray(q.options) || q.options.length < 2) {
                return `Spørgsmål ${i + 1} (${q.type}) kræver et 'options' array med mindst to svarmuligheder.`;
            }
        }
    }
    return null; 
}

module.exports = { sanitizeQuizData, validateQuizData };