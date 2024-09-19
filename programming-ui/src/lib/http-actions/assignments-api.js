import { userUuid } from "../../stores/stores.js";
import { get } from "svelte/store";
import { selectedAssignment } from "../../stores/assignments.svelte";

const getAssignments = async () => {
  try {
    const response = await fetch(`/api/assignments`);
    const assignments = (await response.json()) || [];
    console.log("Received data from API:", assignments);

    if (selectedAssignment.value === 0) {
      selectedAssignment.update((n) => 1);
    }

    return assignments;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return { assignments: [], lastOneCompleted: 0, correctSolutions: [] };
  }
};

/* Submissions */
const submitSolutionForGrading = async (assignmentId, code) => {
  try {
    const response = await fetch(
      `/api/user/${get(userUuid)}/submissions/${assignmentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      },
    );
    console.log(response);

    const result = await response.json();

    if (response.ok) {
      console.log("Submission ID:", result.data[0].id);
      return {
        status: "ok",
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

export { getAssignments, submitSolutionForGrading };
