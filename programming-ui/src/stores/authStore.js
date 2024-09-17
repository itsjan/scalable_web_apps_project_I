import { writable } from "svelte/store";

const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null,
  });

  return {
    subscribe,
    login: (userData) =>
      update((store) => ({ isAuthenticated: true, user: userData })),
    logout: () => set({ isAuthenticated: false, user: null }),
    setUser: (userData) => update((store) => ({ ...store, user: userData })),
  };
};

export const authStore = createAuthStore();
