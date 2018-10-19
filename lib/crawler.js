const request = require('request-promise');
const semver = require('semver');
const util = require('util');
const logger = require('./logger');

require('colors');

const { npmRegistry } = require('./constants');

let cacheHits = 1;
let registryHits = 1;

const packagesCache = new Map();
const tarballs = new Set();

/**
 * @typedef DependenciesOptions
 * @property {string} name
 * @property {string} version
 * @property {boolean} devDependencies
 * @property {boolean} peerDependencies
 * @property {string} outputPrefix
 *
 * @param { DependenciesOptions } options
 * @returns { Promise<Set<string>> }
 */
async function getDependencies(options) {
  const packageJson = await _retrievePackageVersion(options);
  if (!packageJson) {
    logger(['ERROR'.red], 'failed to retrieve version of package', options.name, options.version);
    return new Set();
  }
  if (tarballs.has(packageJson.dist.tarball)) return tarballs;

  tarballs.add(packageJson.dist.tarball);

  await _getDependenciesFrom(packageJson.dependencies, 'dependency '.magenta);

  if (options.devDependencies) {
    await _getDependenciesFrom(packageJson.devDependencies, 'devDependency '.magenta);
  }

  if (options.peerDependencies) {
    await _getDependenciesFrom(packageJson.peerDependencies, 'peerDependency '.magenta);
  }

  return tarballs;
}

/**
 * @typedef PackageJsonDependenciesOptions
 * @property packageJson
 * @property {boolean} devDependencies
 * @property {boolean} peerDependencies
 *
 * @param { PackageJsonDependenciesOptions } options
 */
async function getPackageJsonDependencies(options) {
  const { packageJson } = options;

  await _getDependenciesFrom(packageJson.dependencies, 'dependency '.magenta);

  if (options.devDependencies) {
    await _getDependenciesFrom(packageJson.devDependencies, 'devDependency '.magenta);
  }

  if (options.peerDependencies) {
    await _getDependenciesFrom(packageJson.peerDependencies, 'peerDependency '.magenta);
  }

  return tarballs;
}

async function _retrievePackageVersion({ name, version, outputPrefix = '' }) {
  const uri = `${npmRegistry}/${name.replace('/', '%2F')}`;

  if (packagesCache.has(name)) {
    logger(['cache'.yellow, cacheHits], `retrieving ${outputPrefix}${name.cyan} ${(version || '').cyan}`);
    cacheHits++;
    const allPackageVersionsDetails = packagesCache.get(name);
    const maxSatisfyingVersion = _getMaxSatisfyingVersion(allPackageVersionsDetails, version);
    return allPackageVersionsDetails.versions[maxSatisfyingVersion];
  }

  logger(['registry'.green, registryHits], `retrieving ${outputPrefix}${name.cyan} ${(version || '').cyan}`);
  registryHits++;
  const allPackageVersionsDetails = await _retryGetRequest(uri, 3);
  packagesCache.set(name, allPackageVersionsDetails);
  const maxSatisfyingVersion = _getMaxSatisfyingVersion(allPackageVersionsDetails, version);
  return allPackageVersionsDetails.versions[maxSatisfyingVersion];
}

async function _getDependenciesFrom(dependenciesObject, outputPrefix) {
  const dependencies = Object.keys(dependenciesObject || {});
  await Promise.all(dependencies.map(dependency => getDependencies({
    name: dependency,
    version: dependenciesObject[dependency],
    outputPrefix,
  })));
}

function _getMaxSatisfyingVersion(allPackageVersionsDetails, version) {
  if (util.isNullOrUndefined(version)) {
    return allPackageVersionsDetails['dist-tags'].latest;
  }
  const versions = Object.keys(allPackageVersionsDetails.versions);
  return semver.maxSatisfying(versions, version);
}

async function _retryGetRequest(uri, count) {
  try {
    return await request({ uri, json: true, timeout: 3000 });
  } catch (error) {
    logger([`failed download ${error.cause.code}`.red], uri, count);
    if (error.cause.code === 'ETIMEDOUT' || error.cause.code === 'ESOCKETTIMEDOUT') {
      return _retryGetRequest(uri, count);
    }
    if (count > 0) {
      return _retryGetRequest(uri, count - 1);
    }
    throw error;
  }
}

module.exports = {
  getDependencies,
  getPackageJsonDependencies,
};
