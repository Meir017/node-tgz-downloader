const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const URL = require('url');
const fs = require('fs');
const tar = require('tar');
const logger = require('./logger');
const downloadFileAsync = require('./download-file');
const urlResolver = require('./url-resolver');

require('colors');
const {getUri, retrieveFile} = require("./uri-retriever");
const {Crawler} = require("./crawler");

/**
 * @param packageLock
 * @param {{directory: string, registry?: string, concurrency?: number}} options
 */
async function downloadFromPackageLock(packageLock, options) {
	const crawler = new Crawler();

	const tarballs = [];
  _enumerateDependencies(tarballs, packageLock.dependencies, options);
	async function getPackageJson(dependencies) {
		for (const [, dependency] of Object.entries(dependencies)) {
			const {uri, name} = getUri(dependency.resolved)
			const res = await retrieveFile(uri)
			crawler.packagesCache.set(name, res);
		}
	}
	await getPackageJson(packageLock.dependencies)
  return _downloadTarballs(tarballs, options.directory, options.concurrency, crawler.packagesCache);
}

/**
 * @param { Iterable<string> | ArrayLike<string> } tarballsIterable
 * @param {string} options
 * @param packagesCache
 */
function downloadFromIterable(tarballsIterable, options, packagesCache) {
  const tarballs = Array.from(tarballsIterable)
    .map(url => ({ url: urlResolver.resolve(url, options), directory: _convertUrlToDirectory(url) }));
  return _downloadTarballs(tarballs, options.directory, options.concurrency, packagesCache);
}

/**
 * @param tarballs
 * @param {{resolved}} dependencies
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

function _downloadTarballs(tarballs, baseDirectory = './tarballs', concurrency = Infinity, packagesCache) {
  if (!existsSync(baseDirectory)) {
    mkdirSync(baseDirectory, { recursive: true, mode: '0777' });
    // mkdirSync(baseDirectory);
  }
  logger([`downloading tarballs (concurrency: ${concurrency})`.bgGreen], { count: tarballs.length });

  // Note: `p-limit` is an ESM-only module
	return import('p-limit').then(({default: pLimit}) => {
	  const limit = pLimit(concurrency);
	  const promises = tarballs.map(({url, directory}, i, arr) => {
		  const position = `${i + 1}/${arr.length}`;
		  logger(['downloading'.cyan, position], url);
		  const packageJson = packagesCache && packagesCache.get(directory)
		  return limit(() => _downloadFileWithRetry(url, join(baseDirectory, directory), position, 10, packageJson));
	  });
	  return Promise.all(promises);
  });
}
async function _downloadFileWithRetry(url, directory, position, count, packageJson) {
  try {
    const { path, duration } = await downloadFileAsync(url, { directory }, packageJson);
    if (!existsSync(path)) {
      throw new Error(`tgz does not exist ${path}`);
    }
    if (_validateTarball(path)) logger(['downloaded tgz'.green, position], url, `${duration}ms`.gray);
    else throw new Error('Error downloading tgz, retrying.. ');
  } catch (error) {
    logger(['failed download tgz'.red], error.message, url, count);
    if (count > 0) await _downloadFileWithRetry(url, directory, position, count - 1);
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
