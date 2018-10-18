
const { retrieveJsonFile } = require('./package-lock-retriever');
const { generatePackageJson } = require('./npm-search');
const crawler = require('./crawler');
const downloader = require('./downloader');

/**
 *
 * @param {string} uri
 * @param {{ directory: string }} options
 */
async function packageLockCommand(uri, options = {}) {
  const packageLock = await retrieveJsonFile(uri);
  downloader.downloadFromPackageLock(packageLock, options.directory);
}

/**
 *
 * @param {string} name
 * @param {string} version
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean }} options
 */
async function packageCommand(name, version, options = {}) {
  const tarballsSet = await crawler.getDependencies({
    name,
    version,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies,
  });
  downloader.downloadFromSet(tarballsSet, options.directory);
}

/**
 *
 * @param {string} uri
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean }} options
 */
async function packageJsonCommand(uri, options = {}) {
  const packageJson = await retrieveJsonFile(uri);
  const tarballsSet = await crawler.getPackageJsonDependencies({
    packageJson,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies,
  });
  downloader.downloadFromSet(tarballsSet, options.directory);
}

/**
*
* @param {string} keyword
* @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean }} options
*/
async function searchCommand(keyword, options = {}) {
  const packageJson = await generatePackageJson({ keyword });
  const tarballsSet = await crawler.getPackageJsonDependencies({
    packageJson,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies,
  });
  downloader.downloadFromSet(tarballsSet, options.directory);
}

module.exports = {
  packageLockCommand,
  packageCommand,
  packageJsonCommand,
  searchCommand,
};
