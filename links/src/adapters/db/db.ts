import { LinkItem } from "../../application/entities/link";
import { IDatabasePort } from "../../ports/db";

export class LinkDataSource implements IDatabasePort {
  async saveLink(link: LinkItem): Promise<number> {
    return link.user_id;
  }
}
