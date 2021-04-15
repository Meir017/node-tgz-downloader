const defaultNpmRegistry = 'http://registry.npmjs.org';

/**
 * 
 * @param {{ registry?: string }} options 
 */
function getNpmRegistry(options = {}) {
  return options.registry || defaultNpmRegistry;
}

module.exports = {
  getNpmRegistry
};
