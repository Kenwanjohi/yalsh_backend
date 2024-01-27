const fp = require("fastify-plugin");

module.exports = fp(
  async function links(fastify, opts) {
    const client = fastify.rpc.linksClient;
    fastify.post(
      "/links",
      {
        onRequest: [fastify.authenticate],
        schema: {
          body: {
            title: "New link",
            description: "New link",
            type: "object",
            properties: {
              url: { description: "long link url", type: "string" },
              key: { description: "key for shot link", type: "string" },
            },
            required: ["url", "key"],
            additionalProperties: false,
          },
        },
      },
      function createLink(request, reply) {
        client.createLink(
          { userId: request.user.id, ...request.body },
          (err, res) => {
            if (err) {
            } else {
              console.log(res);
              reply.send(200);
            }
          }
        );
      }
    );
    fastify.get(
      "/links",
      { onRequest: [fastify.authenticate] },
      function getLinks(request, reply) {
        client.getLinks({ userId: request.user.id }, (err, res) => {
          if (err) {
            fastify.log.error(err);
          } else {
            reply.status(200).send(res);
          }
        });
      }
    );
  },
  {
    encapsulate: true,
  }
);
