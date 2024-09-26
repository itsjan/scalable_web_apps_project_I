import { sql } from "../database/database.js";
import { getRedisClient } from "../database/redis.js";
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

  CREATE TABLE programming_assignments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    assignment_order INTEGER NOT NULL,
    handout TEXT NOT NULL,
    test_code TEXT NOT NULL
  );
);
*/
const submitSolutionForGrading = async (userUuid, assignmentId, code) => {
  let result;

  try {
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

    const existingSubmission = await sql`
      SELECT status, grader_feedback, correct FROM programming_assignment_submissions
      WHERE programming_assignment_id = ${assignmentId}
      AND code = ${code}
      LIMIT 1
    `;

    if (existingSubmission.length > 0) {
      result = await sql`
        INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid, status, grader_feedback, correct)
        VALUES (${assignmentId}, ${code}, ${userUuid}, ${existingSubmission[0].status}, ${existingSubmission[0].grader_feedback}, ${existingSubmission[0].correct})
        RETURNING *
      `;
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // TODO: Update the submission in the database
    } else {
      console.log("No existing submission found. Inserting new submission.");
      console.log("DEBUG: Inserting new submission with values:", {
        assignmentId,
        code,
        userUuid,
      });

      // new submission
      result = await sql`
        INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid, status)
        VALUES (${assignmentId}, ${code}, ${userUuid}, 'pending')
        RETURNING *
      `;

      const submissionId = result[0].id;

      result = await sql`
          SELECT pas.id, pas.user_uuid, pas.programming_assignment_id, pas.code, pa.test_code
          FROM programming_assignment_submissions as pas
          INNER JOIN programming_assignments as pa ON pas.programming_assignment_id = pa.id
          WHERE pas.id = ${submissionId}

        `;

      console.log(result[0]);

      console.log("DEBUG: Getting Redis client");
      const redisClient = await getRedisClient();
      console.log("DEBUG: Pushing submission ID to Redis:", result[0]);
      await redisClient.lpush("submissions", JSON.stringify(result[0]));
      console.log("DEBUG: Submission ID pushed to Redis successfully");
    }

    return { status: "ok", ...result[0] };
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return {
        status: "error",
        code: "SUB-1",
        sqlCode: error.code,
        message:
          "You already have a pending submission. Please wait for it to be graded before submitting another.",
      };
    }
    return {
      status: "error",
      sqlCode: error.code,
      message: "Failed to submit solution for grading",
      error: error.message,
    };
  }
};

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
  CREATE TYPE SUBMISSION_STATUS AS ENUM ('pending', 'processed');
  */

const updateGraderFeedback = async (
  userUuid,
  submissionId,
  graderFeedback,
  correct,
  status = "processed",
) => {
  console.log("Updating grader feedback with parameters:", {
    userUuid,
    submissionId,
    graderFeedback,
    correct,
    status,
  });

  try {
    const result = await sql`
        UPDATE programming_assignment_submissions
        SET status = ${status}, grader_feedback = ${graderFeedback}, correct = ${correct}
        WHERE id = ${submissionId}
          AND user_uuid = ${userUuid}
        RETURNING *
      `;

    console.log("Update result:", result);
    return result;
  } catch (error) {
    console.error("Error updating grader feedback:", error);
    throw error;
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

const submissionsByUser = async (assignmentId, userUuid) => {
  return await sql`
      SELECT id, code, status, grader_feedback, correct
      FROM programming_assignment_submissions
      WHERE programming_assignment_id = ${assignmentId}
      AND user_uuid = ${userUuid}
      ORDER BY programming_assignment_id
    `;
};

const getAllSubmissionsByUser = async (userUuid) => {
  console.log("Starting getAllSubmissionsByUser function");
  console.log("User UUID:", userUuid);

  try {
    const allSubmissions = await sql`
      SELECT id, programming_assignment_id, code, status, grader_feedback, correct
      FROM programming_assignment_submissions
      WHERE user_uuid = ${userUuid}
      ORDER BY programming_assignment_id
    `;
    console.log("All submissions retrieved:", allSubmissions);
    return allSubmissions;
  } catch (error) {
    console.error("Error in getAllSubmissionsByUser:", error);
    throw error;
  }
};

export {
  submissionsByUser,
  submitSolutionForGrading,
  correctSubmission,
  correctSubmissionsByUser,
  getAllSubmissionsByUser,
  updateGraderFeedback,
};
