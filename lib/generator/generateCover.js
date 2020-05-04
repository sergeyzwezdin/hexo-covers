const { magenta } = require('chalk');
const path = require('path');
const fs = require('fs');
const imageSize = require('image-size');

const { runWebServer } = require('./runWebServer');
const { takeScreenshot } = require('./takeScreenshot');
const { compressImage } = require('./compressImage');

const generateCover = async (
    rootPath,
    templateFullPath,
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
    compress,
    log
) => {
    const targetFilePath = path.resolve(outputDir, targetFileName);

    const { raw } = data;

    if (raw && images.image && fs.existsSync(images.image)) {
        // copy raw image
        const { size } = fs.statSync(images.image);
        const imageInfo = imageSize(images.image);

        if (!fs.existsSync(path.dirname(targetFilePath))) {
            fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        }

        fs.copyFileSync(images.image, targetFilePath);
        log.info('Cover raw copied:\n      %s', magenta(targetFileName));

        return {
            [origin]: {
                file: targetFileName,
                size: size,
                hash,
                type: (path.extname(images.image) || '').slice(1).toLowerCase(),
                dimensions: {
                    w: imageInfo.width,
                    h: imageInfo.height
                }
            }
        };
    } else {
        // generate cover
        const { server, port } = await runWebServer(rootPath, log);

        const templateDir = path.dirname(templateFullPath);
        const params = {
            ...(data || {}),
            ...Object.keys(images || {}).reduce(
                (result, key) => ({ ...result, [`image_${key}`]: images[key] ? path.relative(templateDir, images[key]) : '' }),
                {}
            )
        };

        const url = `http://0.0.0.0:${port}/${path.relative(rootPath, templateFullPath)}?${Object.keys(params)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&')}`;

        try {
            log.debug('Starting screenshot generating: %s', magenta(url));

            const img = await takeScreenshot(url, width, height, outputType, false, log);

            log.debug('Cover generate done:\n      %s', magenta(targetFileName));

            let compressed = undefined;

            if (compress) {
                compressed = await compressImage(targetFileName, img);
                log.debug('Cover compressing done:\n      %s', magenta(targetFileName));
            }

            const imageDir = path.resolve(outputDir, path.dirname(targetFileName));
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
            }

            const finalImage = compressed && compressed.length < img.length ? compressed : img;

            fs.writeFileSync(targetFilePath, finalImage);

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
    }
};

module.exports = { generateCover };
