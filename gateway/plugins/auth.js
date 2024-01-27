const fp = require("fastify-plugin");
const jwt = require("@fastify/jwt");
const { randomUUID } = require("node:crypto");

module.exports = fp(
  async function authPlugin(fastify, opts) {
    // redis decorator from @fastify/redis
    const { redis } = fastify;

    // Configure jwt plugin
    fastify.register(jwt, {
      secret: process.env.JWT_SECRET,
      cookie: {
        cookieName: "accessToken",
      },
      trusted: validateToken,
    });

    // verify jwt, called onRequest
    fastify.decorate("authenticate", async function (request, reply) {
      try {
        await request.jwtVerify({ onlyCookie: true });
      } catch (error) {
        reply.send(error);
      }
    });  

    // create jwt token
    fastify.decorateRequest("createToken", async function ({ expiresIn }) {
      const token = await fastify.jwt.sign(
        { id: this.user.id },
        {
          jti: randomUUID(),
          expiresIn,
        }
      );
      return token;
    });

    // On logout, add the jwtid(jti) to redis
    fastify.decorateRequest("blackListToken", async function () {
      try {
        const { jti, exp } = this.user;
        await redis.set(jti, true);
        await redis.expireat(jti, exp);
      } catch (error) {
        reply.code(500);
        reply.send(error);
      }
    });

    // Check whether the jwtid(jti) has been blacklisted
    async function validateToken(request, decodedToken) {
      const blacklisted = await redis.get(decodedToken.jti);
      return !blacklisted;
    }
  },
  {
    dependencies: ["redisConfig"],
  }
);
