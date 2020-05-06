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

        if (data.cover && data.cover.file) {
            const url_for = hexo.extend.helper.get('url_for').bind(hexo);
            const basePath = data.asset_dir
                ? data.path
                : /index\.html$/i.test(data.path)
                ? data.path.replace(/index\.html$/i, '')
                : /\.html$/i.test(data.path)
                ? data.path.replace(/\.html$/i, path.sep)
                : '';

            data.cover.file = url_for(path.join(basePath, (data.cover.hash || '').substr(0, 8), path.basename(data.cover.file)));
        }

        console.log(data.cover);

        return data;
    };

module.exports = postMetadataFilter;
