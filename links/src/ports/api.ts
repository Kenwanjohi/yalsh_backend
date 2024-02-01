import { Link } from "yalsh_protos/links/links.js";
import { LinkItem } from "../application/entities/link.js";
export interface IAPIPort {
  createLink(link: LinkItem): Promise<number>;
  getLinks(userId: number): Promise<Link[]>;
  linkLookup(key: string): Promise<string>;
}
