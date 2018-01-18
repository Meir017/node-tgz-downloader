const [, , packageLockPath] = process.argv;

const downloader = require("./downloader");

if (packageLockPath) {
  downloader.downloadFromPackageLock(packageLockPath);
}
