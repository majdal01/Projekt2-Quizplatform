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

module.exports = { sanitizeQuizData };