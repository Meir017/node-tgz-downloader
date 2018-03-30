const downloadFile = require("download-file");
const { retrievePackageLock } = require("./package-lock-retriever");
const { existsSync, mkdirSync } = require("fs");
const { join } = require('path');

const baseDirectory = "./tarballs";
const tarballs = [];

async function downloadFromPackageLock(packageLockUri) {
  const packageLock = await retrievePackageLock(packageLockUri);

  if (!existsSync(baseDirectory)) {
    mkdirSync(baseDirectory);
  }

  _enumerateDependencies(packageLock.dependencies);

  console.log("downloading tarballs", { count: tarballs.length });

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
  tarballs.forEach(({ url, directory }, i, arr) => {
    console.log(`[${i + 1}/${arr.length}] downloading...`, url);
    downloadFile(url, { directory: join(baseDirectory, directory) });
  });
}

module.exports = {
  downloadFromPackageLock
};
