// noinspection JSUnusedGlobalSymbols

import {getCache} from "../route/api.js";
import {TwitterDL} from "twitter-downloader";

import {add} from "../util/db.js";
import {download, youtube} from "../util/youtube.js";
import {upload} from "../util/cloud.js";

export async function run(config, args) {
    if (2 > args.length) {
        console.log("Usage: add <goalId> <ytb|tweet> [start] [end]")
        return;
    }

    const goalId = parseInt(args[0]);
    const goalLink = args[1];

    const cache = getCache();
    const goal = cache.goals.some(goal => goal.id === goalId);

    if (!goal) {
        console.log(`Goal with id '${goalId}' not found`)
        return;
    }

    let url;

    const start = args[2] || 0;
    const end = args[3] || 999;

    if (goalLink.includes("youtu")) {
        await progressYoutube(config, goalId, goalLink, start, end);
        return;
    } else {
        let result;

        try {
            result = await TwitterDL(transformUrl(goalLink), {
                cookie: config.twitter.cookie,
            });
        } catch (e) {
            console.log("Invalid twitter link");
            return;
        }

        const medias = result.result.media;

        if (1 > medias.length) {
            console.log("There is no video in this tweet");
            return;
        }

        url = medias[0].videos.reduce((highest, current) => {
            return current.bitrate > highest.bitrate ? current : highest;
        }).url;
    }

    add(goalId, {
        url,
        start,
        end
    });

    console.log(`Goal clip with the id '${goalId}' is now at the link '${url}'`);
}

async function progressYoutube(config, goalId, videoUrl, start, end) {
    const tempPath = await youtube(goalId, videoUrl, start, end);

    await upload(config, goalId, tempPath);
    await download(goalId, videoUrl);

    console.log(`Clip ${goalId} downloaded and stored in cloud`);
}

function transformUrl(url) {
    let endIndex = url.indexOf("?");
    return (endIndex !== -1 ? url.substring(0, endIndex) : url).replace("x.com", "twitter.com").trim();
}