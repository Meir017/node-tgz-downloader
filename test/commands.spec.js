const commands = require('../lib/commands');

const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');

const tarballsDirectory = './test-tarballs';

describe('the (package.json) command', () => {
    beforeEach(() => {
        if (fs.existsSync(tarballsDirectory)) {
            rimraf.sync(tarballsDirectory);
        }
    });

    it('should work for a simple package', async () => {
        await commands.packageJsonCommand(getFilePath('./test-data/simple/package.json'), {
            directory: tarballsDirectory
        });
        expect(fs.existsSync(path.join(tarballsDirectory), 'express')).toBeTruthy();
        expect(fs.existsSync(path.join(tarballsDirectory), 'express', 'express-4.16.4.tgz')).toBeTruthy();
    });

    it('should work for the current package', async () => {
        await commands.packageJsonCommand(getFilePath('./test-data/current/package.json'), {
            directory: tarballsDirectory,
            devDependencies: true
        });
        const paths = [
            ['colors'], ['colors', 'colors-1.3.0.tgz'],
            ['commander'], ['commander', 'commander-2.16.0.tgz'],
            ['mkdirp'], ['mkdirp', 'mkdirp-0.5.1-tgz'],
            ['request'], ['request', 'request-2.87.0.tgz'],
            ['request-promise'], ['request-promise', 'request-promise-4.2.2.tgz'],
            ['semver'], ['semver', 'semver-5.5.0.tgz'],
            ['tar'], ['tar', 'tar-4.4.6.tgz'],
            ['@types', 'jasmine'], ['@types', 'jasmine', 'jasmine-2.8.9.tgz'],
            ['jasmine'], ['jasmine', 'jasmine-3.2.0.tgz'],
            ['rimraf'], ['rimraf', 'rimraf-2.6.2.tgz']
        ];
        for (const directoryPath of paths) {
            expect(fs.existsSync(path.join(tarballsDirectory), ...directoryPath)).toBeTruthy();
        }
    });
    /*
        it('should work for a big (react-scripts) package', async () => {
            await commands.packageJsonCommand(getFilePath('./test-data/big/react-scripts/package.json'), {
                directory: tarballsDirectory,
                devDependencies: true,
                peerDependencies: true
            });
        });
    
        it('should work for a big (angular-cli) package', async () => {
            await commands.packageJsonCommand(getFilePath('./test-data/big/angular-cli/package.json'), {
                directory: tarballsDirectory,
                devDependencies: true,
                peerDependencies: true
            });
        });
        */
});

function getFilePath(file) {
    return path.join(__dirname, file);
}