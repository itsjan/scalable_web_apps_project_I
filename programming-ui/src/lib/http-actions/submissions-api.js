// submission-api.js

import { userUuid } from "../../stores/stores.js";
import { get } from "svelte/store";

/* Submissions */
export const submitSolutionForGrading = async (assignmentId, code) => {
  try {
    const response = await fetch(
      `/api/user/${get(userUuid)}/submissions/${assignmentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }
    );

    const result = await response.json();

    if (response.ok) {
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

export const getAllSubmissionsByUser = async (userUuid) => {
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


export const correctSubmissionsByUser = async (userUuid) => {
  return await sql`
      SELECT id
      FROM programming_assignment_submissions
      WHERE user_uuid = ${userUuid} AND correct = true
      ORDER BY programming_assignment_id
    `;
};

