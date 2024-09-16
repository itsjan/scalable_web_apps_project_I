import { userUuid } from "../../stores/stores.js";
import { selectedAssignment } from "../../stores/selectedAssignment.js";

const getAssignments = async () => {
  console.log("Fetching assignments for user:", userUuid);
  try {
    const response = await fetch(`/api/user/${userUuid}/assignments`);
    const data = await response.json();
    console.log("Received data from API:", data);

    const assignments = data.assignments || [];
    const lastOneCompleted = data.lastOneCompleted?.[0]?.max_completed ?? 0;
    const correctSolutions = data.correctSolutions || [];

    if (selectedAssignment.value === 0) {
      selectedAssignment.update((n) => 1);
    }

    return {
      assignments,
      lastOneCompleted,
      correctSolutions,
    };
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return { assignments: [], lastOneCompleted: 0, correctSolutions: [] };
  }
};

export { getAssignments };
