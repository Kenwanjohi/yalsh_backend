import bcrypt from "bcrypt"; 

export async function hashPassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
}
