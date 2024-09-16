import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignments;`;
};

const findAllForUser = async (userUuid) => {
  return await sql`
    SELECT pa.*,
           COALESCE(pas.correct, FALSE) as completed
    FROM programming_assignments pa
    LEFT JOIN programming_assignment_submissions pas
      ON pa.id = pas.programming_assignment_id
      AND pas.user_uuid = ${userUuid}
    ORDER BY pa.assignment_order;
  `;
};

const lastAssignmentCompletedByUser = async (userUuid) => {
  
  // the max of completed assignments based on the assignment_order,
  // or 1 if no completed assignments
  return await sql`
    SELECT MAX(pa.assignment_order) as max_completed
    FROM programming_assignments pa
    LEFT JOIN programming_assignment_submissions pas
      ON pa.id = pas.programming_assignment_id
      AND pas.user_uuid = ${userUuid}
    WHERE pas.correct = TRUE
    LIMIT 1;
  `;
};

  const correctSubmissionsByUser = async (userUuid) => {
    return await sql`
      SELECT id
      FROM programming_assignment_submissions
      WHERE user_uuid = ${userUuid} AND correct = true
      ORDER BY programming_assignment_id
    `;
  };


export { findAll, findAllForUser, correctSubmissionsByUser, lastAssignmentCompletedByUser };