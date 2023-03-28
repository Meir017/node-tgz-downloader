const fs = require('fs');
const { isAbsolute, join } = require('path');
const request = require('request-promise');

/**
 * 读取package-lock 文件
 * @param { string } uri
 */
async function retrieveFile(uri) {
  uri = uri.startsWith('http') || isAbsolute(uri) ? uri : join(process.cwd(), uri);
  if (fs.existsSync(uri)) {
    return uri.endsWith('json') ? require(uri) : fs.readFileSync(uri).toString();
  }
  try {
    return await request({ uri, json: uri.endsWith('json') });
  } catch (error) {
    console.error(`failed to download the file from ${uri}`);
    process.exit(1);
  }
}

/**
 *
 * @param {string} url
 * @return Object
 */
function getUri(url) {
	let uri = '';
	const arr = url.split('/');
	uri += arr[0] + '//' + arr[2] + '/' + arr[3]
	// if (url.indexOf('https://')) {
	// 	const index = url.split('//')[1].split('/');
	//
	// 	if (index !== -1) {
	// 		uri = 'https:' + url.split('//')[1].slice(0, index)
	// 	}
	// } else if (url.indexOf('http://')) {
	// 	const index = url.split('//')[1].indexOf('/')
	// 	if (index !== -1) {
	// 		uri = 'http:' + url.split('//')[1].slice(0, index)
	// 	}
	// }
	return {uri, name: arr[3]}
}

module.exports = {
  retrieveFile,
	getUri
};
