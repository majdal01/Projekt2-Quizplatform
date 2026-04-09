const fs = require('fs');
const path = require('path');

const getFilePath = (filename) => {
    return path.join(__dirname, `../data/${filename}.json`);
};

const getData = (filename) => {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const jsonData = fs.readFileSync(filePath);
    return JSON.parse(jsonData);
};

const saveData = (filename, data) => {
    const filePath = getFilePath(filename);
    const stringifyData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, stringifyData);
};

function readUsers(){
    return getData('users');
}

function saveUsers(users){
    saveData('users', users);
}

module.exports = { getData, saveData, readUsers, saveUsers };