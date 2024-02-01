const fp = require("fastify-plugin");
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/cors"), {
    origin: ["http://dev.localhost:3000", "https://app.yalsh.co"],
    credentials: true,
    methods: ["POST", "GET", "PATCH", "DELETE"],
  });
});
