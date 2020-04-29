const generateTargetName = (name, hash, targetType) => `${name.replace(/[\W]+/i, '_')}@cover.${targetType}`;

module.exports = { generateTargetName };
