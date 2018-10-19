const fs = require('fs');
const { isAbsolute, join } = require('path');
const request = require('request-promise');

/**
 * @param { string } uri
 */
async function retrieveFile(uri) {
  uri = uri.startsWith('http') || isAbsolute(uri) ? uri : join(process.cwd(), uri);
  if (fs.existsSync(uri)) {
    return uri.endsWith('json') ? require(uri) : fs.readFileSync(uri).toString();
  }
  try {
    return await request({ uri, json: uri.endsWith('json') });
  } catch (error) {
    console.error(`failed to download the file from ${uri}`);
    process.exit(1);
  }
}

module.exports = {
  retrieveFile,
};
