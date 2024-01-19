const fp = require("fastify-plugin");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("node:path");

const ProtoFilePath = path.join(
  __dirname,
  "../node_modules/yalsh_protos/dist/accounts.proto"
);

module.exports = fp(async function (fastify, opts) {
  try {
    // Create the gRPC client during plugin initialization
    const packageDefinition = protoLoader.loadSync(ProtoFilePath);

    const { Accounts: AccountsClient } =
      grpc.loadPackageDefinition(packageDefinition).accountsPackage;

    const client = new AccountsClient(
      "localhost:50052",
      grpc.credentials.createInsecure()
    );

    // Decorate the Fastify instance with the gRPC client
    fastify.decorate("rpc", client);
  } catch (error) {
    throw new Error("Failed to initialize gRPC client");
  }
});
