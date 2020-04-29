const { magenta, red } = require('chalk');
const puppeteer = require('puppeteer');

const takeScreenshot = async (url, width, height, outputType, crashOnBrowserConsole, log) => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width, height }, args: ['--no-sandbox'] });
    log.debug('Chromium launched with resolution %s × %s', magenta(width), magenta(height));

    try {
        let lastError = null;

        const page = await browser.newPage();
        page.on('load', () => {
            log.debug('Page loaded');
        });

        page.on('error', (e) => {
            lastError = e;
        });
        page.on('pageerror', (e) => {
            lastError = e;
        });
        page.on('requestfailed', (e) => {
            lastError = e;
        });
        page.on('console', ({ _text, _type }) => {
            log.info(`Browser console ${_type}:\n      %s\n      %s`, red(_text), magenta(url));

            if (_type === 'error') {
                lastError = _text;
            } else if (crashOnBrowserConsole) {
                lastError = `[${_type}] ${_text}`;
            }
        });

        log.debug('Loading URL: %s', magenta(url));
        await page.goto(url);

        if (lastError) {
            throw new Error(lastError);
        }

        const result = await page.screenshot({
            type: outputType === 'jpg' || outputType === 'jpeg' ? 'jpeg' : 'png',
            omitBackground: false,
            clip: { width, height, x: 0, y: 0 }
        });

        log.debug('Taking screenshot done: %s', magenta(url));

        return result;
    } finally {
        await browser.close();
    }
};

module.exports = { takeScreenshot };
