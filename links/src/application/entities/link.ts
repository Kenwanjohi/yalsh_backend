import { CreateLinkRequest } from "yalsh_protos/dist/links/links";

export type LinkItem = {
  url: string;
  key: string;
  user_id: number;
  expires_at: number;
};

export function newLink(link: CreateLinkRequest): LinkItem {
  const { key, url, userId, expiresAt } = link;
  return {
    key,
    url,
    user_id: userId,
    expires_at: expiresAt,
  };
}
