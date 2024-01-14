import { ProfileUser, User } from "../application/entities/account";

export interface IAPIPort {
  createUser(user: User): Promise<ProfileUser>;
}
