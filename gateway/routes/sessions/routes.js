const fp = require("fastify-plugin");
module.exports = fp(
  async function sessions(fastify, opts) {
    // Login
    fastify.post(
      "/session",
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
      function loginHandler(request, reply) {
        const client = fastify.rpc.accountsClient;
        const payload = request.body;
        // gRPC call AuthenticateUser
        client.authenticateUser(payload, async (err, res) => {
          if (err) {
            reply.status(401).send({ error: err.details });
            return;
          }
          const { userId, username } = res;
          request.user = { id: userId, username };
          const accessToken = await request.createToken({ expiresIn: "14d" });
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 14);

          reply
            .setCookie("accessToken", accessToken, {
              path: "/",
              secure: true,
              httpOnly: true,
              expires: expirationDate,
              sameSite: "Strict",
            })
            .code(200)
            .send({ authenticated: true });
        });
      }
    );

    // Refresh token
    fastify.get("/refresh", {
      onRequest: [fastify.authenticate],
      handler: async function refreshTokenHandler(request, reply) {
        const accessToken = await request.createToken({ expiresIn: "1h" });
        return { accessToken };
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
        reply.clearCookie("accessToken").code(204);
      }
    );
  },
  {
    encapsulate: true,
  }
);
