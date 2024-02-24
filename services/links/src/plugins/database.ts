import fp from "fastify-plugin";
import postgres from "postgres";

export default fp(async function (fastify, options) {
  const sql = postgres(`${process.env.PG_CONN}`);
  fastify.decorate("sql", sql);
});

declare module "fastify" {
  export interface FastifyInstance {
    sql: postgres.Sql;
  }
}
