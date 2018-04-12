const request = require('request-promise');
const semver = require('semver');
const util = require('util');

require('colors');

const npmRegistry = 'http://registry.npmjs.org';

let cacheHits = 1;
let registryHits = 1;

const packagesCache = new Map();
const tarballs = new Set();

/**
 * @typedef DependenciesOptions
 * @property {string} name
 * @property {string} version
 */

/**
 * @param { DependenciesOptions } options 
 */
async function getDependencies(options) {
    
    const packageJson = await _retrievePackageVersion(options);
    
    if(tarballs.has(packageJson.dist.tarball)) return tarballs;
    
    tarballs.add(packageJson.dist.tarball);
    
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    await Promise.all(dependencies.map(async dependency => {
        const dependenciesTarballs = await getDependencies({ name: dependency, version: packageJson.dependencies[dependency] });        
    }));
    
    return tarballs;
}

async function _retrievePackageVersion({ name, version }) {
    const uri = `${npmRegistry}/${name.replace('/', '%2F')}`;
    
    if(packagesCache.has(name)) {
        console.log(`[${'cache'.yellow}][${cacheHits++}] retrieving package ${name.cyan} ${(version || '').cyan}`);
        const allPackageVersionsDetails =  packagesCache.get(name);
        const maxSatisfyingVersion = _getMaxSatisfyingVersion(allPackageVersionsDetails, version);
        return allPackageVersionsDetails.versions[maxSatisfyingVersion];
    }
    
    console.log(`[${'registry'.green}][${registryHits++}] retrieving package ${name.cyan} ${(version || '').cyan}`);
    const allPackageVersionsDetails = await request({ uri, json: true });
    packagesCache.set(name, allPackageVersionsDetails);
    const maxSatisfyingVersion = _getMaxSatisfyingVersion(allPackageVersionsDetails, version);
    return allPackageVersionsDetails.versions[maxSatisfyingVersion];
}

function _getMaxSatisfyingVersion(allPackageVersionsDetails, version) {
    if(util.isNullOrUndefined(version)) {
        return allPackageVersionsDetails['dist-tags'].latest;
    }
    const versions = Object.keys(allPackageVersionsDetails.versions);
    return semver.maxSatisfying(versions, version);
}

module.exports = {
    getDependencies
}