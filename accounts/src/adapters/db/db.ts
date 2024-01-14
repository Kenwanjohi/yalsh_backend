import postgres from "postgres";
import { IDatabasePort } from "../../ports/db";
import { User, ProfileUser } from "../../application/entities/account";

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
    const newUser = await this.sql<ProfileUser[]>`
    INSERT INTO users
    ${this.sql(user)}
    returning user_id, username
    `;
    return newUser[0];
  }
}
