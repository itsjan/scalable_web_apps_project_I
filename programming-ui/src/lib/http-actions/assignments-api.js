import { userUuid } from "../../stores/stores.js";
import { selectedAssignment } from "../../stores/assignments.svelte";
import { authStore } from "../../stores/authStore.js";

const getAssignments = async () => {
  console.log("Fetching assignments for user:", userUuid);
  try {
    const response = await fetch(`/api/assignments`);
    // if response is status 401, we need to log the user out
    if (response.status === 401) {
      authStore.logout();
    }
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
  } catch (error) {
    console.error("Login error:", error);
    // Handle error (e.g., show message to user)
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

export { getAssignments, loginUser, registerUser, logoutUser };
