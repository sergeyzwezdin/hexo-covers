const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');
const { findAllFiles } = require('./findAllFiles');

const cleanEmptyFoldersRecursively = (folder) => {
    const isDir = fs.statSync(folder).isDirectory();
    if (!isDir) {
        return;
    }

    let files = fs.readdirSync(folder);
    if (files.length > 0) {
        files.forEach(function (file) {
            var fullPath = path.join(folder, file);
            cleanEmptyFoldersRecursively(fullPath);
        });

        files = fs.readdirSync(folder);
    }

    if (files.length == 0) {
        fs.rmdirSync(folder);
    }
};

const cleanupCovers = async (coverDir, coverManifestPath, log) => {
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
                    log.debug('Removing key from cover manifest: %s / %s', magenta(fileNsectionNameame), magenta(fileName));

                    delete section[fileName];
                    console.log({ sectionName, fileName, exists: fs.existsSync(filePath) });
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
            log.debug('Removing file that is not in cover manifest: %s ', magenta(fullFilePath));
            fs.unlinkSync(fullFilePath);
        }
    }

    cleanEmptyFoldersRecursively(coverDir);

    fs.writeFileSync(coverManifestPath, JSON.stringify(manifest, null, 4), 'utf-8');
};

module.exports = { cleanupCovers };
