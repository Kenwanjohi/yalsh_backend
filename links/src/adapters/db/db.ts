import postgres from "postgres";
import { LinkItem } from "../../application/entities/link.js";
import { GetLinks, IDatabasePort } from "../../ports/db.js";
import "dotenv/config";

export class LinkDataSource implements IDatabasePort {
  sql: postgres.Sql;

  constructor() {
    try {
      this.sql = postgres(`${process.env.PG_CONN}`);
    } catch (error) {
      throw error;
    }
  }
  async saveLink(link: LinkItem): Promise<number> {
    const newLink = await this.sql`
    INSERT INTO links
     ${this.sql(link)}
     returning link_id
    `;
    return newLink[0].link_id;
  }
  async getLinks(userId: number): Promise<GetLinks[]> {
    const links = await this.sql<
      GetLinks[]
    >`SELECT link_id, url, key, clicks, expires_at FROM links WHERE user_id=${userId}`;
    return links;
  }
}
