const path = require('path');
const fs = require('fs');

const resolveCategoryCover = (hexo) =>
    function (name) {
        name = String(name || '')
            .trim()
            .toLowerCase();
        const { base_dir } = hexo;
        const config = hexo.config.covers;

        const coverDir = path.resolve(base_dir, config.base_dir);
        const coverManifestPath = path.join(coverDir, config.manifestFileName);
        const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

        const categoryManifest = manifest && manifest.tags && manifest.categories[name];

        if (categoryManifest) {
            const url_for = hexo.extend.helper.get('url_for').bind(hexo);

            categoryManifest.file = url_for(
                path.join(config.categoriesUrl, name, categoryManifest.hash.substr(0, 8), path.basename(categoryManifest.file))
            );
            return categoryManifest;
        }
    };

module.exports = resolveCategoryCover;
