const path = require('path');

hexo.config.covers = Object.assign(
    {
        enable: true,
        title: 'blog.zwezdin.com',
        base_dir: '.covers',
        manifestFileName: 'covers.json',
        include: ['keywords'],
        tagsUrl: 'tag',
        categoriesUrl: 'category',
        compress: true,
        source: {
            categories: {
                data: '_data/categories.yml',
                images: '_covers/categories'
            },
            tags: {
                data: '_data/tags.yml',
                images: '_covers/tags'
            }
        },
        templates: {
            page: {
                path: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'default.html')),
                images: {
                    background: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'bg.svg'))
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            post: {
                path: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'default.html')),
                images: {
                    background: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'bg.svg'))
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            category: {
                path: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'default.html')),
                images: {
                    background: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'bg.svg'))
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            tag: {
                path: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'default.html')),
                images: {
                    background: path.relative(hexo.base_dir, path.resolve(__dirname, 'lib', 'templates', 'bg.svg'))
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            }
        }
    },
    hexo.config.covers
);

if (hexo.config.covers.enable) {
    /**
     * Process covers and write to cache folder
     * when post content or file(s) changed - what happens first.
     *
     * ⚠️ Note: if covers already validated in the current cycle,
     * it won't be runned again until "after_generate".
     */

    const invalidateCovers = require('./lib/invalidateCovers')(hexo);
    const injectMetadata = require('./lib/injectMetadata')(hexo);
    let coversInvaidated = false;

    hexo.extend.filter.register('before_generate', function () {
        if (coversInvaidated === false) {
            coversInvaidated = true;
            return invalidateCovers();
        }
    });

    // Inject image cache manifest into page metadata. Process images before if needed.
    hexo.extend.filter.register('before_post_render', function (data) {
        if (coversInvaidated === false) {
            coversInvaidated = true;
            return invalidateCovers().then(() => injectMetadata(data));
        } else {
            return injectMetadata(data);
        }
    });

    hexo.extend.filter.register('after_generate', function () {
        coversInvaidated = false;
    });

    // Inlcude processed images into final output
    hexo.extend.generator.register('covers', require('./lib/coversGenerator')(hexo));

    // Helper to resolve cover from the current post context
    hexo.extend.helper.register('resolve_cover', require('./lib/resolveCoverHelper')(hexo));
    hexo.extend.helper.register('resolve_category_cover', require('./lib/resolveCategoryCoverHelper')(hexo));
    hexo.extend.helper.register('resolve_tag_cover', require('./lib/resolveTagCoverHelper')(hexo));
}
