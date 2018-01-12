const { existsSync } = require("fs");
const request = require('request-promise');

async function loadPackageLock(uri) {
  if (existsSync(uri)) {
    return require(uri);
  }
  try {
      return await request(uri);
  } catch (error) {
      console.error(`failed to download the package-lock.json file from ${uri}`);
      process.exit(1);
  }
}

module.exports = {
  retrievePackageLock
};
