const path = require('path');
const fs = require('fs');
const { resolveAssetPaths } = require('./utils/resolveAssetPaths');

const coversGenerator = (hexo) => async ({ posts, pages }) => {
    const { base_dir, source_dir } = hexo;

    const config = hexo.config.covers;

    const coverDir = path.resolve(base_dir, config.base_dir);
    const coverManifestPath = path.join(coverDir, config.manifestFileName);
    const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

    const categoriesCovers = Object.keys(manifest.categories || {}).map((name) => {
        const currentManifest = manifest.categories[name];
        return {
            path: path.join(config.categoriesUrl, name, currentManifest.hash.substr(0, 8), path.basename(currentManifest.file)),
            dataPath: path.resolve(coverDir, currentManifest.file)
        };
    });

    const tagsCovers = Object.keys(manifest.tags || {}).map((name) => {
        const currentManifest = manifest.tags[name];
        return {
            path: path.join(config.tagsUrl, name, currentManifest.hash.substr(0, 8), path.basename(currentManifest.file)),
            dataPath: path.resolve(coverDir, currentManifest.file)
        };
    });

    const postsCovers = resolveAssetPaths(posts.data, source_dir)
        .map(({ source, url }) => {
            const currentManifest = manifest.posts[source];
            if (currentManifest) {
                return {
                    path: path.join(url, currentManifest.hash.substr(0, 8), path.basename(currentManifest.file)),
                    dataPath: path.resolve(coverDir, currentManifest.file)
                };
            }
        })
        .filter(Boolean);

    const pagesImages = resolveAssetPaths(pages.data, source_dir)
        .map(({ source, url }) => {
            const currentManifest = manifest.pages[source];
            if (currentManifest) {
                return {
                    path: path.join(url, currentManifest.hash.substr(0, 8), path.basename(currentManifest.file)),
                    dataPath: path.resolve(coverDir, currentManifest.file)
                };
            }
        })
        .filter(Boolean);

    return [...categoriesCovers, ...tagsCovers, ...postsCovers, ...pagesImages].map(({ path, dataPath }) => ({
        path,
        data: () => fs.createReadStream(dataPath)
    }));
};

module.exports = coversGenerator;
