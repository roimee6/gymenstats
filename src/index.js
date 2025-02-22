import Fastify from "fastify";

import {resolve} from "path";
import {createInterface} from "readline";

import Api from "./route/api.js";
import Page from "./route/page.js";

import cmd from "./util/cmd.js";
import cloud from "./util/cloud.js";

const fastify = Fastify({
    logger: true
});

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    const config = (await import("./config.js")).default;

    fastify.register(await import("@fastify/static"), {
        root: resolve("./public"),
        prefix: "/static/"
    });

    await Api(fastify, config);
    await Page(fastify);

    cloud(config);
    promptUser(config);

    try {
        await fastify.listen({
            port: config.server.port
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();

function promptUser(config) {
    rl.question("", async (input) => {
        await cmd(input, config);
        promptUser(config);
    });
}