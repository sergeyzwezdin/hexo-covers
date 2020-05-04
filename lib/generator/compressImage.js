const path = require('path');
const imagemin = require('imagemin');
const imageminOptipng = require('imagemin-optipng');
const imageminPngquant = require('imagemin-pngquant');
const imageminAdvpng = require('imagemin-advpng');
const imageminPngout = require('imagemin-pngout');
const imageminMozJpg = require('imagemin-mozjpeg');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminGuetzli = require('imagemin-guetzli');
const imageminWebp = require('imagemin-webp');

const compressImage = async (fileName, buffer) => {
    const type = path
        .extname(fileName || '')
        .toLowerCase()
        .trim()
        .replace(/\W+/g, '');

    if (type === 'jpg' || type === 'jpeg') {
        return await imagemin.buffer(buffer, {
            plugins: [
                imageminMozJpg({
                    quality: 95
                }),
                imageminJpegRecompress({
                    quality: 'medium'
                }),
                imageminGuetzli({
                    quality: 85
                })
            ]
        });
    } else if (type === 'png') {
        return await imagemin.buffer(buffer, {
            plugins: [imageminOptipng(), imageminPngquant(), imageminAdvpng(), imageminPngout()]
        });
    } else if (type === 'webp') {
        return await imagemin.buffer(buffer, {
            plugins: [
                imageminWebp({
                    quality: 75,
                    preset: originalType === 'jpg' || originalType === 'jpeg' ? 'photo' : 'picture',
                    lossless: originalType === 'png'
                })
            ]
        });
    }

    return buffer;
};

module.exports = { compressImage };
