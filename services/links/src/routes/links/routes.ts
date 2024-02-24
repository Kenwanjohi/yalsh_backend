import fp from "fastify-plugin";
import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";

declare module "fastify" {
  interface FastifyRequest {
    user: any;
  }
}

const links: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get(
    "/",
    {
      preHandler: async function (request, reply) {
        if (!request.headers["x-user-id"]) {
          reply.unauthorized();
          return;
        }
      },
    },
    async function getLinks(request, reply) {
      const userId = request.headers["x-user-id"];
      try {
        const data = await fastify.dataSource.getLinks(Number(userId));
        reply.status(200).send(data);
      } catch (err) {
        fastify.log.error(err);
        reply.internalServerError();
      }
    }
  );
  fastify.post(
    "/",
    {
      schema: {
        body: {
          title: "New link",
          description: "New link",
          type: "object",
          properties: {
            url: { description: "long link url", type: "string" },
            key: {
              description: "key for short link",
              type: "string",
              maxLength: 8,
            },
          },
          required: ["url", "key"],
          additionalProperties: false,
        },
      },
      preHandler: async function (request, reply) {
        if (!request.headers["x-user-id"]) {
          reply.unauthorized();
          return;
        }
      },
    },
    async function createLink(request, reply) {
      try {
        const userId = request.headers["x-user-id"];
        const { url, key } = request.body;
        const createLinkRequest = {
          url,
          key,
          userId: Number(userId),
        };
        await this.dataSource.createLink(createLinkRequest);
        reply.send(200);
      } catch (err) {
        fastify.log.error(err);
        throw err;
      }
    }
  );
};

export default fp(links, { encapsulate: true });
