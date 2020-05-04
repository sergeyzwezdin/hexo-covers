const path = require('path');

const getTargetType = (fileName) => (path.extname(fileName || '').toLowerCase() === '.png' ? 'png' : 'jpg');

module.exports = { getTargetType };
