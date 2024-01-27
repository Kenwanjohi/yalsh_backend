import { Link } from "yalsh_protos/dist/links/links";
import { IAPIPort } from "../../ports/api";
import { IDatabasePort } from "../../ports/db";
import { LinkItem } from "../entities/link";

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
}
