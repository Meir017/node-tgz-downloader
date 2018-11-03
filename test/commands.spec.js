const commands = require('../lib/commands');

const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');

const tarballsDirectory = './test-tarballs';

require('../lib/logger').ignore = true;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 45000;

describe('the (package.json) command', () => {
    afterEach(() => {
        cleanup(tarballsDirectory);
    });

    it('should work for a simple package', async () => {
        await commands.packageJsonCommand(getFilePath('./test-data/simple/package.json'), {
            directory: tarballsDirectory
        });
        const paths = [
            ['express'],
            ['express', 'express-4.16.4.tgz'],
        ];
        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, ...directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for the current package', async () => {
        await commands.packageJsonCommand(getFilePath('./test-data/current/package.json'), {
            directory: tarballsDirectory,
            devDependencies: true
        });
        const paths = [
            ['colors'], ['colors', 'colors-1.3.0.tgz'],
            ['commander'], ['commander', 'commander-2.16.0.tgz'],
            ['mkdirp'], ['mkdirp', 'mkdirp-0.5.1.tgz'],
            ['request'], ['request', 'request-2.87.0.tgz'],
            ['request-promise'], ['request-promise', 'request-promise-4.2.2.tgz'],
            ['semver'], ['semver', 'semver-5.5.0.tgz'],
            ['tar'], ['tar', 'tar-4.4.6.tgz'],
            ['@types', 'jasmine'], ['@types', 'jasmine', 'jasmine-2.8.9.tgz'],
            ['jasmine'], ['jasmine', 'jasmine-3.2.0.tgz'],
            ['rimraf'], ['rimraf', 'rimraf-2.6.2.tgz']
        ];
        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, ...directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (react-scripts) package', async () => {
        const packageJson = require('./test-data/big/react-scripts/package.json');
        await commands.packageJsonCommand(getFilePath('./test-data/big/react-scripts/package.json'), {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (angular-cli) package', async () => {
        const packageJson = require('./test-data/big/angular-cli/package.json');
        await commands.packageJsonCommand(getFilePath('./test-data/big/angular-cli/package.json'), {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });
});

describe('the (package-lock.json) command', () => {
    afterEach(() => {
        cleanup(tarballsDirectory);
    });

    it('should work for a simple package', async () => {
        await commands.packageLockCommand(getFilePath('./test-data/simple/package-lock.json'), {
            directory: tarballsDirectory
        });
        const paths = [
            ['express'],
            ['express', 'express-4.16.4.tgz'],
        ];
        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, ...directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for the current package', async () => {
        await commands.packageLockCommand(getFilePath('./test-data/current/package-lock.json'), {
            directory: tarballsDirectory
        });
        const paths = [
            ['colors'], ['colors', 'colors-1.3.0.tgz'],
            ['commander'], ['commander', 'commander-2.16.0.tgz'],
            ['mkdirp'], ['mkdirp', 'mkdirp-0.5.1.tgz'],
            ['request'], ['request', 'request-2.87.0.tgz'],
            ['request-promise'], ['request-promise', 'request-promise-4.2.2.tgz'],
            ['semver'], ['semver', 'semver-5.5.0.tgz'],
            ['tar'], ['tar', 'tar-4.4.6.tgz'],
            ['@types', 'jasmine'], ['@types', 'jasmine', 'jasmine-2.8.9.tgz'],
            ['jasmine'], ['jasmine', 'jasmine-3.2.0.tgz'],
            ['rimraf'], ['rimraf', 'rimraf-2.6.2.tgz']
        ];
        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, ...directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (react-scripts) package', async () => {
        const packageJson = require('./test-data/big/react-scripts/package.json');
        await commands.packageLockCommand(getFilePath('./test-data/big/react-scripts/package-lock.json'), {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (angular-cli) package', async () => {
        const packageJson = require('./test-data/big/angular-cli/package.json');
        await commands.packageLockCommand(getFilePath('./test-data/big/angular-cli/package-lock.json'), {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

});

describe('the (package) command', () => {
    afterEach(() => {
        cleanup(tarballsDirectory);
    });

    it('should work for a simple package', async () => {
        await commands.packageCommand('express', '4.16.4', {
            directory: tarballsDirectory
        });
        expect(fs.existsSync(path.join(tarballsDirectory), 'express')).toBeTruthy();
        expect(fs.existsSync(path.join(tarballsDirectory), 'express', 'express-4.16.4.tgz')).toBeTruthy();
    });

    it('should work for the current package', async () => {
        await commands.packageCommand('node-tgz-downloader', undefined, {
            directory: tarballsDirectory
        });
        const paths = [
            ['colors'],
            ['commander'],
            ['mkdirp'],
            ['request'],
            ['request-promise'],
            ['semver'],
            ['tar'],
            ['@types', 'jasmine'],
            ['jasmine'],
            ['rimraf'],
        ];
        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, ...directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (react-scripts) package', async () => {
        const packageJson = require('./test-data/big/react-scripts/package.json');
        await commands.packageCommand(packageJson.name, packageJson.version, {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

    it('should work for a big (angular-cli) package', async () => {
        const packageJson = require('./test-data/big/angular-cli/package.json');
        await commands.packageCommand(packageJson.name, packageJson.version, {
            directory: tarballsDirectory,
            devDependencies: true,
            peerDependencies: true
        });

        const paths = Object.keys(packageJson.dependencies).concat(...Object.keys(packageJson.devDependencies));

        for (const directoryPath of paths) {
            const expectedPath = path.join(tarballsDirectory, directoryPath);
            expect(fs.existsSync(expectedPath)).toBeTruthy(`the path ${expectedPath} should exist`);
        }
    });

});

function cleanup(directory) {
    try {
        if (fs.existsSync(directory))
            rimraf.sync(directory);
    } catch (error) {
        cleanup(directory);
    }
}

function getFilePath(file) {
    return path.join(__dirname, file);
}