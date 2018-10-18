const downloadFileAsync = require("./download-file");
const { existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const URL = require("url");
const log = require("./log");
const fs = require("fs");
const tar = require("tar");

require("colors");

async function downloadFromPackageLock(packageLock, directory) {
  const tarballs = [];
  _enumerateDependencies(tarballs, packageLock.dependencies);

  _downloadTarballs(tarballs, directory);
}

async function downloadFromSet(tarballsSet, directory) {
  const tarballs = Array.from(tarballsSet).map(url => ({ url, directory: _convertUrlToDirectory(url) }));
  _downloadTarballs(tarballs, directory);
}

function _enumerateDependencies(tarballs, dependencies) {
  for (const dependencyName in dependencies) {
    const dependency = dependencies[dependencyName];
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

  log(["downloading tarballs".bgGreen], { count: tarballs.length });
  tarballs.forEach(({ url, directory }, i, arr) => {
    const position = `${i + 1}/${arr.length}`;
    log(["downloading".cyan, position], url);

    _downloadFileWithRetry(url, join(baseDirectory, directory), position, 10);
  });
}
async function _downloadFileWithRetry(url, directory, position, count) {
  try {
    const { path, duration } = await downloadFileAsync(url, { directory });
    if (!existsSync(path)) {
      throw new Error("tgz does not exist " + path);
    }
    if (_validateTarball(path)) log(["downloaded tgz".green, position], url, `${duration}ms`.gray);
    else throw new Error("Error downloading tgz, retrying.. ");
  } catch (error) {
    log(["failed download tgz".red], error.message, url, count);
    if (count > 0) _downloadFileWithRetry(url, directory, position, count - 1);
  }
}

function _validateTarball(path) {
  try {
    tar.list({ f: path, sync: true });
    return true;
  } catch (error) {
    log(["download error".red, "deleting tgz".yellow], path);
    fs.unlinkSync(path);
    return false;
  }
}

function _convertUrlToDirectory(url) {
  return URL.parse(url)
    .path.split("/-/")[0]
    .substring(1);
}

module.exports = {
  downloadFromPackageLock,
  downloadFromSet,
};
