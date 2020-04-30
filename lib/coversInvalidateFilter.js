const { magenta, cyan } = require('chalk');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const rimraf = require('rimraf');
const hexoFrontMatter = require('hexo-front-matter');
const prettyHrtime = require('pretty-hrtime');

const { generateCover } = require('./generator/generateCover');

const { findAllFiles } = require('./utils/findAllFiles');
const { filterPageByLayout } = require('./utils/filterPageByLayout');
const { groupIntoParallelPortions } = require('./utils/groupIntoParallelPortions');
const { generatePageFileDescriptors } = require('./utils/generatePageFileDescriptors');
const { generateTagCategoryDescriptors } = require('./utils/generateTagCategoryDescriptors');
const { cleanupCovers } = require('./utils/cleanupCovers');

const getCoversToGenerate = (config, base_dir, source_dir, coverDir, coverManifestPath, log) => {
    // Find all posts

    log.debug('Fetching posts to generate cover: %s', magenta(path.resolve(source_dir, '_posts')));
    const posts = findAllFiles(path.resolve(source_dir, '_posts'), ['.md']);

    // Find All pages

    log.debug('Fetching pages to generate cover: %s', magenta(source_dir));
    const pages = findAllFiles(source_dir, ['.md'])
        .filter((f) => !/^_(posts|drafts|covers|data)\//i.test(path.relative(source_dir, f)))
        .filter(filterPageByLayout);

    // Find all categories & tags

    if (config.source && config.source.categories && config.source.categories.data) {
        log.debug('Fetching categories data: %s', magenta(path.resolve(source_dir, config.source.categories.data)));
    }

    const categoriesData =
        config.source &&
        config.source.categories &&
        config.source.categories.data &&
        fs.existsSync(path.resolve(source_dir, config.source.categories.data))
            ? yaml.safeLoad(fs.readFileSync(path.resolve(source_dir, config.source.categories.data), 'utf8'))
            : {};

    if (config.source && config.source.tags && config.source.tags.data) {
        log.debug('Fetching tags data: %s', magenta(path.resolve(source_dir, config.source.tags.data)));
    }

    const tagsData =
        config.source && config.source.tags && config.source.tags.data && fs.existsSync(path.resolve(source_dir, config.source.tags.data))
            ? yaml.safeLoad(fs.readFileSync(path.resolve(source_dir, config.source.tags.data), 'utf8'))
            : {};

    log.debug('Scanning posts to extract category/data: %s', magenta(source_dir));

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

    // Tags

    log.debug('Prepare tags before generating');

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

    // Categories

    log.debug('Prepare categories before generating');

    coversToGenerate = [
        ...coversToGenerate,
        ...generateTagCategoryDescriptors(
            base_dir,
            source_dir,
            categories,
            config,
            config.source && config.source.categories && config.source.categories.images,
            templates.category,
            'categories',
            log
        )
    ];

    // Pages

    log.debug('Prepare pages before generating');

    coversToGenerate = [
        ...coversToGenerate,
        ...generatePageFileDescriptors(base_dir, source_dir, pages, config, templates.page, 'pages', log)
    ];

    // Posts

    log.debug('Prepare posts before generating');

    coversToGenerate = [
        ...coversToGenerate,
        ...generatePageFileDescriptors(base_dir, source_dir, posts, config, templates.post, 'posts', log)
    ];

    if (!fs.existsSync(path.dirname(coverManifestPath))) {
        fs.mkdirSync(path.dirname(coverManifestPath), { recursive: true });
    }
    const manifest = fs.existsSync(coverManifestPath) ? JSON.parse(fs.readFileSync(coverManifestPath, 'utf-8')) : {};

    // Filter out already generated covers

    log.debug('Checking covers that should be invalidated');

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

    return coversToGenerate;
};

const coversInvalidateFilter = (hexo) =>
    async function () {
        const timeStarted = process.hrtime();
        const { base_dir, source_dir, env, log } = hexo;

        const config = hexo.config.covers;

        const coverDir = path.resolve(base_dir, config.base_dir);
        const coverManifestPath = path.join(coverDir, config.manifestFileName);

        const isCheckOnlyMode = Boolean(env && env.args && env.args.coverCheckOnly);
        const isForceUpdate = Boolean(env && env.args && env.args.coverForceUpdate);

        if (isForceUpdate) {
            log.info('Cover force update mode enabled. Cleaning up the cache.');
            rimraf.sync(coverDir, {});
        }

        // Prepare covers

        const coversToGenerate = getCoversToGenerate(config, base_dir, source_dir, coverDir, coverManifestPath, log);

        // Process covers

        log.debug('Running covers generating');

        if (!isCheckOnlyMode) {
            for (const items of groupIntoParallelPortions(coversToGenerate, 9)) {
                await Promise.all(
                    items.map(async ({ fileName, data, images, hash, rootPath, template, origin, manifestKey, dimensions, outputType }) => {
                        log.debug('Cover generating started: %s', magenta(fileName));

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

                        log.debug('Cover generating finished: %s', magenta(fileName));
                    })
                );

                fs.writeFileSync(coverManifestPath, JSON.stringify(manifest, null, 4), 'utf-8');
            }
        }

        // Cleanup covers

        log.debug('Running covers cleanup');

        const cleanupResult = await cleanupCovers(coverDir, coverManifestPath, isCheckOnlyMode, log);

        // Final output

        const processed = [...coversToGenerate, ...cleanupResult];

        if (!isCheckOnlyMode) {
            log.info(
                'Covers generated in %s.\n      %s items processed.',
                cyan(prettyHrtime(process.hrtime(timeStarted))),
                magenta(processed.length)
            );
        } else {
            log.info('Covers checked in %s.', cyan(prettyHrtime(process.hrtime(timeStarted))));

            if (processed.length === 0) {
                log.info('Covers are up to date.');
            } else {
                log.warn('Following items should be updated:\n%s', magenta(processed.map((f) => `      ${f}`).join('\n')));

                throw new Error(`${processed.length} items should be updated. Run "npm run build".`);
            }
        }
    };

module.exports = coversInvalidateFilter;
