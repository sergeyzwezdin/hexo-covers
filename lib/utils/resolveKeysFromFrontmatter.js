const resolveKeysFromFrontmatter = (frontMatter, names) => {
    const name = names.pop();
    const value = frontMatter[name];

    if (typeof value === 'object' && names.length > 0) {
        return resolveKeysFromFrontmatter(value, names);
    } else if (Array.isArray(value)) {
        return value.filter(Boolean);
    } else if (value instanceof Date) {
        throw new Error('Dates are not supported to include into cover date. Please, remove it from "include" config section.');
    } else {
        return String(value || '').trim();
    }
};

module.exports = { resolveKeysFromFrontmatter };
