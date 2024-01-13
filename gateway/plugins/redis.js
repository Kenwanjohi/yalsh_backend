const fp = require("fastify-plugin");
const fastifyRedis = require("@fastify/redis");

module.exports = fp(
  async function (fastify, opts) {
    fastify.register(fastifyRedis, {
      url: process.env.REDIS_URL,
    });
  },
  {
    name: "redisConfig",
  }
);
