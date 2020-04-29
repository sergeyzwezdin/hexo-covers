const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');
const hexoFrontMatter = require('hexo-front-matter');

const { generateCover } = require('./generator/generateCover');

const { findAllFiles } = require('./utils/findAllFiles');
const { filterPageByLayout } = require('./utils/filterPageByLayout');
const { groupIntoParallelPortions } = require('./utils/groupIntoParallelPortions');
const { generatePageFileDescriptors } = require('./utils/generatePageFileDescriptors');
const { generateTagCategoryDescriptors } = require('./utils/generateTagCategoryDescriptors');

const coversInvalidateFilter = (hexo) =>
    async function () {
        const { base_dir, source_dir, log } = hexo;

        const config = hexo.config.covers;

        const coverDir = path.resolve(base_dir, config.base_dir);
        const coverManifestPath = path.join(coverDir, config.manifestFileName);

        // Find all posts

        const posts = findAllFiles(path.resolve(source_dir, '_posts'), ['.md']);

        // Find All pages

        const pages = findAllFiles(source_dir, ['.md'])
            .filter((f) => !/^_(posts|drafts|covers|data)\//i.test(path.relative(source_dir, f)))
            .filter(filterPageByLayout);

        // Find all categories & tags

        const categoriesData =
            config.source &&
            config.source.categories &&
            config.source.categories.data &&
            fs.existsSync(path.resolve(source_dir, config.source.categories.data))
                ? yaml.safeLoad(fs.readFileSync(path.resolve(source_dir, config.source.categories.data), 'utf8'))
                : {};

        const tagsData =
            config.source &&
            config.source.tags &&
            config.source.tags.data &&
            fs.existsSync(path.resolve(source_dir, config.source.tags.data))
                ? yaml.safeLoad(fs.readFileSync(path.resolve(source_dir, config.source.tags.data), 'utf8'))
                : {};

        const { categoryList, tagList } = findAllFiles(source_dir, ['.md']).reduce(
            (result, path) => {
                const { categories, tags } = hexoFrontMatter.parse(fs.readFileSync(path, 'utf-8'));

                return {
                    categoryList: [...new Set([...result.categoryList, ...(categories || []).flat(Infinity)])],
                    tagList: [...new Set([...result.tagList, ...(tags || []).flat(Infinity)])]
                };
            },
            {
                categoryList: [],
                tagList: []
            }
        );

        const categories = categoryList.map((category) => ({
            title: category,
            ...(categoriesData[category] || {}),
            name: category
        }));

        const tags = tagList.map((tag) => ({
            title: tag,
            ...(tagsData[tag] || {}),
            name: tag
        }));

        // Generate cover for posts

        const { templates } = config;

        let coversToGenerate = [];

        // tags

        coversToGenerate = [
            ...coversToGenerate,
            ...generateTagCategoryDescriptors(
                base_dir,
                source_dir,
                tags,
                config,
                config.source && config.source.tags && config.source.tags.images,
                templates.tag,
                'tags',
                log
            )
        ];

        // categories

        coversToGenerate = [
            ...coversToGenerate,
            ...generateTagCategoryDescriptors(
                base_dir,
                source_dir,
                categories,
                config,
                config.source && config.source.categories && config.source.categories.images,
                templates.category,
                'cateogries',
                log
            )
        ];

        // pages

        coversToGenerate = [
            ...coversToGenerate,
            ...generatePageFileDescriptors(base_dir, source_dir, pages, config, templates.page, 'pages', log)
        ];

        // posts

        coversToGenerate = [
            ...coversToGenerate,
            ...generatePageFileDescriptors(base_dir, source_dir, posts, config, templates.post, 'posts', log)
        ];

        if (!fs.existsSync(path.dirname(coverManifestPath))) {
            fs.mkdirSync(path.dirname(coverManifestPath), { recursive: true });
        }
        const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

        // filter out already generated covers

        coversToGenerate = coversToGenerate.filter(({ hash, origin, manifestKey }) => {
            if (manifest && manifest[manifestKey] && manifest[manifestKey][origin]) {
                const currentManifest = manifest[manifestKey][origin];
                const fullPath = path.resolve(coverDir, currentManifest.file);
                if (fs.existsSync(fullPath)) {
                    if (currentManifest.hash === hash) {
                        const { size } = fs.statSync(fullPath);
                        if (currentManifest.size === size) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });

        // process covers

        for (const items of groupIntoParallelPortions(coversToGenerate, 9)) {
            await Promise.all(
                items.map(async ({ fileName, data, images, hash, rootPath, template, origin, manifestKey, dimensions, outputType }) => {
                    if (!manifest[manifestKey]) {
                        manifest[manifestKey] = {};
                    }

                    const result = await generateCover(
                        rootPath,
                        template,
                        origin,
                        outputType,
                        data,
                        images,
                        manifestKey,
                        hash,
                        manifest,
                        coverDir,
                        dimensions.width,
                        dimensions.height,
                        fileName,
                        log
                    );

                    manifest[manifestKey] = { ...manifest[manifestKey], ...result };
                })
            );

            fs.writeFileSync(coverManifestPath, JSON.stringify(manifest, null, 4), 'utf-8');
        }
    };

module.exports = coversInvalidateFilter;
