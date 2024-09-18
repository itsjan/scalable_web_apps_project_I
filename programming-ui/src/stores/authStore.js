import { writable } from "svelte/store";
import { assignmentsStore } from "./assignments.svelte.js";

const STORAGE_KEY = "programming-ui-auth";

const createAuthStore = () => {
  // Load initial state from localStorage
  const storedAuth = localStorage.getItem(STORAGE_KEY);
  const initialState = storedAuth
    ? JSON.parse(storedAuth)
    : { isAuthenticated: false, user: null };

  const { subscribe, set, update } = writable(initialState);

  // Helper function to update localStorage
  const updateStorage = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  return {
    subscribe,
    login: async (userData) => {
      console.log("User data updated during login:", userData);
      await assignmentsStore.initAssignments();
      return update((store) => {
        const newState = { isAuthenticated: true, user: userData };
        updateStorage(newState);
        return newState;
      });
    },
    logout: () => {
      console.log("User data cleared during logout");
      assignmentsStore.reset();
      const newState = { isAuthenticated: false, user: null };
      updateStorage(newState);
      return set(newState);
    },
    setUser: (userData) => {
      console.log("User data updated:", userData);
      return update((store) => {
        const newState = { ...store, user: userData };
        updateStorage(newState);
        return newState;
      });
    },
  };
};

export const authStore = createAuthStore();
