import { IAPIPort } from "../../ports/api";
import { IDatabasePort } from "../../ports/db";
import { hashPassword } from "../../utils";
import { User, ProfileUser, UserUpdate } from "../entities/account";

export class Application implements IAPIPort {
  dataSource: IDatabasePort;
  constructor(dataSource: IDatabasePort) {
    this.dataSource = dataSource;
  }
  
  async createUser(user: User): Promise<ProfileUser> {
    const password = await hashPassword(user.password);
    return await this.dataSource.saveUser({ ...user, password });
  }

  async updateUser(user: UserUpdate): Promise<boolean> {
    console.log(user);
    return true;
  }
}
