const fp = require("fastify-plugin");
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/cors"), {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["POST", "GET", "PATCH", "DELETE"],
  });
});
