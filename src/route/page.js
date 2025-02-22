export default function (fastify) {
    fastify.get("/", function (req, reply) {
        reply.sendFile("index.html");
    });
}