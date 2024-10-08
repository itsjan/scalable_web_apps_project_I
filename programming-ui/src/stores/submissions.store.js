// submission-store.js
import { writable, derived } from "svelte/store";
import {
  
  getAllSubmissionsByUser,
  submitSolutionForGrading,
} from "../lib/http-actions/submissions-api.js";
import { userUuid } from "../stores/stores.js";
import { get } from "svelte/store";
let webSocket; // updates to submissions

export const submissionStore = createSubmissionStore();
function createWebSocketConnection() {
  const wsUrl = `ws://${window.location.host}/ws/user/${get(userUuid)}`;
  webSocket = new WebSocket(wsUrl);

  webSocket.onopen = () => {
    console.log("WebSocket connection established for user:", get(userUuid));
  };

  webSocket.onmessage = (event) => {
    //console.log(event);
    const data = JSON.parse(event.data);
    console.log(data);
    handleWebSocketMessage(data);
  };

  webSocket.onclose = () => {
    console.log("WebSocket connection closed");
    // Attempt to reconnect after a delay
    setTimeout(createWebSocketConnection, 5000);
  };

  webSocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

function handleWebSocketMessage(data) {
  console.log("Handling websocket message:", data);
  switch (data.type) {
    case "submission_update":
      console.log("Handling submission update:", data.submission);
      submissionStore.addOrUpdateSubmission(data.submission);
      break;

    default:
      console.log("Unknown message type:", data.type);
  }
}

function createSubmissionStore() {
  let storedSubmissions = localStorage.getItem("submissions");
  const { subscribe, set, update } = writable(
    storedSubmissions ? JSON.parse(storedSubmissions) : []
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
            JSON.stringify(response.submissions)
          );
          initialized = true;

          // setup websocket connection to the server
          createWebSocketConnection();
        } else {
          console.error(
            "Fetched data does not contain submissions or submissions is not an array"
          );
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    },

    addOrUpdateSubmission: (submission) => {
      update((s) => {
        const index = s.findIndex((item) => item.id === submission.id);
        let newState;
        if (index !== -1) {
          newState = s.map((item) =>
            item.id === submission.id ? { ...item, ...submission } : item
          );
        } else {
          newState = [...s, submission];
        }
        localStorage.setItem("submissions", JSON.stringify(newState));
        return newState;
      });
    },

    clearSubmissions: () => {
      console.log("Resetting submissions store...");
      set([]);
      localStorage.removeItem("submissions");
      initialized = false;
      if (webSocket) {
        webSocket.close();
      }
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
      return result;
    },
    // getCorrectSubmissions: async () => {
    //   return await correctSubmissionsByUser(get(userUuid));
    // },
    filter: (predicate) => {
      return get(submissionStore).filter(predicate);
    },

    hasSubmissions: (assignment_id) => {
      return get(submissionStore).some(
        (submission) => submission.programming_assignment_id === assignment_id
      );
    },
    getSubmissionsForAssignment: (assignment_id) => {      
      const filteredAndSorted = get(submissionStore)
        .filter(
          (submission) => submission.programming_assignment_id === assignment_id
        )
        .sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id));    
      return filteredAndSorted;
    },

    lastSubmission: (assignment_id) => {
      return get(submissionStore).filter(
        (submission) => submission.programming_assignment_id === assignment_id
      )[0];
    },
  };
}


export const resolvedAssignmentIds = derived(
  submissionStore,
  ($submissionStore) => {
    // Return an array of unique assignment ids that have been resolved by the user
    const resolvedIds = new Set(
      $submissionStore
      .filter((submission) => submission.correct)
      .map((submission) => submission.programming_assignment_id)
    );
    
    return Array.from(resolvedIds);
  }
);


export const pointsEarned = derived(submissionStore, ($submissionStore) => {
  // 100 points for each resolved assignment id
  const num = new Set(
    $submissionStore
    .filter((submission) => submission.correct)
    .map((submission) => submission.programming_assignment_id)
  ).size;
  return 100 * num;
});


