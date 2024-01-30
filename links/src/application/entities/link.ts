import { CreateLinkRequest } from "yalsh_protos/links/links.js";

export type LinkItem = {
  url: string;
  key: string;
  user_id: number;
  expires_at?: Date | null;
  password?: string | null;
};

export function newLink(link: CreateLinkRequest): LinkItem {
  const { key, url, userId, expiresAt, password } = link;
  return {
    key,
    url,
    user_id: userId,
    expires_at: expiresAt || null,
    password: password || null,
  };
}
