const os = require('os');

const groupIntoParallelPortions = (items, limit) => {
    const cores = os.cpus().length;
    const parallelizm = cores > limit ? limit : cores;

    return Array.from({ length: Math.ceil(items.length / parallelizm) }).map((_, index) =>
        items.slice(index * parallelizm, (index + 1) * parallelizm)
    );
};

module.exports = { groupIntoParallelPortions };
