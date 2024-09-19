// submission-store.js
import { writable } from "svelte/store";
import {
  submitSolutionForGrading,
  correctSubmissionsByUser,
  getAllSubmissionsByUser,
} from "../lib/http-actions/submissions-api.js";
import { userUuid } from "../stores/stores.js";
import { get } from "svelte/store";

function createSubmissionStore() {
  let storedSubmissions = localStorage.getItem("submissions");
  const { subscribe, set, update } = writable(
    storedSubmissions ? JSON.parse(storedSubmissions) : [],
  );
  let initialized = false;

  return {
    subscribe,
    initSubmissions: async () => {
      console.log("Initializing submissions store...");
      if (initialized) {
        console.log("Submissions store already initialized, returning...");
        return;
      }
      try {
        console.log("Fetching all submissions from API...");
        const response = await getAllSubmissionsByUser(get(userUuid));
        console.log("Fetched data:", response);
        if (
          response &&
          response.submissions &&
          Array.isArray(response.submissions)
        ) {
          console.log(`Fetched ${response.submissions.length} submissions`);
          set(response.submissions);
          localStorage.setItem(
            "submissions",
            JSON.stringify(response.submissions),
          );
          initialized = true;
        } else {
          console.error(
            "Fetched data does not contain submissions or submissions is not an array",
          );
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    },
    addSubmission: (submission) => {
      update((s) => {
        const newState = [...s, submission];
        localStorage.setItem("submissions", JSON.stringify(newState));
        return newState;
      });
    },
    updateSubmission: (id, updates) => {
      update((s) => {
        const newState = s.map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        );
        localStorage.setItem("submissions", JSON.stringify(newState));
        return newState;
      });
    },
    clearSubmissions: () => {
      console.log("Resetting submissions store...");
      set([]);
      localStorage.removeItem("submissions");
      initialized = false;
    },
    update: (updater) => {
      update((s) => {
        const newState = updater(s);
        localStorage.setItem("submissions", JSON.stringify(newState));
        return newState;
      });
    },
    submitSolution: async (assignmentId, code) => {
      const result = await submitSolutionForGrading(assignmentId, code);
      if (result.status === "ok") {
        update((s) => {
          const newState = [...s, ...result.data];
          localStorage.setItem("submissions", JSON.stringify(newState));
          return newState;
        });
      }
      return result;
    },
    getCorrectSubmissions: async () => {
      return await correctSubmissionsByUser(get(userUuid));
    },
    filter: (predicate) => {
      return get(submissionStore).filter(predicate);
    },
    hasCorrectSolution: (assignment_id) => {
      return get(submissionStore).some(
        (submission) =>
          submission.programming_assignment_id === assignment_id &&
          submission.correct === true &&
          submission.status === "processed",
      );
    },
    hasPendingSolution: (assignment_id) => {
      return get(submissionStore).some(
        (submission) =>
          submission.programming_assignment_id === assignment_id &&
          submission.status === "pending",
      );
    },
    hasIncorrectSolution: (assignment_id) => {
      return get(submissionStore).some(
        (submission) =>
          submission.programming_assignment_id === assignment_id &&
          submission.correct === false &&
          submission.status === "processed",
      );
    },
  };
}

export const submissionStore = createSubmissionStore();

// Console log for debugging
submissionStore.subscribe((value) => {
  console.log("Current submission store value:", value);
});
