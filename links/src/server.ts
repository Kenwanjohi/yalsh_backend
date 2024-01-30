import { LinkDataSource } from "./adapters/db/db.js";
import { GrpcServer } from "./adapters/rpc/grpcServer.js";
import { Application } from "./application/api/api.js";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50051;
const address = `${HOST}:${PORT}`;

const db = new LinkDataSource();
const app = new Application(db);
const server = new GrpcServer(app, address);
server.start()