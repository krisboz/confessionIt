import { create } from "zustand";
import { fetchUserDataFromFirebase } from "../firebase";

const useUserStore = create((set) => ({
  user: null, //Initialize with null indicating the user is not logged in
  setUser: (userData) => set({ user: userData }),

  getUser: async (uid) => {
    const userData = await fetchUserDataFromFirebase(uid);
    if (userData) {
      set({ user: userData });
    }
  },
}));

export default useUserStore;
