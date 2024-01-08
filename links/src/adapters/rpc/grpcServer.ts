import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";

import { createLink } from "./grpcFunctions";
import { IAPIPort } from "../../ports/api";
import { LinksService } from "yalsh_protos/dist/links/links"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ProtoFilePath = path.join(__dirname, '../../../node_modules/yalsh_protos/dist/links.proto');

const packageDefinition = protoLoader.loadSync(ProtoFilePath);

export class GrpcServer {
  app: IAPIPort;
  address: string;

  constructor(app: IAPIPort, address: string) {
    this.app = app;
    this.address = address;
  }

  start() {
    const server = new grpc.Server();
    const reflection = new ReflectionService(packageDefinition);
    reflection.addToServer(server);
    server.addService(LinksService, {
      createLink: createLink(this.app),
    });
    server.bindAsync(
      this.address,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        server.start();
        console.log(`listening on port ${port}`);
      }
    );
  }
}