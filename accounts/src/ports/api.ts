import { AuthUserRequest } from "yalsh_protos/dist/accounts/accounts";
import { ProfileUser, User, UserUpdate } from "../application/entities/account";

export interface IAPIPort {
  createUser(user: User): Promise<ProfileUser>;
  updateUser(user: UserUpdate): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
  authenticateUser(
    user: AuthUserRequest
  ): Promise<{ userId: number; username: string }>;
  getUserProfile(id: number): Promise<{ username: string; email: string }>;
}
