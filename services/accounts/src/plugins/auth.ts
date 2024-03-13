import { randomUUID } from "node:crypto";
import fp from "fastify-plugin";
import { fastifyJwt, FastifyJWTOptions } from "@fastify/jwt";
import { FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: number; username: string }; // payload type is used for signing and verifying
  }
}

export default fp(
  async function authPlugin(fastify, opts) {
    const { redis } = fastify;
    // Configure jwt plugin
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
      cookie: {
        cookieName: "accessToken",
      },
      trusted: validateToken,
    } as FastifyJWTOptions);

    // create jwt token
    fastify.decorateRequest(
      "createToken",
      async function ({ expiresIn }: { expiresIn: string }): Promise<string> {
        const token = await fastify.jwt.sign(
          { userId: this.user.userId, username: this.user.username },
          {
            jti: randomUUID(),
            expiresIn,
          }
        );
        return token;
      }
    );

    // Check whether the jwtid(jti) has been blacklisted
    async function validateToken(request: FastifyRequest, decodedToken: any) {
      const blacklisted = await redis.get(decodedToken.jti);
      return !blacklisted;
    }
  },
  {
    dependencies: ["redisConfig"],
  }
);

declare module "fastify" {
  export interface FastifyRequest {
    createToken({ expiresIn }: { expiresIn: string }): Promise<string>;
  }
}
