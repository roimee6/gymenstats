// noinspection JSUnusedGlobalSymbols

import {getCache} from "../route/api.js";
import {get} from "../util/db.js";

export async function run(ignore, ignore2) {
    const cache = getCache();

    let count = 0;

    for (const goal of cache.goals) {
        if (!get(goal.id.toString())) {
            console.log(goal);
            count++;
        }
    }

    console.log(count);
}