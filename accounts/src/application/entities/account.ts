import { UpdateUserRequest } from "yalsh_protos/accounts/accounts.js";

export type User = {
  username: string;
  email: string;
  password: string;
};

export type ProfileUser = {
  user_id: number;
  username: string;
};

export type UserUpdate = {
  user_id: number;
  username?: string;
  email?: string;
  new_password?: string;
  password?: string;
};

export function userUpdate(user: UpdateUserRequest): UserUpdate {
  const { userId: user_id, newPassword: new_password, ...rest } = user;
  return { user_id, new_password, ...rest };
}
