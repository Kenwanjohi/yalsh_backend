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
}
