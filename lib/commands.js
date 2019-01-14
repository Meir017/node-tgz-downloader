
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


function formatPackageStringIntoMap(packageStr) {
  let splitted = packageStr.split("@");
  let formatted = {name: splitted[0]};
  if(splitted.length > 1) {
      formatted.version = splitted[1];
  }
  return formatted;
}


/**
 * @param {{name: string, version: ?string}} package
 * @param {{ directory: string, devDependencies: boolean, peerDependencies: boolean }} options
 */
async function packageCommand(packages, options = {}) {
  let tarballsSet = new Set();
  if(!Array.isArray(packages))
  {
    packages = [packages];
  }
  packages = packages.map(formatPackageStringIntoMap);
  for(let curPackage of packages) {
    let {name, version} = curPackage;
    tarballsSet = new Set([...tarballsSet, ...await crawler.getDependencies({
      name,
      version,
      devDependencies: options.devDependencies,
      peerDependencies: options.peerDependencies,
    })]);
  }
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
