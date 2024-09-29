import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignments;`;
};

const insert = async (title, assignment_order, handout, test_code) => {
  return await sql`
    INSERT INTO programming_assignments
    (title, assignment_order, handout, test_code)
    VALUES
    (${title}, ${assignment_order}, ${handout}, ${test_code})
    RETURNING *
  `;
};

export { findAll, insert };
