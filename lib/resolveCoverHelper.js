const resolveCover = (hexo) =>
    function (page) {
        const { cover } = page || this.post || this.page;
        return cover;
    };

module.exports = resolveCover;
