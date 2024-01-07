import { LinkItem } from "../application/entities/link";
export interface IDatabasePort {
  saveLink(link: LinkItem): Promise<number>;
}
