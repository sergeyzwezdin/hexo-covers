const { magenta } = require('chalk');
const express = require('express');

const run = (app) => {
    return new Promise((resolve) => {
        const server = app.listen(() => {
            resolve({
                server,
                port: server.address().port
            });
        });
    });
};

const runWebServer = async (rootPath, log) => {
    const { server, port } = await run(express().use(express.static(rootPath)));

    log.debug('Express web-server started at port %s', magenta(port));

    return { server, port };
};

module.exports = { runWebServer };
