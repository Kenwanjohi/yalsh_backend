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
  },
  {
    encapsulate: true,
  }
);
