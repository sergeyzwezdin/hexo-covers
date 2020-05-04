const fs = require('fs');
const crypto = require('crypto');

const generateHash = (templatePath, images, data, config) => {
    const templateHash = fs.existsSync(templatePath) ? crypto.createHash('md5').update(fs.readFileSync(templatePath)).digest('hex') : '';
    const imagesHash = (images || [])
        .map((f) => (fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex') : ''))
        .join('');

    return crypto
        .createHash('md5')
        .update(`${templateHash}${imagesHash}${JSON.stringify(data)}${JSON.stringify(config)}`)
        .digest('hex');
};

module.exports = { generateHash };
