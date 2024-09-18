import { writable } from "svelte/store";
import { assignmentsStore } from "./assignments.svelte.js";

const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null,
  });

  return {
    subscribe,
    login: async (userData) => {
      console.log("User data updated during login:", userData);
      await assignmentsStore.initAssignments();
      return update((store) => ({ isAuthenticated: true, user: userData }));
    },
    logout: () => {
      console.log("User data cleared during logout");
      assignmentsStore.reset();
      return set({ isAuthenticated: false, user: null });
    },
    setUser: (userData) => {
      console.log("User data updated:", userData);
      return update((store) => ({ ...store, user: userData }));
    },
  };
};

export const authStore = createAuthStore();
