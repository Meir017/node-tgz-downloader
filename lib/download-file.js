const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const mkdirp = require('mkdirp');
const logger = require('./logger');
const httpsAgent = require('./https-agent');

/**
 * @param {string} file
 * @param {{directory, filename: string | undefined, timeout: string | undefined }} options
 * @param packageJson
 * @returns {Promise<{ path: string, duration: number }>}
 */
function downloadFileAsync(file, options = {}, packageJson) {
  const uri = file.split('/');
  options.filename = options.filename || uri[uri.length - 1];
  options.timeout = options.timeout || 20000;
  const p = require('path');
  const path = p.join(options.directory, options.filename);
  const jsonPath = p.join(options.directory, 'package.json');
  if (fs.existsSync(path)) {
    logger(['skipping download'.yellow], path);
    return Promise.resolve({ path, duration: 0 });
  }

  let req;
  if (url.parse(file).protocol === null) {
    file = `http://${file}`;
    req = http;
  } else if (url.parse(file).protocol === 'https:') {
    req = https;
  } else {
    req = http;
  }
  const start = Date.now();
  return new Promise((resolve, reject) => {
    let fileClose;
    let
      responseEnd;
    const promises = [
      new Promise(x => fileClose = x),
      new Promise(x => responseEnd = x),
    ];

    let reqOptions = {
      agent: httpsAgent.getAgent(req),
    }

    const request = req.get(
      file,
      reqOptions,
      (response) => {
        if (response.statusCode === 200) {
          mkdirp(options.directory, (error) => {
            if (error) {
              reject(error.message);
            }
            const file = fs.createWriteStream(path);
            response.pipe(file);
            packageJson && fs.writeFileSync(jsonPath, JSON.stringify(packageJson))
            file.on('close', fileClose);
          });
        } else {
          reject(response.statusCode);
        }
        response.on('end', responseEnd);
      });
    request.setTimeout(options.timeout, () => {
      request.abort();
      reject(`Timed out after ${options.timeout}ms`);
    });
    request.on('error', error => reject(error));
    Promise.all(promises).then(() => {
      const duration = Date.now() - start;
      resolve({ path, duration });
    });
  });
}

module.exports = downloadFileAsync;
