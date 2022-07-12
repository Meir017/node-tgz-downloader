
const { retrieveFile } = require('./uri-retriever');
const { generatePackageJson } = require('./npm-search');
const { Crawler } = require('./crawler');
const downloader = require('./downloader');
const generator = require('./generator');

/**
 * @param {string} uri
 * @param {{ directory: string, registry?: string }} options
 */
async function packageLockCommand(uri, options = {}) {
  const packageLock = await retrieveFile(uri);
  downloader.downloadFromPackageLock(packageLock, options);
}

/**
 * @param {string} name
 * @param {string} version
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean, registry?: string }} options
 */
async function packageCommand(name, version, options = {}) {
  const crawler = new Crawler();
  const tarballsSet = await crawler.getDependencies({
    name,
    version,
    ...options
  });
  downloader.downloadFromIterable(tarballsSet, options);
}

/**
 * @param {string} uri
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean, registry?: string }} options
 */
async function packageJsonCommand(uri, options = {}) {
  const packageJson = await retrieveFile(uri);
  const crawler = new Crawler();
  const tarballsSet = await crawler.getPackageJsonDependencies({
    packageJson,
    ...options
  });
  downloader.downloadFromIterable(tarballsSet, options);
}

/**
* @param {string} keyword
* @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean, registry?: string }} options
*/
async function searchCommand(keyword, options = {}) {
  const packageJson = await generatePackageJson({ keyword });
  const crawler = new Crawler();
  const tarballsSet = await crawler.getPackageJsonDependencies({
    packageJson,
    ...options
  });
  downloader.downloadFromIterable(tarballsSet, options.directory);
}

/**
* @param {string} keyword
* @param {{ outputFile: string, devDependencies: boolean, peerDependencies: boolean, registry?: string }} options
*/
async function generateCommand(name, version, options) {
  const crawler = new Crawler();
  const tarballsSet = await crawler.getDependencies({
    name,
    version,
    ...options
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

function parseConcurrency(value) {
  const concurrency = parseInt(value, 10);
  if (isNaN(concurrency) || concurrency < 1) {
      throw new Error('Concurrecy value should be greater than 0.');
  }
  return concurrency;
}


module.exports = {
  packageLockCommand,
  packageCommand,
  packageJsonCommand,
  searchCommand,
  generateCommand,
  fromGeneratedCommand,
  parseConcurrency
};
