const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const mkdirp = require('mkdirp');
const logger = require('./logger');

/**
 * @param {string} file
 * @param {{ timeout: number, filename: string, directory: string }} options
 * @returns {Promise<{ path: string, duration: number }>}
 */
function downloadFileAsync(file, options = {}) {
  const uri = file.split('/');
  options.filename = options.filename || uri[uri.length - 1];
  options.timeout = options.timeout || 20000;

  const path = require('path').join(options.directory, options.filename);

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
    let fileClose; let
      responseEnd;
    const promises = [
      new Promise(x => fileClose = x),
      new Promise(x => responseEnd = x),
    ];
    const request = req.get(file, (response) => {
      if (response.statusCode === 200) {
        mkdirp(options.directory, (error) => {
          if (error) {
            reject(error.message);
          }
          const file = fs.createWriteStream(path);
          response.pipe(file);
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
