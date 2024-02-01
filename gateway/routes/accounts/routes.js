const fp = require("fastify-plugin");

module.exports = fp(
  async function accounts(fastify, opts) {
    const client = fastify.rpc.accountsClient;
    // Register new user
    fastify.post(
      "/accounts",
      {
        schema: {
          body: {
            title: "New user",
            description: "New user details",
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
        // gRPC call CreateUser
        client.createUser(request.body, async (err, res) => {
          if (err) {
            reply.status(500).send({ registered: false });
          } else {
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
              .send({ registered: true });
          }
        });
      }
    );

    fastify.get(
      "/account",
      { onRequest: [fastify.authenticate] },
      function getAccountHandler(request, reply) {
        // gRPC call GetUserProfile
        client.getUserProfile({ userId: request.user.id }, (err, res) => {
          if (err) {
            reply.internalServerError();
          } else {
            reply.code(200).send({ userId: request.user.id, ...res });
          }
        });
      }
    );

    fastify.patch(
      "/accounts/:id",
      {
        onRequest: [fastify.authenticate],
        schema: {
          params: {
            type: "object",
            properties: {
              id: { description: "user's id", type: "number" },
            },
            required: ["id"],
          },
          body: {
            title: "Update user",
            description: "Update user details",
            type: "object",
            properties: {
              username: { description: "username", type: "string" },
              email: { description: "email", type: "string", format: "email" },
              newPassword: { description: "new password", type: "string" },
              password: { description: "password", type: "string" },
            },
            dependencies: {
              newPassword: ["password"],
            },
            additionalProperties: false,
          },
        },
      },
      function updateHandler(request, reply) {
        if (request.user.id !== request.params.id) {
          reply.unauthorized();
          return;
        }
        const payloadUpdateUser = { userId: request.user.id, ...request.body };
        // gRPC call UpdateUser
        client.updateUser(payloadUpdateUser, (err, res) => {
          if (err) {
            reply.internalServerError();
          } else {
            if (res?.ok) {
              reply.code(200).send({ updated: true });
            } else {
              reply.code(200).send({ updated: false });
            }
          }
        });
      }
    );

    fastify.delete(
      "/accounts/:id",
      {
        onRequest: [fastify.authenticate],
        schema: {
          params: {
            type: "object",
            properties: {
              id: { description: "user's id", type: "number" },
            },
            required: ["id"],
            additionalProperties: false,
          },
        },
      },
      function deleteUserHandler(request, reply) {
        if (request.user.id !== request.params.id) {
          reply.unauthorized();
          return;
        }
        // gRPC call DeleteUser
        const payloadUpdateUser = { userId: request.user.id };
        client.deleteUser(payloadUpdateUser, (err, res) => {
          if (err) {
            reply.internalServerError();
          } else {
            if (res?.ok) {
              reply.code(200).send({ deleted: true });
            } else {
              reply.code(200).send({ deleted: false });
            }
          }
        });
      }
    );
  },
  {
    encapsulate: true,
  }
);
