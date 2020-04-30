hexo.config.covers = Object.assign(
    {
        enable: true,
        base_dir: '.covers',
        manifestFileName: 'covers.json',
        include: ['date', 'keywords'],
        tagsUrl: 'tag',
        categoriesUrl: 'category',
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
                path: 'themes/blog.zwezdin.com/layout/microbrowser-template/page.html',
                images: {
                    logo: 'themes/blog.zwezdin.com/source/assets/favicon/favicon-194x194.png',
                    background: 'themes/blog.zwezdin.com/layout/microbrowser-template/bg.jpg'
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            post: {
                path: 'themes/blog.zwezdin.com/layout/microbrowser-template/post.html',
                images: {
                    logo: 'themes/blog.zwezdin.com/source/assets/favicon/favicon-194x194.png',
                    background: 'themes/blog.zwezdin.com/layout/microbrowser-template/bg.jpg'
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            category: {
                path: 'themes/blog.zwezdin.com/layout/microbrowser-template/category.html',
                images: {
                    logo: 'themes/blog.zwezdin.com/source/assets/favicon/favicon-194x194.png',
                    background: 'themes/blog.zwezdin.com/layout/microbrowser-template/bg.jpg'
                },
                dimensions: {
                    width: 964,
                    height: 504
                }
            },
            tag: {
                path: 'themes/blog.zwezdin.com/layout/microbrowser-template/tag.html',
                images: {
                    logo: 'themes/blog.zwezdin.com/source/assets/favicon/favicon-194x194.png',
                    background: 'themes/blog.zwezdin.com/layout/microbrowser-template/bg.jpg'
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
}
