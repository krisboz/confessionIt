import { create } from "zustand";

const useErrorStore = create((set) => ({
  errorMessage: null,

  setError: (message) => {
    set({ errorMessage: message });
  },

  clearError: () => {
    set({ errorMessage: null });
  },
}));
export default useErrorStore;
