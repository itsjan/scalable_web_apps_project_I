// /stores/assignments.svelte.js
import { writable } from "svelte/store";
import * as assignmentsApi from "../lib/http-actions/assignments-api.js";

function createAssignmentsStore() {
  const { subscribe, set, update } = writable([]);
  let initialized = false;

  return {
    subscribe,
    initAssignments: async () => {
      if (initialized) {
        return;
      }
      try {
        const assignments = await assignmentsApi.getAssignments();
        if (assignments) {
           set(assignments);
          initialized = true;
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
