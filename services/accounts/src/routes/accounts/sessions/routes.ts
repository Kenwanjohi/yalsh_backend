import fp from "fastify-plugin";
import bcrypt from "bcrypt";
import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";

const sessions: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  // Login
  fastify.post(
    "/",
    {
      schema: {
        body: {
          title: "Login",
          description: "Login info",
          type: "object",
          properties: {
            email: { description: "email", type: "string", format: "email" },
            password: { description: "password", type: "string" },
          },
          required: ["email", "password"],
          additionalProperties: false,
        },
      },
    },
    async function loginHandler(request, reply) {
      const { email, password } = request.body;
      try {
        const userAccount = await this.dataSource.getUserByEmail(email);
        if (userAccount) {
          const { userId, username } = userAccount;
          const isPasswordCorrect = await bcrypt.compare(
            password,
            userAccount.password
          );
          if (isPasswordCorrect) {
            request.user = { userId, username };
            const accessToken = await request.createToken({ expiresIn: "14d" });
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 14);

            reply
              .setCookie("accessToken", accessToken, {
                path: "/",
                secure: true,
                httpOnly: true,
                expires: expirationDate,
                sameSite: "strict",
              })
              .code(200)
              .send({ authenticated: true });
          }
        }
        throw new Error("Incorrect email or password");
      } catch (error) {
        reply.status(401).send(error);
      }
    }
  );

  // Logout user
  fastify.delete("/", {}, async function logoutHandler(request, reply) {
    request.blackListToken(reply);
    reply.clearCookie("accessToken").code(204);
  });
};

export default fp(sessions, { encapsulate: true });
