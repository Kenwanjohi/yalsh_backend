import fp from "fastify-plugin";
import { newLink } from "./entities";

export interface Link {
  linkId: number;
  url: string;
  key: string;
  clicks: number;
}

export type CreateLinkRequest = {
  url: string;
  key: string;
  userId: number;
  expiresAt?: Date;
  password?: string;
};

export default fp(async function linksAutoHooks(fastify, options) {
  const { sql, log } = fastify;

  fastify.decorate("dataSource", {
    async getLinks(userId: number): Promise<Link[]> {
      try {
        const links = await sql<
          Link[]
        >`SELECT link_id as linkId, url, key, clicks FROM links WHERE user_id=${userId}`;

        return links;
      } catch (error) {
        log.error(error);
        throw new Error("Failed to fetch links");
      }
    },
    async createLink(link: CreateLinkRequest): Promise<number> {
      try {
        const linkToSave = newLink(link);
        const savedLink = await sql<{ linkId: number }[]>`
          INSERT INTO links ${sql(linkToSave)} RETURNING link_id as "linkId"
        `;
        return savedLink[0].linkId;
      } catch (error) {
        log.error(error);
        throw new Error("Failed to save link");
      }
    },
  });
});

declare module "fastify" {
  interface FastifyInstance {
    dataSource: {
      getLinks(userId: number): Promise<Link[]>;
      createLink(link: CreateLinkRequest): Promise<number>;
    };
  }
}
