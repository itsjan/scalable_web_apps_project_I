import { writable } from "svelte/store";
import * as assignmentsApi from "../lib/http-actions/assignments-api.js";

const assignments = writable([]);
let initialized = false;

const initAssignments = async () => {
  console.log("Initializing assignments store...");
  if (initialized) {
    console.log("Assignments store already initialized, returning...");
    return;
  }
  try {
    console.log("Fetching assignments from API...");
    const fetchedData = await assignmentsApi.getAssignments();
    console.log("Fetched data:", fetchedData);
    if (fetchedData && fetchedData.assignments) {
      console.log(`Fetched ${fetchedData.assignments.length} assignments`);
      assignments.set(fetchedData.assignments);
      initialized = true;
    } else {
      console.error("Fetched data does not contain assignments");
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
};

const useAssignmentsStore = () => {
  console.log("Creating assignments store...");
  return {
    subscribe: assignments.subscribe,
    addAssignment: (assignment) => {
      assignments.update((a) => [...a, assignment]);
    },
    updateAssignment: (assignment) => {
      assignments.update((a) =>
        a.map((item) => (item.id === assignment.id ? assignment : item))
      );
    },
  };
};

const selectedAssignment = writable(1);

export { initAssignments, selectedAssignment, useAssignmentsStore };
