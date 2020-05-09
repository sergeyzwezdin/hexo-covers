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

## Requirements

- Hexo: 4.x
- Node 12+

## Usage

1. Once the plugin is installed and enabled, it will scan the website content during the build.
2. Covers will be generated for all posts, pages, tags, and categories using [default templates](lib/templates). To do that `hexo-covers` runs Chromium via puppeteer for every cover and takes the screenshot.
3. If the post title doesn't fit the image, an error message will be generated in the console during the build. It guarantees that you won't have "broken" previews for any page.
4. Once `hexo-covers` generated the covers, you'll need to specify special meta tags so microbrowsers could discover it (for more information see below).
5. You post your link via messengers or social networks and see a nice preview 🎉

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

## Templates
### How the default template works

### Customizing the template

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

## Manifest

