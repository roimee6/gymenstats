// noinspection JSCheckFunctionSignatures

import axios from "axios";

import {Client, GatewayIntentBits} from "discord.js";

import {add, clips, del} from "./db.js";
import {download} from "./youtube.js";

import {unlinkSync} from "fs";

let client;

export default async function (config) {
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });

    client.on("ready", async () => {
        console.log(`\n\n\n[🤖] Bot connected: ${client.user.tag}`);

        await update(config);

        console.log(`[🔍] Starting clip check process`);
        await check(config);
    });

    await client.login(config.cloud.discord.token);
}

export async function check() {
    let processedClips = 0;
    let deletedClips = 0;

    for (const [id, data] of Object.entries(clips())) {
        const url = data.url;

        try {
            const response = await axios.head(url, {
                maxRedirects: 5,
                timeout: 3000
            });

            const contentType = response.headers["content-type"] || "";

            if (!contentType.includes("video")) {
                console.log(`[❌] Invalid content type for clip ${id}`);

                del(id);
                deletedClips++;

                continue;
            }

            await download(id, url);
            processedClips++;
        } catch (e) {
            console.log(`[❌] Error processing clip ${id}`);

            del(id);
            deletedClips++;
        }
    }
}

async function update(config) {
    console.log(`[🔍] Fetching clips messages`);

    const guild = client.guilds.cache.get(config.cloud.discord.guildId);
    const channel = guild.channels.cache.get(config.cloud.discord.channelId);

    const messages = await channel.messages.fetch({limit: 50});

    let addedClips = 0;

    for (const msg of messages.values()) {
        if (!/^\d+$/.test(msg.content)) continue;

        for (const attachment of msg.attachments.values()) {
            const fileName = attachment.name?.toLowerCase() || "";
            const contentType = attachment.contentType?.toLowerCase() || "";

            if (fileName.endsWith(".mp4") || contentType.includes("video/mp4")) {
                add(parseInt(msg.content), {
                    url: attachment.url,
                    start: 0,
                    end: 999
                });

                addedClips++;
            }
        }
    }
}

export async function upload(config, goalId, videoPath) {
    console.log(`[📤] Uploading clip for goal ${goalId}`);

    const guild = client.guilds.cache.get(config.cloud.discord.guildId);
    const channel = guild.channels.cache.get(config.cloud.discord.channelId);

    await channel.send({
        content: goalId.toString(),
        files: [{
            attachment: videoPath
        }]
    });

    console.log(`[🔄] Updating after upload`);
    await update(config);

    console.log(`[🗑️] Removing local video file`);
    unlinkSync(videoPath);

    console.log(`[✅] Upload complete for goal ${goalId}`);
}

// noinspection JSUnusedGlobalSymbols
export function getClient() {
    return client;
}