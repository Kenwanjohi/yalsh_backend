import postgres from "postgres";
import { IDatabasePort } from "../../ports/db";
import {
  User,
  ProfileUser,
  UserUpdate,
} from "../../application/entities/account";

export class AccountsDataSource implements IDatabasePort {
  sql: postgres.Sql;

  constructor() {
    try {
      this.sql = postgres(`${process.env.PG_CONN}`);
    } catch (error) {
      throw error;
    }
  }

  async saveUser(user: User): Promise<ProfileUser> {
    try {
      const newUser = await this.sql<ProfileUser[]>`
      INSERT INTO users
      ${this.sql(user)}
      returning user_id, username
      `;
      return newUser[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserById(user_id: number): Promise<User> {
    const user = await this.sql<
      User[]
    >`SELECT username, email, password FROM users WHERE user_id=${user_id}`;
    return user[0];
  }

  async getUser(email: string): Promise<{
    user_id: number;
    username: string;
    email: string;
    password: string;
  }> {
    const user = await this.sql<
      {
        user_id: number;
        username: string;
        email: string;
        password: string;
      }[]
    >`SELECT user_id, username, email, password FROM users WHERE email=${email}`;
    return user[0];
  }

  async updateUser(user: UserUpdate): Promise<boolean> {
    let updatedUser: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    const { user_id, new_password, ...rest } = user;

    updatedUser = rest;

    const withValues: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    for (const key in updatedUser) {
      const value = updatedUser[key];
      if (value) {
        withValues[key] = value;
      }
    }
    console.log(withValues, "WITH PROPERTIES");
    try {
      const res = await this.sql`
        UPDATE users set ${this.sql(
          withValues
        )} where user_id=${user_id} returning user_id
      `;

      return res[0]?.user_id ? true : false;
    } catch (error) {
      return false;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.sql`DELETE FROM users WHERE user_id =${id}`;
      return true;
    } catch (error) {
      return false;
    }
  }
}
