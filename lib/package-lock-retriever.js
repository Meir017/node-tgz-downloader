const { existsSync } = require("fs");
const { isAbsolute, join } = require('path');
const request = require('request-promise');

async function retrieveJsonFile(uri) {  
  uri = uri.startsWith('http') || isAbsolute(uri) ? uri : join(process.cwd(), uri);
  if (existsSync(uri)) {
    return require(uri);
  }
  try {
      return await request({ uri, json: true });
  } catch (error) {
      console.error(`failed to download the package-lock.json file from ${uri}`);
      process.exit(1);
  }
}

module.exports = {
  retrieveJsonFile
};
