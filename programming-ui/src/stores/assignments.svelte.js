// /stores/assignments.svelte.js
import { writable } from "svelte/store";
import * as assignmentsApi from "../lib/http-actions/assignments-api.js";

function createAssignmentsStore() {
  const { subscribe, set, update } = writable([]);
  let initialized = false;

  return {
    subscribe,
    initAssignments: async () => {
      console.log("Initializing assignments store...");
      if (initialized) {
        console.log("Assignments store already initialized, returning...");
        return;
      }
      try {
        console.log("Fetching assignments from API...");
        const assignments = await assignmentsApi.getAssignments();
        console.log("Fetched data:", assignments);
        if (assignments) {
          console.log(`Fetched ${assignments.length} assignments`);
          set(assignments);
          initialized = true;
        } else {
          console.error("Fetched data does not contain assignments");
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    },
    addAssignment: (assignment) => {
      update((a) => [...a, assignment]);
    },
    updateAssignment: (assignment) => {
      update((a) =>
        a.map((item) => (item.id === assignment.id ? assignment : item))
      );
    },
    reset: () => {
      console.log("Resetting assignments store...");
      set([]);
      initialized = false;
    },
  };
}

export const assignmentsStore = createAssignmentsStore();
export const selectedAssignment = writable(1);
