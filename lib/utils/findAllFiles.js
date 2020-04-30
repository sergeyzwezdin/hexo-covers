const fs = require('fs');
const path = require('path');

const findAllFiles = (dir, filter) => {
    return fs
        .readdirSync(dir)
        .map((f) => {
            const fullPath = path.join(dir, f);
            const fileInfo = fs.statSync(fullPath);

            if (fileInfo.isDirectory()) {
                return findAllFiles(fullPath, filter);
            } else if (fileInfo.isFile()) {
                const fileExt = path.extname(f).toLowerCase();

                if (!filter || filter.indexOf(fileExt) !== -1) {
                    return fullPath;
                }
            }
        })
        .reduce((result, current) => {
            if (current === undefined) {
                return result;
            } else if (Array.isArray(current)) {
                return [...result, ...current];
            } else {
                return [...result, current];
            }
        }, []);
};

module.exports = { findAllFiles };
