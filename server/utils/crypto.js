const bcrypt = require('bcrypt');

function isStrongPassword(password){
    // Mindst 8 tegn, mindst et stort bogstav, mindst et lille bogstav, mindst et tal og mindst et specialtegn
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

async function hashPassword(password){
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

async function comparePassword(password, hash){
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}

module.exports = {
    isStrongPassword,
    hashPassword,
    comparePassword
}