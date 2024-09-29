// submission-api.js

import { userUuid } from "../../stores/stores.js";
import { get } from "svelte/store";

/* Submissions */
const submitSolutionForGrading = async (assignmentId, code) => {
  try {
    const response = await fetch(
      `/api/user/${get(userUuid)}/submissions/${assignmentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }
    );
    console.log("Submission response:", response);

    const result = await response.json();
    console.log("Submission result:", result);

    if (response.ok) {
      //console.log("Submission ID:", result.data.id);
      return {
        status: "ok",
        submission_id: result.id || "?",
        code: result.code || "SUCCESS",
        message: "Solution submitted successfully",
        data: result.data,
      };
    } else {
      return {
        status: "error",
        code: result.code || "UNKNOWN_ERROR",
        message: result.message || "Failed to submit solution for grading",
      };
    }
  } catch (error) {
    console.error("Submission error:", error);
    return {
      status: "error",
      code: "FETCH_ERROR",
      message: "Failed to submit solution for grading",
    };
  }
};

const getAllSubmissionsByUser = async (userUuid) => {
  try {
    const response = await fetch(`/api/user/${userUuid}/submissions`);
    const allSubmissions = await response.json();
    console.log("Received all submissions:", allSubmissions);
    return allSubmissions;
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }
};

// const getSubmissionsByUser = async (userUuid, assignmentId) => {
//   try {
//     const response = await fetch(
//       `/api/user/${userUuid}/submissions/${assignmentId}`
//     );
//     const submissions = await response.json();
//     console.log("Received submissions:", submissions);
//     return submissions;
//   } catch (error) {
//     console.error("Error fetching submissions:", error);
//     return [];
//   }
// };

const correctSubmissionsByUser = async (userUuid) => {
  return await sql`
      SELECT id
      FROM programming_assignment_submissions
      WHERE user_uuid = ${userUuid} AND correct = true
      ORDER BY programming_assignment_id
    `;
};

export {
  correctSubmissionsByUser,
  getAllSubmissionsByUser,
  //getSubmissionsByUser,
  submitSolutionForGrading,
};
