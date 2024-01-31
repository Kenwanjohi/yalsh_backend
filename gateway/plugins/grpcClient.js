const fp = require("fastify-plugin");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("node:path");

const AccountsProtoFilePath = path.join(
  __dirname,
  "../node_modules/yalsh_protos/accounts.proto"
);
const LinksProtoFilePath = path.join(
  __dirname,
  "../node_modules/yalsh_protos/links.proto"
);

module.exports = fp(async function (fastify, opts) {
  try {
    // Create the gRPC client during plugin initialization
    const accountsPackageDefinition = protoLoader.loadSync(
      AccountsProtoFilePath
    );
    const linksPackageDefinition = protoLoader.loadSync(LinksProtoFilePath, {
      defaults: true,
    });

    const { Accounts: AccountsClient } = grpc.loadPackageDefinition(
      accountsPackageDefinition
    ).accountsPackage;

    const { Links: LinksClient } = grpc.loadPackageDefinition(
      linksPackageDefinition
    ).linksPackage;

    const accountsClient = new AccountsClient(
      process.env.ACCOUNTS_SERVICE_URL,
      grpc.credentials.createInsecure()
    );

    const linksClient = new LinksClient(
      process.env.LINKS_SERVICE_URL,
      grpc.credentials.createInsecure()
    );

    // Decorate the Fastify instance with the gRPC client
    fastify.decorate("rpc", { accountsClient, linksClient });
  } catch (error) {
    throw new Error("Failed to initialize gRPC client");
  }
});
