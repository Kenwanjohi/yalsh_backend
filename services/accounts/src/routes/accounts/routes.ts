import fp from "fastify-plugin";
import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import bcrypt from "bcrypt";
import { hashPassword } from "../../utils";
const accounts: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post(
    "/",
    {
      schema: {
        body: {
          title: "New user",
          description: "New user details",
          type: "object",
          properties: {
            username: { description: "username", type: "string" },
            email: { description: "email", type: "string", format: "email" },
            password: { description: "password", type: "string" },
          },
          required: ["username", "email", "password"],
          additionalProperties: false,
        },
      },
    },
    async function registerHandler(request, reply) {
      const { username, email, password } = request.body;
      try {
        const passwordHash = await hashPassword(password);
        const res = await this.dataSource.saveUser({
          username,
          email,
          password: passwordHash,
        });
        request.user = { userId: res.userId, username: res.username };
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
          .send({ registered: true });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ registered: false });
      }
    }
  );

  fastify.get("/", {}, async function getAccountHandler(request, reply) {
    const userId = request.headers["x-user-id"];
    try {
      const { username, email } = await this.dataSource.getUserById(
        Number(userId)
      );
      reply.code(200).send({ userId, username, email });
    } catch (err) {
      reply.internalServerError();
    }
  });

  fastify.patch(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { description: "user's id", type: "string" },
          },
          required: ["id"],
        },
        body: {
          title: "Update user",
          description: "Update user details",
          type: "object",
          properties: {
            username: { description: "username", type: "string" },
            email: { description: "email", type: "string", format: "email" },
            newPassword: { description: "new password", type: "string" },
            password: { description: "password", type: "string" },
          },
          dependencies: {
            newPassword: ["password"],
          },
          additionalProperties: false,
        },
      },
    },
    async function updateHandler(request, reply) {
      const userId = request.headers["x-user-id"];
      if (userId !== request.params.id) {
        reply.unauthorized();
        return;
      }
      const updateUserProps = { userId, ...request.body };
      let newPassword;
      try {
        if (updateUserProps?.newPassword && updateUserProps?.password) {
          const currentUser = await this.dataSource.getUserById(Number(userId));
          if (!currentUser) return false;

          const isPasswordCorrect = await bcrypt.compare(
            updateUserProps?.password,
            currentUser.password
          );
          // Prevention of Unauthorized Changes
          if (!isPasswordCorrect) {
            return false;
          }
          newPassword = await hashPassword(updateUserProps?.newPassword);
        }

        const { username, email } = updateUserProps;
        const updated = await this.dataSource.updateUser(Number(userId), {
          username,
          email,
          password: newPassword,
        });
        reply.code(200).send({ updated });
      } catch (error) {
        reply.internalServerError();
      }
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { description: "user's id", type: "string" },
          },
          required: ["id"],
          additionalProperties: false,
        },
      },
    },
    async function deleteUserHandler(request, reply) {
      const userId = request.headers["x-user-id"];
      if (userId !== request.params.id) {
        reply.unauthorized();
        return;
      }
      try {
        const deleted = await this.dataSource.deleteUser(Number(userId));
        reply.code(200).send({ deleted });
      } catch (err) {
        reply.internalServerError();
      }
    }
  );
};

export default fp(accounts, { encapsulate: true });
