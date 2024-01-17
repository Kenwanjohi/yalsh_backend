import { ProfileUser, User, UserUpdate } from "../application/entities/account";

export interface IDatabasePort {
  getUser(user_id: number): Promise<User>;
  saveUser(user: User): Promise<ProfileUser>;
  updateUser(user: UserUpdate): Promise<boolean>;
}
