const downloadFile = require("./download-file");
const { existsSync, mkdirSync } = require("fs");
const { join } = require('path');
const URL = require('url');
const log = require('./log');
const fs = require('fs');
const tar = require('tar');

function downloadFileAsync(file, options) {
  return new Promise((resolve, reject) => {
    downloadFile(file, options, (error, path) => {
      if (error) reject(error);
      resolve(path);
    })
  });
}

require('colors');

const baseDirectory = "./tarballs";
const tarballs = [];

async function downloadFromPackageLock(packageLock) {

  if (!existsSync(baseDirectory)) {
    mkdirSync(baseDirectory);
  }

  _enumerateDependencies(packageLock.dependencies);

  _downloadTarballs();
}

async function downloadFromSet(tarballsSet) {
  tarballs.push(...Array.from(tarballsSet).map(url => ({ url, directory: _convertUrlToDirectory(url) })));
  _downloadTarballs();
}

function _enumerateDependencies(dependencies) {
  for (const dependencyName in dependencies) {
    const dependency = dependencies[dependencyName];
    if (dependency.resolved) {
      tarballs.push({ url: dependency.resolved, directory: dependencyName });
    }
    if (dependency.dependencies) {
      _enumerateDependencies(dependency.dependencies);
    }
  }
}

function _downloadTarballs() {
  log(['downloading tarballs'.bgGreen], { count: tarballs.length });
  tarballs.forEach(({ url, directory }, i, arr) => {
    const position = `${i + 1}/${arr.length}`;
    log(['downloading'.cyan, position], url);

    _downloadFileWithRetry(url, join(baseDirectory, directory), position, 10);
  });
}

async function _downloadFileWithRetry(url, directory, position, count) {
  try {
    const path = await downloadFileAsync(url, { directory });
    if (!existsSync(path)) throw new Error('tgz does not exist ' + path);
    _validateTarball(path);
    log(['downloaded tgz'.green, position], url);
  } catch (error) {
    log(['failed download tgz'.red], error.message, url, count);
    if (count > 0) _downloadFileWithRetry(url, directory, position, count - 1);
  }
}

function _validateTarball(path) {
  try {
    tar.list({ f: path, sync: true });
  } catch (error) {
    log(['download error'.red, 'deleting tgz'.yellow], path);
    fs.unlinkSync(path);
  }
}

function _convertUrlToDirectory(url) {
  return URL.parse(url).path.split('/-/')[0].substring(1);
}

module.exports = {
  downloadFromPackageLock,
  downloadFromSet
};
