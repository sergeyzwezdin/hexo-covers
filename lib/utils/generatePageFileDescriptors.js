const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');
const hexoFrontMatter = require('hexo-front-matter');

const { generateHash } = require('./generateHash');
const { resolveKeysFromFrontmatter } = require('./resolveKeysFromFrontmatter');
const { generateTargetName } = require('./generateTargetName');

const generatePageFileDescriptors = (base_dir, source_dir, items, config, templates, manifestKey, log) => {
    if (!items || items.length === 0) {
        return [];
    }
    if (!templates && typeof templates !== 'object' && !templates.path) {
        log.warn('Missing template configuration for:\n%s', magenta(items.map((i) => `      ${i}`).join('\n')));
        return [];
    }

    return items.map((item) => {
        const metadata = hexoFrontMatter.parse(fs.readFileSync(item, 'utf-8'));
        const cover = metadata.cover || {};

        const title = cover.title || metadata.title;
        const description = cover.description || metadata.description;

        const includes = (config.include || [])
            .map((item) =>
                String(item || '')
                    .split('.')
                    .map((item) => item.trim())
            )
            .reduce((result, keys) => ({ ...result, [keys.join('-')]: resolveKeysFromFrontmatter(metadata, keys.reverse()) }), {});

        const data = {
            title,
            description,
            ...includes,
            ...cover
        };

        const images = {
            ...Object.keys(templates.images || {}).reduce(
                (result, current) => ({ ...result, [current]: path.resolve(base_dir, templates.images[current]) }),
                {}
            ),
            image: cover.image ? path.resolve(path.join(path.dirname(item), path.basename(item, '.md')), cover.image) : undefined
        };

        const hash = generateHash(path.resolve(base_dir, templates.path), Object.values(images), data);
        const targetType = path.extname(cover.image || '').toLowerCase() === '.png' ? 'png' : 'jpg';

        return {
            fileName: path.join(manifestKey, hash.substr(0, 8), generateTargetName(path.basename(item, '.md'), hash, targetType)),
            origin: path.relative(source_dir, item),
            data,
            images,
            hash,
            manifestKey,
            rootPath: base_dir,
            template: path.resolve(base_dir, templates.path),
            dimensions: templates.dimensions,
            outputType: targetType
        };
    });
};

module.exports = { generatePageFileDescriptors };
