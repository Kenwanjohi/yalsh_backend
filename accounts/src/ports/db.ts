import { ProfileUser, User, UserUpdate } from "../application/entities/account.js";

export interface IDatabasePort {
  getUserById(user_id: number): Promise<User>;
  getUser(email: string): Promise<{
    user_id: number;
    username: string;
    email: string;
    password: string;
  }>;
  saveUser(user: User): Promise<ProfileUser>;
  updateUser(user: UserUpdate): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
}
