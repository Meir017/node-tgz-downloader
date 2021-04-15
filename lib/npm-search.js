const request = require('request-promise');
const { getNpmRegistry } = require('./config');

/**
 *
 * @param {{ keyword: string, registry?: string }} options
 */
async function generatePackageJson(options) {
  const uri = `${getNpmRegistry(options)}/-/v1/search?text=keywords:${options.keyword}&size=1000`;
  const response = await request({ uri, json: true });

  const packageJson = response.objects.reduce((prev, curr) => {
    prev.dependencies[curr.package.name] = curr.package.version;
    return prev;
  }, { dependencies: {} });

  return packageJson;
}

module.exports = {
  generatePackageJson,
};
