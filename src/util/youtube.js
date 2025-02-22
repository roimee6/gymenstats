import axios from "axios";
import youtubedl from "youtube-dl-exec";

import ffmpeg from "fluent-ffmpeg";
import {ffmpegPath} from "ffmpeg-ffprobe-static";

import {createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync} from "fs";
import {join} from "path";

const tempDir = join("node_modules", ".goals", "temp");
const clipDir = join("node_modules", ".goals", "clip");

export async function youtube(goalId, videoUrl, start, end) {
    ffmpeg.setFfmpegPath(ffmpegPath);

    mkdirSync(tempDir, {recursive: true});

    const output = await youtubedl(videoUrl, {
        output: join(tempDir, "temp_video.%(ext)s"),
        format: "bestvideo[ext=mp4]+bestaudio[ext=webm]/best",
        noCheckCertificates: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"]
    });

    console.log(output);

    const files = readdirSync(tempDir);

    const videoFile = files.find(file => file.startsWith("temp_video") && file.endsWith(".mp4"));
    const audioFile = files.find(file => file.startsWith("temp_video") && file.endsWith(".webm"));

    const outputPath = join(tempDir, goalId + ".mp4");

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(join(tempDir, videoFile))
            .inputOptions(`-ss ${start}`)
            .input(join(tempDir, audioFile))
            .inputOptions(`-ss ${start}`)
            .outputOptions([
                `-t ${end - start}`,
                "-c:v libx264",
                "-preset veryslow",
                "-crf 23",
                "-profile:v main",
                "-level 4.0",
                "-movflags +faststart",
                "-maxrate 2M",
                "-bufsize 2M",
                "-vf scale=-2:720",
                "-c:a aac",
                "-b:a 128k",
                "-ar 44100",
                "-map 0:v:0",
                "-map 1:a:0"
            ])
            .output(outputPath)
            .on("end", () => {
                unlinkSync(join(tempDir, videoFile));
                unlinkSync(join(tempDir, audioFile));
                resolve(outputPath);
            })
            .on("error", (err) => {
                reject(err);
            })
            .run();
    });
}

export async function download(id, link) {
    mkdirSync(clipDir, {recursive: true});

    const outputPath = join(clipDir, `${id}.mp4`);

    if (existsSync(outputPath)) {
        return;
    }

    console.log(`[⬇️] Downloading clip ${id}`);

    try {
        const response = await axios({
            method: "get",
            url: link,
            responseType: "stream"
        });

        const writer = createWriteStream(outputPath);

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);

            writer.on("finish", () => {
                console.log(`[✅]  ${id}.mp4 downloaded`);
                resolve(outputPath);
            });

            writer.on("error", (err) => {
                console.error(`[❌] Error ${id}.mp4`, err);
                reject(err);
            });
        });
    } catch (e) {
        console.log(e);
    }
}