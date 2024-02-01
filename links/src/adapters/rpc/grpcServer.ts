import path from "path";
import { fileURLToPath } from "url";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";

import { createLink, getLinks, linkLookup } from "./grpcFunctions.js";
import { IAPIPort } from "../../ports/api.js";
import { LinksService } from "yalsh_protos/links/links.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ProtoFilePath = path.join(
  __dirname,
  "../../../node_modules/yalsh_protos/links.proto"
);
const packageDefinition = protoLoader.loadSync(ProtoFilePath);

export class GrpcServer {
  app: IAPIPort;
  address: string;

  constructor(app: IAPIPort, address: string) {
    this.app = app;
    this.address = address;
  }

  start() {
    const server = new Server();
    const reflection = new ReflectionService(packageDefinition);
    reflection.addToServer(server);
    server.addService(LinksService, {
      createLink: createLink(this.app),
      getLinks: getLinks(this.app),
      linkLookup: linkLookup(this.app)
    });
    server.bindAsync(
      this.address,
      ServerCredentials.createInsecure(),
      (error, port) => {
        server.start();
        console.log(`listening on port ${port}`);
      }
    );
  }
}
