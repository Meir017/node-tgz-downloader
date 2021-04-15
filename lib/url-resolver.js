/**
 * @param {string} url 
 * @param {{ registry?: string }} options 
 */
function resolve(url, options = {}) {
    if (!options.registry) return url;

    const urlObject = new URL(url);
    return urlObject.href.replace(urlObject.origin, options.registry);
}

module.exports = {
    resolve
};