const fp = require("fastify-plugin");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("node:path");

const AccountsProtoFilePath = path.join(
  __dirname,
  "../node_modules/yalsh_protos/dist/accounts.proto"
);
const LinksProtoFilePath = path.join(
  __dirname,
  "../node_modules/yalsh_protos/dist/links.proto"
);

module.exports = fp(async function (fastify, opts) {
  try {
    // Create the gRPC client during plugin initialization
    const accountsPackageDefinition = protoLoader.loadSync(
      AccountsProtoFilePath
    );
    const linksPackageDefinition = protoLoader.loadSync(LinksProtoFilePath);

    const { Accounts: AccountsClient } = grpc.loadPackageDefinition(
      accountsPackageDefinition
    ).accountsPackage;

    const { Links: LinksClient } = grpc.loadPackageDefinition(
      linksPackageDefinition
    ).linksPackage;

    const accountsClient = new AccountsClient(
      "localhost:50052",
      grpc.credentials.createInsecure()
    );

    const linksClient = new LinksClient(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );

    // Decorate the Fastify instance with the gRPC client
    fastify.decorate("rpc", { accountsClient, linksClient });
  } catch (error) {
    throw new Error("Failed to initialize gRPC client");
  }
});
