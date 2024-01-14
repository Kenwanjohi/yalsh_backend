import { IAPIPort } from "../../ports/api";
import { IDatabasePort } from "../../ports/db";
import { User, ProfileUser } from "../entities/account";

export class Application implements IAPIPort {
  dataSource: IDatabasePort;
  constructor(dataSource: IDatabasePort) {
    this.dataSource = dataSource;
  }
  createUser(user: User): Promise<ProfileUser> {
    return this.dataSource.saveUser(user);
  }
}
