const downloadFile = require('download-file');
const { retrievePackageLock } = require('./package-lock-retriever');
const { existsSync, mkdirSync } = require('fs');

const directory = './tarballs';

async function downloadFromPackageLock(packageLockUri) {

    const packageLock = await retrievePackageLock(packageLockUri);

    _ensureDirectoryExists();

    const tarballs = [];

    _enumerateDependencies(packageLock.dependencies);

    downloadTarballs(tarballs);
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

function downloadTarballs(tarballs) {
    tarballs.forEach(({ url, filename }) => {
        downloadFile(url, { directory, filename });
    });
}

module.exports = {
    downloadFromPackageLock
}