const downloadFile = require("download-file");
const { retrievePackageLock } = require("./package-lock-retriever");
const { existsSync, mkdirSync } = require("fs");

const directory = "./tarballs";
const tarballs = [];

async function downloadFromPackageLock(packageLockUri) {
  const packageLock = await retrievePackageLock(packageLockUri);

  _ensureDirectoryExists();

  _enumerateDependencies(packageLock.dependencies);

  console.log("downloading tarballs", { count: tarballs.length });

  _downloadTarballs();
}

function _enumerateDependencies(dependencies) {
  for (const dependencyName in dependencies) {
    const dependency = dependencies[dependencyName];
    if (dependency.resolved) {
      tarballs.push({
        filename: `${dependencyName}-${dependency.version}.tgz`,
        url: dependency.resolved
      });
    }
    if (dependency.dependencies) {
      _enumerateDependencies(dependency.dependencies);
    }
  }
}

function _ensureDirectoryExists() {
  if (!existsSync(directory)) {
    mkdirSync(directory);
  }
}

function _downloadTarballs() {
  tarballs.forEach(({ url, filename }, i, arr) => {
    console.log(`[${i + 1}/${arr.length}] downloading...`, { filename, url });
    downloadFile(url, { directory, filename });
  });
}

module.exports = {
  downloadFromPackageLock
};
