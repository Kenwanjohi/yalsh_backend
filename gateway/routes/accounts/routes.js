const fp = require("fastify-plugin");

module.exports = fp(
  async function accounts(fastify, opts) {
    // Register new user
    fastify.post(
      "/register",
      {
        schema: {
          body: {
            title: "User",
            description: "User details",
            type: "object",
            properties: {
              username: { description: "username", type: "string" },
              email: { description: "email", type: "string", format: "email" },
              password: { description: "password", type: "string" },
            },
            required: ["username", "email", "password"],
            additionalProperties: false,
          },
        },
      },
      function registerHandler(request, reply) {
        console.log(request.body);
        // gRPC call CreateUser
        reply.code(201);
        return { registered: true };
      }
    );
  },
  {
    encapsulate: true,
  }
);
