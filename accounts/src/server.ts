import { AccountsDataSource } from "./adapters/db/db";
import { GrpcServer } from "./adapters/rpc/grpcServer";
import { Application } from "./application/api/api";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50052;
const address = `${HOST}:${PORT}`;

const db = new AccountsDataSource();
const app = new Application(db);
const server = new GrpcServer(app, address);
server.start();
