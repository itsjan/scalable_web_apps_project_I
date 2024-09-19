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
const submitSolutionForGrading = async (userUuid, assignmentId, code) => {
  try {
    console.log("Attempting to submit solution with params:", {
      userUuid,
      assignmentId,
      code,
    });

    if (
      userUuid === undefined ||
      assignmentId === undefined ||
      code === undefined
    ) {
      console.error("One or more parameters are undefined:", {
        userUuid,
        assignmentId,
        code,
      });
      throw new Error("Missing required parameters");
    }

    const result = await sql`
      INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid)
      VALUES (${assignmentId}, ${code}, ${userUuid})
      RETURNING id;
    `;
    console.log("Solution submitted successfully:", result);
    return { status: "ok", data: result };
  } catch (error) {
    console.error("Error submitting solution for grading:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return {
      status: "error",
      message: "Failed to submit solution for grading",
      error: error.message,
    };
  }
};

const correctSubmission = async (userUuid, assignmentId, submissionId) => {
  return await sql`
    UPDATE programming_assignment_submissions
    SET correct = TRUE
    WHERE id = ${submissionId}
      AND user_uuid = ${userUuid}
      AND programming_assignment_id = ${assignmentId}
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

export {
  submitSolutionForGrading,
  correctSubmission,
  correctSubmissionsByUser,
};
