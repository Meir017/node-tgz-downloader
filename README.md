[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

# node-tgz-downloader
Downloads all of the tarballs based on one of the following:

- local `package-lock.json` file
- url to a `package-lock.json`
- name of package
- local `package.json` file
- url to a `package.json`
- search keyword

## install

```bash
npm install node-tgz-downloader -g
```

## usage

### package-lock.json

from local file:

```bash
download-tgz package-lock path/to/package-lock.json
```

from url:

```bash
download-tgz package-lock https://raw.githubusercontent.com/Meir017/node-tgz-downloader/master/package-lock.json
```

### package name

```base
download-tgz package @angular/cli --devDependencies --peerDependencies
```

### package.json

from local file:

```bash
download-tgz package-json path/to/package.json
```

from url:

```bash
download-tgz package-json https://raw.githubusercontent.com/Meir017/node-tgz-downloader/master/package.json
```

### search keyword

downloads the packages returned from an npm search query (https://registry.npmjs.org/-/v1/search?)

```base
download-tgz search tgz
```

[npm-image]: https://img.shields.io/npm/v/node-tgz-downloader.svg
[npm-url]: https://npmjs.org/package/node-tgz-downloader
[downloads-image]: https://img.shields.io/npm/dm/node-tgz-downloader.svg
[downloads-url]: https://npmjs.org/package/node-tgz-downloader