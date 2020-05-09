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
2. Covers will be generated for all posts, pages, tags, and categories using [default templates](lib/templates).
3. Once `hexo-covers` generated the covers, you'll need to specify special meta tags so microbrowsers could discover it (for more information see below).
4. You post your link via messengers or social networks and see a nice preview 🎉

### Defining page metadata

## Templates
### How the default template works

### Customizing the template

## Configuration

## Manifest

