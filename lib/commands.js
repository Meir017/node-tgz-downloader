
const { retrieveFile } = require('./uri-retriever');
const { generatePackageJson } = require('./npm-search');
const crawler = require('./crawler');
const downloader = require('./downloader');
const generator = require('./generator');

/**
 * @param {string} uri
 * @param {{ directory: string }} options
 */
async function packageLockCommand(uri, options = {}) {
  const packageLock = await retrieveFile(uri);
  downloader.downloadFromPackageLock(packageLock, options.directory);
}

/**
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
  downloader.downloadFromIterable(tarballsSet, options.directory);
}

/**
 * @param {string} uri
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean }} options
 */
async function packageJsonCommand(uri, options = {}) {
  const packageJson = await retrieveFile(uri);
  const tarballsSet = await crawler.getPackageJsonDependencies({
    packageJson,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies,
  });
  downloader.downloadFromIterable(tarballsSet, options.directory);
}

/**
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
  downloader.downloadFromIterable(tarballsSet, options.directory);
}

/**
* @param {string} keyword
* @param {{ outputFile: string, devDependencies: boolean, peerDependencies: boolean }} options
*/
async function generateCommand(name, version, options) {
  const tarballsSet = await crawler.getDependencies({
    name,
    version,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies
  });
  generator.saveToFile(Array.from(tarballsSet), options.outputFile);
}

/**
 * @param { string } uri 
 * @param {{ directory: string }} options 
 */
async function fromGeneratedCommand(uri, options) {
  const tarball = await generator.readFromFile(uri);
  downloader.downloadFromIterable(tarball, options.directory);
}

module.exports = {
  packageLockCommand,
  packageCommand,
  packageJsonCommand,
  searchCommand,
  generateCommand,
  fromGeneratedCommand
};
