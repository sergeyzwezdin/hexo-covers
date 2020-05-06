const fs = require('fs');
const crypto = require('crypto');

const generateHash = (templatePath, images, data) => {
    const templateHash = fs.existsSync(templatePath) ? crypto.createHash('md5').update(fs.readFileSync(templatePath)).digest('hex') : '';
    const imagesHash = (images || [])
        .map((f) => (fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex') : ''))
        .join('');

    console.log('calc hash', {
        templatePath,
        templateHash,
        images,
        imagesHash,
        data,
        'data stringify': JSON.stringify(data),
        result: crypto
            .createHash('md5')
            .update(`${templateHash}${imagesHash}${JSON.stringify(data)}`)
            .digest('hex')
    });

    return crypto
        .createHash('md5')
        .update(`${templateHash}${imagesHash}${JSON.stringify(data)}`)
        .digest('hex');
};

module.exports = { generateHash };
