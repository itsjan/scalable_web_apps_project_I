import { sql } from "../../database/database.js";

const createUser = async (user) => {
  //const userId = crypto.randomUUID().toString();
  await sql`INSERT INTO users (userId, email, password_hash)
    VALUES (${user.userid}, ${user.email}, ${user.passwordHash})`;
};

const findUserByEmail = async (email) => {
  console.log("FIND USER BY EMAIL", email);
  if (!email) {
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  console.log("ROWS", rows);
  return rows?.[0] || {};
};

export { createUser, findUserByEmail };
