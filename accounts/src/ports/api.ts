import { ProfileUser, User, UserUpdate } from "../application/entities/account";

export interface IAPIPort {
  createUser(user: User): Promise<ProfileUser>;
  updateUser(user: UserUpdate): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
}
