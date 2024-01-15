import { UpdateUserRequest } from "yalsh_protos/dist/accounts/accounts";

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
  username?: string;
  email?: string;
  new_password?: string;
  password?: string;
};

export function userUpdate(user: UpdateUserRequest): UserUpdate {
  const updatedUser = {};
  
  for (const key in user) {
    const value = user[key];
    if (value) {
      updatedUser[key] = value;
    }
  }

  return updatedUser;
}
