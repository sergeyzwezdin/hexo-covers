const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');

const { runWebServer } = require('./runWebServer');
const { takeScreenshot } = require('./takeScreenshot');
const { compressImage } = require('./compressImage');

const generateCover = async (
    rootPath,
    template,
    origin,
    outputType,
    data,
    images,
    manifestKey,
    hash,
    manifest,
    outputDir,
    width,
    height,
    targetFileName,
    log
) => {
    const { server, port } = await runWebServer(rootPath, log);

    const params = {
        ...(data || {}),
        ...Object.keys(images || {}).reduce(
            (result, key) => ({ ...result, [`image_${key}`]: images[key] ? `/${path.relative(rootPath, images[key])}` : '' }),
            {}
        )
    };

    const url = `http://0.0.0.0:${port}/${path.relative(rootPath, template)}?${Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')}`;

    try {
        log.debug('Starting screenshot generating: %s', magenta(url));

        const img = await takeScreenshot(url, width, height, outputType, false, log);

        log.debug('Cover generate done:\n      %s', magenta(targetFileName));

        const compressed = await compressImage(targetFileName, img);

        log.debug('Cover compressing done:\n      %s', magenta(targetFileName));

        const imageDir = path.resolve(outputDir, path.dirname(targetFileName));
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }

        const finalImage = compressed.length < img.length ? compressed : img;

        fs.writeFileSync(path.resolve(outputDir, targetFileName), finalImage);

        log.info('Cover generated:\n      %s', magenta(targetFileName));

        return {
            [origin]: {
                file: targetFileName,
                size: finalImage.length,
                hash,
                type: outputType,
                dimensions: {
                    w: width,
                    h: height
                }
            }
        };
    } finally {
        await server.close();
        log.debug('Express web-server at port %s stopped', magenta(port));
    }
};

module.exports = { generateCover };
