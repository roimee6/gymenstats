import {readFileSync, writeFileSync} from "fs";

const path = "./node_modules/.goals/clips.json";

export function add(key, value) {
    const json = readJson(path);
    json[key] = value;
    writeJSON(json);
}

export function del(key) {
    const json = readJson(path);
    delete json[key];
    writeJSON(json);
}

export function get(key) {
    const json = readJson();
    return json[key];
}

export function clips() {
    return readJson();
}

function writeJSON(json) {
    writeFileSync(path, JSON.stringify(json, undefined, 4));
}

function readJson() {
    try {
        const data = readFileSync(path).toString();
        return JSON.parse(data);
    } catch {
        return {};
    }
}