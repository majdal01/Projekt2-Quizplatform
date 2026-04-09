const bcryptjs = require('bcryptjs');

function isStrongPassword(password){
    // Mindst 8 tegn, mindst et stort bogstav, mindst et lille bogstav, mindst et tal og mindst et specialtegn (bredt sæt)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
    return strongPasswordRegex.test(password);
}

async function hashPassword(password){
    const saltRounds = 10;
    const salt = await bcryptjs.genSalt(saltRounds);
    const hash = await bcryptjs.hash(password, salt);
    return hash;
}

async function comparePassword(password, hash){
    const isMatch = await bcryptjs.compare(password, hash);
    return isMatch;
}

module.exports = {
    isStrongPassword,
    hashPassword,
    comparePassword
}