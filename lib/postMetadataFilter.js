const path = require('path');
const fs = require('fs');

const postMetadataFilter = (hexo) =>
    function (data) {
        const { base_dir } = hexo;

        const config = hexo.config.covers;

        const coverDir = path.resolve(base_dir, config.base_dir);
        const coverManifestPath = path.join(coverDir, config.manifestFileName);
        const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

        data.cover = (manifest.posts || {})[data.source] || (manifest.pages || {})[data.source];

        return data;
    };

module.exports = postMetadataFilter;
