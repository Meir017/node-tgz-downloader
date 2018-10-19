const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const URL = require('url');
const fs = require('fs');
const tar = require('tar');
const logger = require('./logger');
const downloadFileAsync = require('./download-file');

require('colors');

function downloadFromPackageLock(packageLock, directory) {
  const tarballs = [];
  _enumerateDependencies(tarballs, packageLock.dependencies);

  return _downloadTarballs(tarballs, directory);
}

/**
 * @param { Iterable<string> | ArrayLike<string> } tarballsIterable
 * @param { string } directory 
 */
function downloadFromIterable(tarballsIterable, directory) {
  const tarballs = Array.from(tarballsIterable)
    .map(url => ({ url, directory: _convertUrlToDirectory(url) }));
  return _downloadTarballs(tarballs, directory);
}

function _enumerateDependencies(tarballs, dependencies) {
  for (const [dependencyName, dependency] of Object.entries(dependencies)) {
    if (dependency.resolved) {
      tarballs.push({ url: dependency.resolved, directory: dependencyName });
    }
    if (dependency.dependencies) {
      _enumerateDependencies(tarballs, dependency.dependencies);
    }
  }
}

function _downloadTarballs(tarballs, baseDirectory = './tarballs') {
  if (!existsSync(baseDirectory)) {
    mkdirSync(baseDirectory);
  }

  logger(['downloading tarballs'.bgGreen], { count: tarballs.length });
  const promises = tarballs.map(({ url, directory }, i, arr) => {
    const position = `${i + 1}/${arr.length}`;
    logger(['downloading'.cyan, position], url);

    return _downloadFileWithRetry(url, join(baseDirectory, directory), position, 10);
  });
  return Promise.all(promises);  
}
async function _downloadFileWithRetry(url, directory, position, count) {
  try {
    const { path, duration } = await downloadFileAsync(url, { directory });
    if (!existsSync(path)) {
      throw new Error(`tgz does not exist ${path}`);
    }
    if (_validateTarball(path)) logger(['downloaded tgz'.green, position], url, `${duration}ms`.gray);
    else throw new Error('Error downloading tgz, retrying.. ');
  } catch (error) {
    logger(['failed download tgz'.red], error.message, url, count);
    if (count > 0) _downloadFileWithRetry(url, directory, position, count - 1);
  }
}

function _validateTarball(path) {
  try {
    tar.list({ f: path, sync: true });
    return true;
  } catch (error) {
    logger(['download error'.red, 'deleting tgz'.yellow], path);
    fs.unlinkSync(path);
    return false;
  }
}

function _convertUrlToDirectory(url) {
  return URL.parse(url)
    .path.split('/-/')[0]
    .substring(1);
}

module.exports = {
  downloadFromPackageLock,
  downloadFromIterable,
};
