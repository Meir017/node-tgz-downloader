const fs = require('fs');
const url = require('url');
const { http, https } = require('follow-redirects'); 
const mkdirp = require('mkdirp');
const logger = require('./logger');
const httpsAgent = require('./https-agent');

function downloadFileAsync(file, options = {}) {
  const uri = file.split('/');
  options.filename = options.filename || uri[uri.length - 1];
  options.timeout = options.timeout || 20000;
  options.maxRedirects = options.maxRedirects || 5; 
  const path = require('path').join(options.directory, options.filename);

  if (fs.existsSync(path)) {
    logger(['skipping download'.yellow], path);
    return Promise.resolve({ path, duration: 0 });
  }

  const fileUrl = url.parse(file);
  let protocol = fileUrl.protocol;
  if (!protocol) {
    file = `http://${file}`; 
    protocol = 'http:';
  }

  const req = protocol === 'https:' ? https : http; 
  const start = Date.now();

  return new Promise((resolve, reject) => {
    let fileClose, responseEnd;
    const promises = [new Promise(x => fileClose = x), new Promise(x => responseEnd = x)];

    const reqOptions = {
      agent: httpsAgent.getAgent(req),
      maxRedirects: options.maxRedirects
    };

    const request = req.get(
      file,
      reqOptions,
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400) {
        } else if (response.statusCode === 200) {
          mkdirp(options.directory, (error) => {
            if (error) reject(error.message);
            const fileStream = fs.createWriteStream(path);
            response.pipe(fileStream);
            fileStream.on('close', fileClose);
          });
        } else {
          reject(`HTTP Error: ${response.statusCode}`);
        }
        response.on('end', responseEnd);
      }
    );

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
