import postgres from "postgres";
import { LinkItem } from "../../application/entities/link";
import { IDatabasePort } from "../../ports/db";
const sql = postgres(`${process.env.PG_CONN}`);
export class LinkDataSource implements IDatabasePort {
  async saveLink(link: LinkItem): Promise<number> {
    const newLink = await sql`
    INSERT INTO links
     ${sql(link)}
     returning link_id
    `;
    return newLink[0].link_id;
  }
}
