import {get} from "../util/db.js";
import Cache from "../util/cache.js";

let cache;

export default async function (fastify, config) {
    fastify.get("/api/composition", sendComposition);
    fastify.get("/api/goals", sendGoalsList);
    fastify.get("/api/matches", sendMatchesList);

    fastify.get("/api/clips/:id", sendGoalClipInfo);

    cache = await Cache(config);

    if (config.debug) {
        console.log(cache);
    }
}

function sendComposition(req, reply) {
    reply.send(cache.composition);
}

function sendGoalsList(req, reply) {
    reply.send(cache.goals);
}

function sendGoalClipInfo(req, reply) {
    const id = req.params.id;

    if (!id) {
        return reply.code(400).send({
            status: "error",
            message: "Bad request: Missing goal ID"
        });
    }

    const goal = cache.goals.find(goal => goal.id === parseInt(id));

    if (!goal) {
        return reply.code(404).send({
            status: "error",
            message: "Goal not found"
        });
    }

    const goalData = get(id);

    if (!goalData) {
        return reply.code(404).send({
            status: "error",
            message: "Goal data not found"
        });
    }

    return reply.send({
        status: "success",
        result: goalData
    });
}

function sendMatchesList(req, reply) {
    reply.send(cache.matches);
}

export function getCache() {
    return cache;
}