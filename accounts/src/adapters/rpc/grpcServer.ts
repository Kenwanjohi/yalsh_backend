import path from "path";
import { fileURLToPath } from "url";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";

import {
  authenticateUser,
  createUser,
  deleteUser,
  getUserProfile,
  updateUser,
} from "./grpcFunctions";
import { IAPIPort } from "../../ports/api";
import { AccountsService } from "yalsh_protos/accounts/accounts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ProtoFilePath = path.join(
  __dirname,
  "../../../node_modules/yalsh_protos/accounts.proto"
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
    server.addService(AccountsService, {
      createUser: createUser(this.app),
      getUserProfile: getUserProfile(this.app),
      updateUser: updateUser(this.app),
      deleteUser: deleteUser(this.app),
      authenticateUser: authenticateUser(this.app),
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
