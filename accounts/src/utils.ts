import bcrypt from "bcrypt";
const saltRounds = 10;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
}
