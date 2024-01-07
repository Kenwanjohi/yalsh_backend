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


export type Link = {
  url: string;
  key: string;
  userId: string;
  createdAt: string;
};

export interface ILinkPort {
  saveLink(link: Link): Promise<string>;
}
export interface IAPIPort {
  createLink(link: Link): Promise<string>;
}

class LinkDataSource implements ILinkPort {
  async saveLink(link: Link): Promise<string> {
    return link.userId;
  }
}

class Application implements IAPIPort {
  dataSource: ILinkPort
  constructor(dataSource: ILinkPort) {
    this.dataSource = dataSource
  }
  async createLink(link: Link): Promise<string> {
    return await this.dataSource.saveLink(link)
  }

}

const linkAdapter = new LinkDataSource()
const app = new Application(linkAdapter)

const createLink = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<typeof link, typeof linkId>,
    callback: sendUnaryData<typeof linkId>
  ) => {
    console.log(call.request, app);
    const userId = await app.createLink(call.request);
    callback(null, { linkId: userId});
  };
};

const server = new grpc.Server();

const reflection = new ReflectionService(packageDefinition);
reflection.addToServer(server);

server.addService(Link.service, {
  createLink: createLink(app),
});

server.bindAsync(
  "0.0.0.0:50000",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    server.start();
    console.log(`listening on port ${port}`);
  }
);
