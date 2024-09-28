// /stores/assignments.store.js
import { writable } from "svelte/store";
import * as assignmentsApi from "../lib/http-actions/assignments-api.js";

function createAssignmentsStore() {
  const debug = (message, ...args) => {
    console.log(`[AssignmentsStore] ${message}`, ...args);
  };

  const { subscribe, set, update } = writable([]);
  let initialized = false;

  return {
    subscribe,
    initAssignments: async () => {
      debug("Initializing assignments store...");
      if (initialized) {
        debug("Assignments store already initialized, returning...");
        return;
      }
      try {
        debug("Fetching assignments from API...");
        const assignments = await assignmentsApi.getAssignments();
        debug("Fetched data:", assignments);
        if (assignments) {
          debug(`Fetched ${assignments.length} assignments`);
          set(assignments);
          initialized = true;
        } else {
          debug("Fetched data does not contain assignments");
        }
      } catch (error) {
        debug("Error fetching assignments:", error);
      }
    },
    setSelectedAssignmentById: (id) => {
      debug("Setting selected assignment by ID:", id);

      update((assignments) => {
        const assignment = assignments.find((a) => a.id === id);
        if (assignment) {
          selectedAssignment.set(assignment);
        }
        return assignments;
      });
    },

    addAssignment: (assignment) => {
      update((a) => [...a, assignment]);
    },
    updateAssignment: (assignment) => {
      update((a) =>
        a.map((item) => (item.id === assignment.id ? assignment : item))
      );
    },
    updateAssignments: (lastCompletedId) => {
      debug("Updating assignments with lastCompletedId:", lastCompletedId);

      update((assignments) => {
        return assignments.map((assignment) => ({
          ...assignment,
          isCompleted: assignment.id <= lastCompletedId,
        }));
      });
    },

    reset: () => {
      console.log("Resetting assignments store...");
      set([]);
      initialized = false;
    },
  };
}

export const assignmentsStore = createAssignmentsStore();
export const selectedAssignment = writable(null);
