import { AuthUserRequest } from "yalsh_protos/accounts/accounts.js"
import { IAPIPort } from "../../ports/api.js";
import { IDatabasePort } from "../../ports/db.js";
import { hashPassword } from "../../utils.js";
import { User, ProfileUser, UserUpdate } from "../entities/account.js";
import bcrypt from "bcrypt";
import { Errors } from "../../errors.js";
export class Application implements IAPIPort {
  dataSource: IDatabasePort;
  constructor(dataSource: IDatabasePort) {
    this.dataSource = dataSource;
  }

  async createUser(user: User): Promise<ProfileUser> {
    try {
      const password = await hashPassword(user.password);
      return await this.dataSource.saveUser({ ...user, password });
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(
    user_id: number
  ): Promise<{ username: string; email: string }> {
    const { username, email } = await this.dataSource.getUserById(user_id);
    return { username, email };
  }

  async updateUser(user: UserUpdate): Promise<boolean> {
    const { user_id, new_password, password } = user || {};

    let newPassword;
    if (new_password && password) {
      const currentUser = await this.dataSource.getUserById(user_id);
      if (!currentUser) return false;

      const isPasswordCorrect = await bcrypt.compare(
        password,
        currentUser.password
      );
      // Prevention of Unauthorized Changes
      if (!isPasswordCorrect) {
        return false;
      }
      newPassword = await hashPassword(new_password);
    }

    const updated = await this.dataSource.updateUser({
      ...user,
      password: newPassword,
    });
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return await this.dataSource.deleteUser(id);
  }

  async authenticateUser(
    user: AuthUserRequest
  ): Promise<{ userId: number; username: string }> {
    try {
      const userAccount = await this.dataSource.getUser(user?.email);
      if (userAccount) {
        const { user_id, username, password } = userAccount;
        const isPasswordCorrect = await bcrypt.compare(user.password, password);
        if (isPasswordCorrect) return { userId: user_id, username };
      }
      throw new Error(Errors.IncorrectCredentials);
    } catch (error) {
      throw error;
    }
  }
}
