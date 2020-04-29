const fs = require('fs');
const hexoFrontMatter = require('hexo-front-matter');

const filterPageByLayout = (path) => {
    const { layout } = hexoFrontMatter.parse(fs.readFileSync(path, 'utf-8'));
    return !layout || layout === 'page';
};

module.exports = { filterPageByLayout };
