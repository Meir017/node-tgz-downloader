const [, , packageLockPath] = process.argv;

const downloader = require("../lib/downloader");

if (packageLockPath) {
  downloader.downloadFromPackageLock(packageLockPath);
}
