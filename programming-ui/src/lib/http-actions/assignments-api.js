import { userUuid } from "../../stores/stores.js";

import { get } from "svelte/store";

import { selectedAssignment } from "../../stores/assignments.svelte";
import { authStore } from "../../stores/authStore.js";

const getAssignments = async () => {
  try {
    const response = await fetch(`/api/assignments`);
    // if response is status 401, we need to log the user out
    if (response.status === 401) {
      authStore.logout();
    }
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

async function loginUser(email, password) {
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const user = await response.json();
      authStore.login(user);
    } else {
      throw new Error("Login failed");
    }
  } finally {
    // Handle success or failure
  }
}

async function registerUser(email, password, verification) {
  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, verification }),
    });

    if (response.ok) {
      const user = await response.json();
      authStore.login(user);
    } else {
      throw new Error("Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    // Handle error (e.g., show message to user)
  }
}

async function logoutUser() {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      authStore.logout();
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Handle error (e.g., show message to user)
  }
}

/* Submimssions */
const submitSolutionForGrading = async (assignmentId, code) => {
  try {
    const response = await fetch(
      `/api/user/${get(userUuid)}/submissions/${assignmentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }
    );
    console.log(response);

    if (response.ok) {
      const submissionId = await response.json();
      console.log("Submission ID:", submissionId);
      return submissionId;
    } else {
      throw new Error("Submission failed", response);
    }
  } catch (error) {
    console.error("Submission error:", error);
    // Handle error (e.g., show message to user)
  }
};

export {
  getAssignments,
  loginUser,
  registerUser,
  logoutUser,
  submitSolutionForGrading,
};
