import { sql } from "../database/database.js";
import { getRedisClient } from "../database/redis.js";
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
        VALUES (${assignmentId}, ${code}, ${userUuid}, ${
        existingSubmission[0].status
      }, ${existingSubmission[0].grader_feedback}, ${
        existingSubmission[0].correct
      })
        RETURNING *
      `;
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
          SELECT pas.id, pas.status, pas.user_uuid, pas.programming_assignment_id, pas.code, pa.test_code
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

    return { submissionStatus: "ok", ...result[0] };
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return {
        status: "error",
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

const updateGraderFeedback = async (
  {user_uuid,
    id,
  grader_feedback,
  correct,
  status = "processed"},
) => {
  console.log("Updating grader feedback with parameters:", {
    user_uuid,
    id,
    grader_feedback,
    correct,
    status,
  });

  try {
    const result = await sql`
        UPDATE programming_assignment_submissions
        SET status = ${status}, grader_feedback = ${grader_feedback}, correct = ${correct}
        WHERE id = ${id}
          AND user_uuid = ${user_uuid}
        RETURNING *
      `;

    console.log("Update result:", result);
    return result;
  } catch (error) {
    console.error("Error updating grader feedback:", error);
    throw error;
  }
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
  getAllSubmissionsByUser,
  submitSolutionForGrading,
  updateGraderFeedback,
};
