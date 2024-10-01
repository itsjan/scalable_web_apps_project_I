// assignments.js
import { selectedAssignment } from "../../stores/assignments.store.js";

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

export { getAssignments };


