const { sep } = require('path');

const resolveAssetPaths = (items, source_dir) =>
    items
        .map(({ path, asset_dir, source }) => {
            if (asset_dir) {
                // If post has asset dir use it (usually defined for post)
                return {
                    source,
                    url: path
                };
            } else {
                const target = /index\.html$/i.test(path)
                    ? path.replace(/index\.html$/i, '')
                    : /\.html$/i.test(path)
                    ? path.replace(/\.html$/i, sep)
                    : '';

                return { source, url: target };
            }
        })
        .sort((a, b) => (a && a.assetsPath && b && b.assetsPath ? b.assetsPath.length - a.assetsPath.length : 0));

module.exports = { resolveAssetPaths };
