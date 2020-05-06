const path = require('path');

hexo.config.covers = Object.assign(
    {
        enable: true,
        title: 'blog.zwezdin.com',
        base_dir: '.covers',
        manifestFileName: 'covers.json',
        include: ['date', 'keywords'],
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
    // Process posts, write covers to cache folder
    hexo.extend.filter.register('before_generate', require('./lib/coversInvalidateFilter')(hexo));

    // Inlcude processed images into final output
    hexo.extend.generator.register('covers', require('./lib/coversGenerator')(hexo));

    // Inject image cache manifest into page metadata
    hexo.extend.filter.register('before_post_render', require('./lib/postMetadataFilter')(hexo));

    // Helper to resolve cover from the current post context
    hexo.extend.helper.register('resolve_cover', require('./lib/resolveCoverHelper')(hexo));
    hexo.extend.helper.register('resolve_category_cover', require('./lib/resolveCategoryCoverHelper')(hexo));
    hexo.extend.helper.register('resolve_tag_cover', require('./lib/resolveTagCoverHelper')(hexo));
}
