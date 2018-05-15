const downloadFile = require("download-file");
const { retrievePackageLock } = require("./package-lock-retriever");
const { existsSync, mkdirSync } = require("fs");
const { join } = require('path');
const URL = require('url');
const log = require('./log');

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
    
    downloadFile(url, { directory: join(baseDirectory, directory) },
      (error) => {
        if (error) log(['download error'.red, position], url, error);
        else return false;
      }
    );
  });
}

function _convertUrlToDirectory(url) { 
  return URL.parse(url).path.split('/-/')[0].substring(1);
}

module.exports = {
  downloadFromPackageLock,
  downloadFromSet
};
