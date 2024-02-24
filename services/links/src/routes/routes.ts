import fp from "fastify-plugin";
import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";

const lookup: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get(
    "/:key",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            key: { description: "link key", type: "string" },
          },
          required: ["key"],
        },
      },
    },
    async function Lookup(request, reply) {
      const { key } = request.params;
      try {
        const url = await linkLookup(key);
        if (url) {
          reply.redirect(url);
        } else {
          reply.redirect(`${process.env.REDIRECT_URL}`);
        }
      } catch (err) {
        fastify.log.error(err);
        reply.redirect(`${process.env.REDIRECT_URL}`);
      }
    }
  );
  async function linkLookup(key: string): Promise<string> {
    const url =
      await fastify.sql`SELECT url, key, link_id FROM links WHERE key=${key}`;
    if (url[0]?.url) {
      return url[0].url;
    }
    throw new Error("Not found");
  }
};

export default fp(lookup, { encapsulate: true });
