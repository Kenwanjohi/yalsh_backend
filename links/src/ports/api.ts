import { LinkItem } from "../application/entities/link";
export interface IAPIPort {
  createLink(link: LinkItem): Promise<number>;
}
