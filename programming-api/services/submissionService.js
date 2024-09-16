import { sql } from "../database/database.js";

/*
CREATE TABLE programming_assignment_submissions (
  id SERIAL PRIMARY KEY,
  programming_assignment_id INTEGER REFERENCES programming_assignments(id),
  code TEXT NOT NULL,
  user_uuid TEXT NOT NULL,
  status SUBMISSION_STATUS NOT NULL DEFAULT 'pending',
  grader_feedback TEXT,
  correct BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

const correctSubmissionsByUser = async (userUuid) => {
  return await sql`
    SELECT *
    FROM programming_assignment_submissions
    WHERE user_uuid = ${userUuid} AND correct = true
    ORDER BY programming_assignment_id
  `;
};



export { correctSubmissionsByUser };