import { Link } from "yalsh_protos/dist/links/links";
import { LinkItem } from "../application/entities/link";
export interface IAPIPort {
  createLink(link: LinkItem): Promise<number>;
  getLinks(userId: number): Promise<Link[]>;
}
