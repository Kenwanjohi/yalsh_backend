import { LinkItem } from "../application/entities/link.js";
export type GetLinks = {
  link_id: number;
  url: string;
  key: string;
  clicks: number;
};
export interface IDatabasePort {
  saveLink(link: LinkItem): Promise<number>;
  getLinks(userId: number): Promise<GetLinks[]>;
  getLinkByKey(key: string): Promise<string>;
}
