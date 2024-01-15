const fp = require("fastify-plugin");
module.exports = fp(
  async function sessions(fastify, opts) {
    // Login
    fastify.post(
      "/login",
      {
        schema: {
          body: {
            title: "Login",
            description: "Login info",
            type: "object",
            properties: {
              email: { description: "email", type: "string", format: "email" },
              password: { description: "password", type: "string" },
            },
            required: ["email", "password"],
            additionalProperties: false,
          },
        },
      },
      async function loginHandler(request, reply) {
        console.log(request.body);
        // gRPC call AuthenticateUser
        request.user = { id: 1, username: "username" };
        const access_token = await request.createToken({ expiresIn: "1h" });
        const refresh_token = await request.createToken({ expiresIn: "1d" });
        return { access_token, refresh_token };
      }
    );

    // Refresh token
    fastify.post("/refresh", {
      onRequest: [fastify.authenticate],
      handler: async function refreshTokenHandler(request, reply) {
        const access_token = await request.createToken({ expiresIn: "1h" });
        return { access_token };
      },
    });

    // Logout user
    fastify.post(
      "/logout",
      {
        onRequest: [fastify.authenticate],
      },
      async function logoutHandler(request, reply) {
        request.blackListToken();
        reply.code(204);
      }
    );
  },
  {
    encapsulate: true,
  }
);