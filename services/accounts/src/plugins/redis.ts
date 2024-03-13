import fp from "fastify-plugin";
import redis, { FastifyRedis } from "@fastify/redis";

export default fp(
  async function redisPlugin(fastify, opts) {
    fastify.register(redis, {
      url: process.env.REDIS_URL,
    });
  },
  {
    name: "redisConfig",
  }
);

declare module "fastify" {
  export interface FastifyInstance {
    redis: FastifyRedis;
  }
}
