import { sql } from "../database/database.js";
import { getRedisClient } from "../database/redis.js";


/*
// Submits a solution for grading.
// When a programming assignment is submitted, the submission is stored into the database table 
// programming_assignment_submissions. Upon submission, submissions with the same code to the 
// same assignment are looked for from the database table. If a matching entry is found, 
// the values for submission_status, grader_feedback, and correct are copied from the matching 
// submission, and the code is not sent for grading. Otherwise, the submission is sent for grading. 
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

    // check if submission already exists
    const existingSubmission = await sql`
      SELECT status, grader_feedback, correct FROM programming_assignment_submissions
      WHERE programming_assignment_id = ${assignmentId}
      AND code = ${code}
      LIMIT 1
    `;
    // copy values from existing submission and INSERT
    if (existingSubmission.length > 0) {
      result = await sql`
        INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid, status, grader_feedback, correct)
        VALUES (${assignmentId}, ${code}, ${userUuid}, ${existingSubmission[0].status
        }, ${existingSubmission[0].grader_feedback}, ${existingSubmission[0].correct
        })
        RETURNING *
      `;
    } else { // *new submisson*
      // No existing submission found. Inserting new submission
      result = await sql`
        INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid, status)
        VALUES (${assignmentId}, ${code}, ${userUuid}, 'pending')
        RETURNING *
      `;
      // Get submission ID from result
      const submissionId = result[0].id;
      // join the submission with the assignment to get code and test code required for grading
      result = await sql`
          SELECT pas.id, pas.status, pas.user_uuid, pas.programming_assignment_id, pas.code, pa.test_code
          FROM programming_assignment_submissions as pas
          INNER JOIN programming_assignments as pa ON pas.programming_assignment_id = pa.id
          WHERE pas.id = ${submissionId}
        `;

      // we have a queue of submissions. Push to Redis
      const redisClient = await getRedisClient();
      await redisClient.lpush("submissions", JSON.stringify(result[0]));
    } // end of else *new submisson* 

    return { submissionStatus: "ok", ...result[0] };

  } catch (error) {
    // User can have only one pending submission, enforced on the db layer
    if (error.code === "23505") {
      // Unique constraint violation
      return {
        status: "error",
        sqlCode: error.code,
        message:
          "You already have a pending submission. Please wait for it to be graded before submitting another.",
      };
    } // some other error
    return {
      status: "error",
      sqlCode: error.code,
      message: "Failed to submit solution for grading",
      error: error.message,
    };
  }
};

/*
// Updates the grader feedback in the database
*/
const updateGraderFeedback = async ({ user_uuid, id, grader_feedback, correct, status = "processed" }) => {

  try {
    const result = await sql`
        UPDATE programming_assignment_submissions
        SET status = ${status}, grader_feedback = ${grader_feedback}, correct = ${correct}
        WHERE id = ${id}
          AND user_uuid = ${user_uuid}
        RETURNING *
      `;
    return result;
  } catch (error) {
    console.error("Error updating grader feedback:", error);
    throw error;
  }
};

/*
// Gets all submissions by user
*/
const getAllSubmissionsByUser = async (userUuid) => {

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
