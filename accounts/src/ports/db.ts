import { ProfileUser, User } from "../application/entities/account";

export interface IDatabasePort {
  saveUser(user: User): Promise<ProfileUser>;
}
