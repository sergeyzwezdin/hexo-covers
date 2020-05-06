const path = require('path');
const fs = require('fs');

const resolveTagCover = (hexo) =>
    function (name) {
        name = String(name || '')
            .trim()
            .toLowerCase();
        const { base_dir } = hexo;
        const config = hexo.config.covers;

        const coverDir = path.resolve(base_dir, config.base_dir);
        const coverManifestPath = path.join(coverDir, config.manifestFileName);
        const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

        const tagManifest = manifest && manifest.tags && manifest.tags[name];

        if (tagManifest) {
            const url_for = hexo.extend.helper.get('url_for').bind(hexo);

            tagManifest.file = url_for(path.join(config.tagsUrl, name, tagManifest.hash.substr(0, 8), path.basename(tagManifest.file)));
            return tagManifest;
        }
    };

module.exports = resolveTagCover;
