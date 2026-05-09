import { create } from "zustand";
import type { StoreState } from "./types";

type Actions = {
  resetStore(): void;
};

export type BoardStore = StoreState & Actions;

const initialState: StoreState = {
  columns: [],
  tasks: [],
  selectionMode: false,
  activeFilter: "all",
  searchTerm: "",
};

export const useBoardStore = create<BoardStore>(() => ({
  ...initialState,
  resetStore() {},
}));
