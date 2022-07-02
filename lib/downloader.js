const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const URL = require('url');
const fs = require('fs');
const tar = require('tar');
const logger = require('./logger');
const downloadFileAsync = require('./download-file');
const urlResolver = require('./url-resolver');

require('colors');

/**
 * @param {{directory: string, registry?: string, concurrency?: number}} options
 */
function downloadFromPackageLock(packageLock, options) {
  const tarballs = [];
  _enumerateDependencies(tarballs, packageLock.dependencies, options);

  return _downloadTarballs(tarballs, options.directory, options.concurrency);
}

/**
 * @param { Iterable<string> | ArrayLike<string> } tarballsIterable
 * @param {{directory: string, registry?: string, concurrency?: number}} options
 */
function downloadFromIterable(tarballsIterable, options) {
  const tarballs = Array.from(tarballsIterable)
    .map(url => ({ url: urlResolver.resolve(url, options), directory: _convertUrlToDirectory(url) }));
  return _downloadTarballs(tarballs, options.directory, options.concurrency);
}

/**
 * @param {{directory: string, registry?: string}} options
 */
function _enumerateDependencies(tarballs, dependencies, options) {
  for (const [dependencyName, dependency] of Object.entries(dependencies)) {
    if (dependency.resolved) {
      tarballs.push({ url: urlResolver.resolve(dependency.resolved, options), directory: dependencyName });
    }
    if (dependency.dependencies) {
      _enumerateDependencies(tarballs, dependency.dependencies, options);
    }
  }
}

function _downloadTarballs(tarballs, baseDirectory = './tarballs', concurrency = Infinity) {
  if (!existsSync(baseDirectory)) {
    mkdirSync(baseDirectory);
  }

  logger([`downloading tarballs (concurrency: ${concurrency})`.bgGreen], { count: tarballs.length });

  // Note: `p-limit` is an ESM-only module
  const download = import('p-limit').then(({ default: pLimit }) => {
    const limit = pLimit(concurrency);
    const promises = tarballs.map(({ url, directory }, i, arr) => {
      const position = `${i + 1}/${arr.length}`;
      logger(['downloading'.cyan, position], url);

      return limit(() => _downloadFileWithRetry(url, join(baseDirectory, directory), position, 10));
    });
    return Promise.all(promises);
  })

  return download;
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
