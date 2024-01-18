const fp = require("fastify-plugin");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("node:path");

const ProtoFilePath = path.join(
  __dirname,
  "../../node_modules/yalsh_protos/dist/accounts.proto"
);
const packageDefinition = protoLoader.loadSync(ProtoFilePath);

const { Accounts: AccountsClient } =
  grpc.loadPackageDefinition(packageDefinition).accountsPackage;

const client = new AccountsClient(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

module.exports = fp(
  async function accounts(fastify, opts) {
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
        client.createUser(request.body, (err, res) => {
          if (err) {
            this.log.error(err);
            reply.status(500).send({ registered: false });
          } else {
            // TODO: Optionally create access_token??
            console.log(res);
            reply.code(201).send({ registered: true });
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
