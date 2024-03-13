import fp from "fastify-plugin";

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
};

export type CreateUserResponse = {
  userId: number;
  username: string;
};

export type UpdateUserRequest = {
  username?: string;
  email?: string;
  password?: string;
};
export default fp(async function accountsAutoHooks(fastify, options) {
  const { sql } = fastify;

  fastify.decorate("dataSource", {
    async saveUser(user: CreateUserRequest) {
      const newUser = await sql<CreateUserResponse[]>`
        INSERT INTO users
        ${sql(user)}
        returning user_id, username
        `;
      return newUser[0];
    },

    async getUserById(userId: number) {
      const user = await sql<
        { username: string; email: string; password: string }[]
      >`SELECT username, email, password FROM users WHERE user_id=${userId}`;
      return user[0];
    },

    async updateUser(userId: number, updateUserProps: UpdateUserRequest) {
      const withValues: {
        [key: string]: string | undefined;
      } = {};

      for (const key in updateUserProps) {
        const value = updateUserProps[key as keyof UpdateUserRequest];
        if (value) {
          withValues[key] = value;
        }
      }

      const res = await sql`
          UPDATE users set ${sql(
            withValues
          )} where user_id=${userId} returning user_id
        `;

      return res[0]?.userId ? true : false;
    },

    async deleteUser(userId: number): Promise<boolean> {
      const res =
        await sql`DELETE FROM users WHERE user_id =${userId} returning user_id`;
      return res[0]?.userId ? true : false;
    },
  });
});

declare module "fastify" {
  interface FastifyInstance {
    dataSource: {
      saveUser(user: CreateUserRequest): Promise<CreateUserResponse>;
      getUserById(
        userId: number
      ): Promise<{ username: string; email: string; password: string }>;
      updateUser(
        userId: number,
        updateUserProps: UpdateUserRequest
      ): Promise<boolean>;
      deleteUser(userId: number): Promise<boolean>;
    };
  }
}
