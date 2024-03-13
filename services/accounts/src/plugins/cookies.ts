import cookie from "@fastify/cookie";
import fp from "fastify-plugin";

export default fp(async function cookiesPlugin(fastify, opts) {
  fastify.register(cookie);
});
