import { Link } from "yalsh_protos/links/links.js";
import { IAPIPort } from "../../ports/api.js";
import { IDatabasePort } from "../../ports/db.js";
import { LinkItem } from "../entities/link.js";

export class Application implements IAPIPort {
  dataSource: IDatabasePort;
  constructor(dataSource: IDatabasePort) {
    this.dataSource = dataSource;
  }
  async createLink(link: LinkItem): Promise<number> {
    return await this.dataSource.saveLink(link);
  }
  async getLinks(userId: number): Promise<Link[]> {
    const links = await this.dataSource.getLinks(userId);
    const mappedLinks = links.map((link) => {
      const { link_id: linkId, url, key, clicks } = link;
      return {
        linkId,
        url,
        key,
        clicks,
      };
    });
    return mappedLinks;
  }

  async linkLookup(key: string): Promise<string> {
    try {
      return await this.dataSource.getLinkByKey(key);
    } catch (error) {
      throw error;
    }
  }
}
