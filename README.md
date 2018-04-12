[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

# node-tgz-downloader
Downloads all of the tarballs based on one of the following:

- local `package-lock.json` file
- url to a `package-lock.json`
- name of package (NEW)

## install

```bash
npm install node-tgz-downloader -g
```

## usage

from local `package-lock.json` file:

```bash
download-package-lock-tgzs path/to/package-lock.json
```

from url:

```bash
download-package-lock-tgzs https://raw.githubusercontent.com/Meir017/node-tgz-downloader/master/package-lock.json
```

from package name:

```base
download-dependencies-tgzs @angular/cli
```

[npm-image]: https://img.shields.io/npm/v/node-tgz-downloader.svg
[npm-url]: https://npmjs.org/package/node-tgz-downloader
[downloads-image]: https://img.shields.io/npm/dm/node-tgz-downloader.svg
[downloads-url]: https://npmjs.org/package/node-tgz-downloader