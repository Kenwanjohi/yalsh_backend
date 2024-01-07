import { CreateLinkRequest } from "yalsh_protos/dist/links/links"

export type LinkItem = {
  url: string;
  key: string;
  user_id: number;
  created_at: number;
};

export function newLink(link: CreateLinkRequest): LinkItem {
  return {
    ...link,
    user_id: link.userId,
    created_at: link.createdAt
  }
}