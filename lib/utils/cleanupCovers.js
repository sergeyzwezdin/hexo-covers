const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');
const { findAllFiles } = require('./findAllFiles');

const cleanEmptyFoldersRecursively = (coverDir, folder, checkOnly) => {
    const isDir = fs.statSync(folder).isDirectory();
    if (!isDir) {
        return [];
    }

    let processed = [];

    let files = fs.readdirSync(folder);
    if (files.length > 0) {
        files.forEach(function (file) {
            const fullPath = path.join(folder, file);
            processed = [...processed, ...cleanEmptyFoldersRecursively(coverDir, fullPath, checkOnly)];
        });

        files = fs.readdirSync(folder);
    }

    if (files.length == 0) {
        if (!checkOnly) {
            fs.rmdirSync(folder);
        }

        processed.push(path.relative(coverDir, folder));
    }

    return processed;
};

const cleanupCovers = async (coverDir, coverManifestPath, checkOnly, log) => {
    let processed = [];

    const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

    const files = findAllFiles(coverDir).filter((f) => f !== coverManifestPath);

    // cleanup manifest

    for (const sectionName of Object.keys(manifest)) {
        const section = manifest[sectionName];

        for (const fileName of Object.keys(section)) {
            const { file } = section[fileName];

            if (file) {
                const filePath = path.resolve(coverDir, file);

                if (!fs.existsSync(filePath)) {
                    if (!checkOnly) {
                        log.debug('Removing key from cover manifest: %s / %s', magenta(fileNsectionNameame), magenta(fileName));
                        delete section[fileName];
                    }

                    processed.push(fileName);
                }
            }
        }
    }

    // remove files that are not in manifest

    const manifestFiles = Object.keys(manifest)
        .map((sectionName) =>
            Object.keys(manifest[sectionName] || {}).map((fileName) =>
                manifest[sectionName][fileName] ? String(manifest[sectionName][fileName].file) : ''
            )
        )
        .flat(1);

    for (const fullFilePath of files) {
        const containsInManfiest = manifestFiles.indexOf(path.relative(coverDir, fullFilePath)) !== -1;
        if (!containsInManfiest) {
            if (!checkOnly) {
                log.debug('Removing file that is not in cover manifest: %s ', magenta(fullFilePath));
                fs.unlinkSync(fullFilePath);
            }

            processed.push(path.relative(coverDir, fullFilePath));
        }
    }

    processed = [...processed, ...cleanEmptyFoldersRecursively(coverDir, coverDir, checkOnly)];

    if (!checkOnly) {
        fs.writeFileSync(coverManifestPath, JSON.stringify(manifest, null, 4), 'utf-8');
    }

    return processed;
};

module.exports = { cleanupCovers };
