const endOfLine = require('os').EOL;
const fs = require('fs');
const { retrieveFile } = require('./uri-retriever');

/**
 * @param { string[] } tarballs 
 * @param { string } outputFile 
 */
function saveToFile(tarballs, outputFile) {
    fs.writeFileSync(outputFile, tarballs.join(endOfLine));
}

/**
 * @param { string } uri
 * @returns { Promise<string[]> }
 */
async function readFromFile(uri) {
    const text = await retrieveFile(uri);
    return text.toString().split(endOfLine);
}

module.exports = {
    saveToFile,
    readFromFile
}