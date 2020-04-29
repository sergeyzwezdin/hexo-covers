const { magenta } = require('chalk');
const path = require('path');

const { generateHash } = require('./generateHash');
const { generateTargetName } = require('./generateTargetName');

const generateTagCategoryDescriptors = (base_dir, source_dir, items, config, imagesPath, templates, manifestKey, log) => {
    if (!items || items.length === 0) {
        return [];
    }
    if (!templates && typeof templates !== 'object' && !templates.path) {
        log.warn('Missing template configuration for:\n%s', magenta(items.map((i) => `      ${i}`).join('\n')));
        return [];
    }

    return items.map(({ name, title, description, background }) => {
        const data = {
            title: title || name,
            description,
            name
        };

        const images = {
            ...Object.keys(templates.images || {}).reduce(
                (result, current) => ({ ...result, [current]: path.resolve(base_dir, templates.images[current]) }),
                {}
            ),
            image: background && imagesPath ? path.resolve(imagesPath, background) : undefined
        };

        const hash = generateHash(path.resolve(base_dir, templates.path), Object.values(images), data);
        const targetType = path.extname(background || '').toLowerCase() === '.png' ? 'png' : 'jpg';

        return {
            fileName: path.join(manifestKey, hash.substr(0, 8), generateTargetName(name, hash, targetType)),
            origin: name,
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

module.exports = { generateTagCategoryDescriptors };
