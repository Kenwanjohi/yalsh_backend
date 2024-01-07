import grpc, { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ProtoFilePath = __dirname + "/../../protos/links.proto";

const packageDefinition = protoLoader.loadSync(ProtoFilePath);
const linksDescriptor = grpc.loadPackageDefinition(packageDefinition);
const linksPackage = linksDescriptor.linksPackage;

const { Link, link, linkId } = linksPackage;
// console.log(linksPackage);

function createLink(
  call: ServerUnaryCall<typeof link, typeof linkId>,
  callback: sendUnaryData<typeof linkId>
) {
  console.log(call.request);
  const linkId = 1
  callback(null, {linkId})
}

const server = new grpc.Server();

const reflection = new ReflectionService(packageDefinition);
reflection.addToServer(server);

server.addService(Link.service, {
  createLink,
});

server.bindAsync(
  "0.0.0.0:50000",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    server.start();
    console.log(`listening on port ${port}`);
  }
);
