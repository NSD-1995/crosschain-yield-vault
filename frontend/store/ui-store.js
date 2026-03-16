"use client";

import { create } from "zustand";

export const useUiStore = create((set) => ({
  globalError: "",
  txItems: [],

  setGlobalError: (message) => set({ globalError: message }),

  addTx: (tx) =>
    set((state) => ({
      txItems: [tx, ...state.txItems],
    })),

  updateTx: (hash, updates) =>
    set((state) => ({
      txItems: state.txItems.map((item) =>
        item.hash === hash ? { ...item, ...updates } : item,
      ),
    })),

  clearGlobalError: () => set({ globalError: "" }),
}));
