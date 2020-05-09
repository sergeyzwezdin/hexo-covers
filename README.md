# hexo-covers  ![Publish on NPM](https://github.com/sergeyzwezdin/hexo-covers/workflows/Publish%20on%20NPM/badge.svg?branch=master) ![](https://img.shields.io/npm/v/hexo-covers)

`hexo-covers` is a plugin for Hexo static site generator that generates microbrowser page cover so you'll have compelling webpage preview while sharing the link via iMessage, WhatsApp, Telegram, Facebook and others. 

> As more of our conversations happen in group chats and slack channels, link previews are an important way for you to engage users before they start the journey on your site. To help users take the leap and visit your site, we need to make sure that all our pages are annotated with microdata. Better yet, we can use these previews to create compelling visual summaries.
>
> — <cite>Colin Bendell</cite> • [Microbrowsers are Everywhere](https://24ways.org/2019/microbrowsers-are-everywhere/)

* **Generates preview covers** for your website.
* Produces **web-optimized**, compressed images.
* Allows to easily **customize template**.
* Supports generating covers for posts, pages, tags, and categories.

![An example](https://user-images.githubusercontent.com/800755/81463612-2484d200-91d4-11ea-998d-e19342dc4dff.jpg)

## How it works

1. The plugin scans all pages, posts, categories, and tags. 
2. For every item `hexo-covers` runs Chromium via puppeteer and takes the screenshot.
3. Every screenshot is compressed and put into the cache folder.
4. During the website build all covers are included in the output build.
5. You add page metadata using `resolve_cover`, `resolve_tag_cover`, `resolve_category_cover` helpers. For more information [see below](#defining-page-metadata).

## Requirements

- Hexo: 4.x
- Node 12+

## Usage

1. Once the plugin is installed and enabled, it will scan the website content during the build.
2. Covers will be generated for all posts, pages, tags, and categories using [default templates](lib/templates). To do that `hexo-covers` runs Chromium via puppeteer for every cover and takes the screenshot.
3. Once the processing of the cover is done, the result files will be stored in a special folder (`/.covers/`) and included in the cache manifest (`/.covers/covers.json`). You should not care about the folder structure in this folder. Ensure that `.covers` folder added to your repo. If it's ignored, cover processing will start each time, which is time-consuming.
4. If the post title doesn't fit the image, an error message will be generated in the console during the build. It guarantees that you won't have "broken" previews for any page.
5. Once `hexo-covers` generated the covers, you'll need to specify special meta tags so microbrowsers could discover it (for more information see below).
6. You post your link via messengers or social networks and see a nice preview 🎉

### Defining page metadata

The crucial part of the adding previews is page metadata. You can find more information about it [here](https://ogp.me/) and [here](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image). In general, you'll need to add few tags into the `<head>` section:

```html
<html>
    <head>
        ...
        <meta property="og:title" content="Website title" />
        <meta name="twitter:title" content="Website title />
        <link rel="image_src" href="< link to your image preview >" />
        <meta name="twitter:image:src" content="< link to your image preview >" />
        <meta property="og:image" content="< link to your image preview >" />
    </head>
    <body>
        ...
    </body>
</html>
```

In addition, you can add a few more tags like `og:type`, `og:description`, `og:image:type`, `og:image:width`, `og:image:height`, `article:author`, `twitter:description`, `twitter:site`, `twitter:card` and others, but it's completely up to you.

To add this, you'll need to modify `layout.ejs` template in your theme folder. I personally prefer to determine layout type and render some *partial* there. This is how `<head>` section of the `layout.ejs` template could look:

```html
<head>
    ...
    <%_  let layout = page.layout;
    if (!layout) {
        if (page.tag) {
            layout = 'tag';
        } else if (page.category) {
            layout = 'category';
        }
    } _%>
    <%_ if (layout) { _%>
    <%- partial(`_partial/microbrowsers/${layout}`) %>
    <%_ } _%>
</head>
```

Adding this snippet triggers *partial* render for every type of layout, e.g. `_partial/microbrowsers/page.ejs` will be generated for `page` layout, `_partial/microbrowsers/post.ejs` will be generated for `post` layout, etc.

Here are a few examples of how to define these partials:

#### **post.ejs** and **page.ejs**: template for post/page

`resolve_cover` tag helper is used to retrieve information about the cover image.

```html
<%_ const cover = resolve_cover() _%>
<meta property="og:type" content="article" />
<meta property="og:url" content="<%= page.permalink %>" />
<meta property="og:title" content="<%= page.title %>" />
<meta property="og:description" content="<%= page.description %>" />
<%_ if (cover) { _%>
    <link rel="image_src" href="<%= full_url_for(cover.file) %>" />
    <meta property="og:image" content="<%= full_url_for(cover.file) %>" />
    <meta property="og:image:type" content="image/<%= cover.type %>" />
    <meta property="og:image:width" content="<%= cover.dimensions.w %>" />
    <meta property="og:image:height" content="<%= cover.dimensions.h %>" />
<%_ } _%>
<meta name="twitter:title" content="<%= page.title %>" />
<meta name="twitter:description" content="<%= page.description %>" />
<meta property="twitter:url" content="<%= page.permalink %>" />
<meta name="twitter:card" content="summary_large_image" />
<%_ if (cover) { _%>
    <meta name="twitter:image:src" content="<%= full_url_for(cover.file) %>" />
<%_ } _%>
```

#### **tag.ejs**: template for tag

`resolve_tag_cover` tag helper should be used instead of ``resolve_cover`.

```html
<%_ const cover = resolve_tag_cover(page.tag) _%>
<meta property="og:type" content="article" />
<meta property="og:title" content="<%= page.tag %>" />
<%_ if (cover) { _%>
    <link rel="image_src" href="<%= full_url_for(cover.file) %>" />
    <meta property="og:image" content="<%= full_url_for(cover.file) %>" />
    <meta property="og:image:type" content="image/<%= cover.type %>" />
    <meta property="og:image:width" content="<%= cover.dimensions.w %>" />
    <meta property="og:image:height" content="<%= cover.dimensions.h %>" />
<%_ } _%>
<meta name="twitter:title" content="<%= page.tag %>" />
<meta name="twitter:card" content="summary_large_image" />
<%_ if (cover) { _%>
    <meta name="twitter:image:src" content="<%= full_url_for(cover.file) %>" />
<%_ } _%>
```

#### **category.ejs**: template for category

`resolve_category_cover` tag helper should be used instead of ``resolve_cover`.

```html
<%_ const cover = resolve_category_cover(page.category) _%>
<meta property="og:type" content="article" />
<meta property="og:title" content="<%= page.category %>" />
<%_ if (cover) { _%>
    <link rel="image_src" href="<%= full_url_for(cover.file) %>" />
    <meta property="og:image" content="<%= full_url_for(cover.file) %>" />
    <meta property="og:image:type" content="image/<%= cover.type %>" />
    <meta property="og:image:width" content="<%= cover.dimensions.w %>" />
    <meta property="og:image:height" content="<%= cover.dimensions.h %>" />
<%_ } _%>
<meta name="twitter:title" content="<%= page.category %>" />
<meta name="twitter:card" content="summary_large_image" />
<%_ if (cover) { _%>
    <meta name="twitter:image:src" content="<%= full_url_for(cover.file) %>" />
<%_ } _%>
```


### Additional data for pages and posts

You can specify custom data for every page that will be passed in the template during the build. To do that add the `cover` key in page/post frontmatter:

```md
---
title: Test post
cover:
    title: My test post
    image: wp3060116.jpg
    hide_logo: false
    hide_title: false
    hide_subtitle: false
    disable_fade: false
    raw: false
---

Post text
```

There are few predefined key that you can pass in frontmatter:
- `title` — overrides title of the post in the cover
- `image` — custom background image for the cover
- `hide_logo` — hides blog logo
- `hide_title` — hides post title
- `hide_subtitle` — hides post sub-title
- `disable_fade` — disables background fading
- `raw` — do not process the cover with standard workflow, just copy `image` instead

You can use these params if you use [the default template](lib/templates). You can also specify your own keys - all of them will be passed into the template as a query string params. It's useful when you build a custom template and want to show more data.

### Additional data for tags and categories

TBD

## Templates
### How the default template works

The template is a regular HTML file. During the cover build `hexo-covers` starts web-server that serves the template. After that puppeteer is used to take a screenshot of the page.

There is [a default template](lib/templates) that looks like this way:

![Default look of the template](https://user-images.githubusercontent.com/800755/81468176-5eb39b00-91f7-11ea-840d-7f1815df99f6.jpg)


If you are OK with the style of the default template, you do not need to do anything about it. If you want to customize the look of the cover, read the next section.

### Customizing the template

If you want to customize the look of the cover, feel free to create an HTML file somewhere in the project folder. To let `hexo-covers` know where is your template located, specify the relative path in the `templates` section of configuration (see below). Optionally, you can define additional images that will be passed into the template. All paths are relative, so you can use any images from your project you want.

Use [the default template](lib/templates) as a reference on how to create your own template. Pay attention to JavaScript code in the default template. There is a code to extract params from the query string (which passed by `hexo-covers`) as well as the code that throws an error when title text is too large to render.

Any JavaScript error that throws on the template page will generate error in Hexo console during the build. It introduced intentionally to avoid generating "broken" covers.

## Configuration

To configure the plugin add `covers` key to the Hexo config file. For example:

```yaml
covers:
    enable: true
    title: 'Your blog title'
    base_dir: '.covers'
    manifestFileName: 'covers.json'
    include:
        - keywords
    tagsUrl: tag
    categoriesUrl: category
    compress: true
    source:
        categories:
            data: _data/categories.yml
            images: _covers/categories
        tags:
            data: _data/tags.yml
            images: _covers/tags
    templates:
        page:
            path: themes/theme1/layout/microbrowser-template/page.html
            images:
                logo: themes/theme1/source/assets/favicon/favicon-194x194.png
                background: themes/theme1/layout/microbrowser-template/bg.svg
            dimensions:
                width: 964
                height: 504
        post:
            path: themes/theme1/layout/microbrowser-template/post.html
            images:
                logo: themes/theme1/source/assets/favicon/favicon-194x194.png
                background: themes/theme1/layout/microbrowser-template/bg.svg
            dimensions:
                width: 964
                height: 504
        category:
            path: themes/theme1/layout/microbrowser-template/category.html
            images:
                logo: themes/theme1/source/assets/favicon/favicon-194x194.png
                background: themes/theme1/layout/microbrowser-template/bg.svg
            dimensions:
                width: 964
                height: 504
        tag:
            path: themes/theme1/layout/microbrowser-template/tag.html
            images:
                logo: themes/theme1/source/assets/favicon/favicon-194x194.png
                background: themes/theme1/layout/microbrowser-template/bg.svg
            dimensions:
                width: 964
                height: 504
```

| Key | Required | Default value | Description |
| --- | --- | --- | --- |
| `enable` | `false` | `true` | Flag to disable plugin execution. |
| `title` | `false` | Your website title in Hexo configuration | The website title value that will be passed into the template. |
| `base_dir` | `false` | `.images` | Directory name to store cover cache. |
| `manifestFileName` | `false` | `images.json` | File name to store cover cache manifest (for more info see below). |
| `include` | `false` | `[ keywords ]` | Frontmatter keys that will be available at the template during preview generating. |
| `tagsUrl` | `false` | `tag` | The URL where tag covers will be produced. |
| `categoriesUrl` | `false` | `tag` | The URL where category covers will be produced. |
| `compress` | `false` | `true` | Determines if output cover images will be compressed. |
| `source.categories.data` | `false` | `_data/categories.yml` | Path to yaml file that provides additional data for categories (for more information see above). |
| `source.categories.images` | `false` | `_covers/categories` | Path to images folder for categories (for more information see above). |
| `source.tags.data` | `false` | `_data/tags.yml` | Path to yaml file that provides additional data for tags (for more information see above). |
| `source.tags.images` | `false` | `_covers/tags` | Path to images folder for tags (for more information see above). |
| `templates` | `false` |  | Definition of templates for pages, posts, tags, and categories. |
| `templates.page.path`<br/>`templates.post.path`<br/>`templates.category.path`<br/>`templates.tag.path` | `true` | Path to default template | Relative path to template file. |
| `templates.page.images`<br/>`templates.post.images`<br/>`templates.category.images`<br/>`templates.tag.images` | `false` | `{ background: "lib/templates/bg.svg" }` | Images that will be passed into template during generating. |
| `templates.page.dimensions`<br/>`templates.post.dimensions`<br/>`templates.category.dimensions`<br/>`templates.tag.dimensions` | `true` | `{ width: 964, height: 504 }` | Size of generated cover image for the template. |

## Manifest

Normally, you shouldn't care about the manifest structure. But if you're curious, the manifest is a JSON file that contains key-value collection of processed files. The key is a relative path to the image. The value is information about the processed cover. All items are grouped into sections — `tags`, `categories`, `pages`, `posts`.

Here is an example:

```json
{
    "tags": {
        "dotnet": {
            "file": "tags/8ec70aeb/dotnet@cover.jpg",
            "size": 17476,
            "hash": "8ec70aebbc51e28b158a13af745f1bb3",
            "type": "jpg",
            "dimensions": {
                "w": 964,
                "h": 504
            }
        }
    },
    "categories": {
        "mobile": {
            "file": "categories/95306cf2/mobile@cover.jpg",
            "size": 28816,
            "hash": "95306cf2703054c1fe91c432f82a8721",
            "type": "jpg",
            "dimensions": {
                "w": 964,
                "h": 504
            }
        }
    },
    "pages": {
        "terms/index.md": {
            "file": "pages/83c8a774/index@cover.jpg",
            "size": 34955,
            "hash": "83c8a77498a457a187a007c7f4a408c7",
            "type": "jpg",
            "dimensions": {
                "w": 964,
                "h": 504
            }
        }
    },
    "posts": {
        "_posts/2014/fronttalks-2014.md": {
            "file": "posts/2c7f8a02/fronttalks_2014@cover.jpg",
            "size": 29735,
            "hash": "2c7f8a02c9c676e12487c0fc64e65c4f",
            "type": "jpg",
            "dimensions": {
                "w": 964,
                "h": 504
            }
        }
    }
}
```

In page template you can also access `cover` property that will contain the part of the manifest that related to the current page.
