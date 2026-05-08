import { create } from "zustand";
import type { BoardState } from "./types";

type BoardActions = {
  resetBoard(): void;
};

export type BoardStore = BoardState & BoardActions;

const initialBoardState: BoardState = {
  columns: [],
  tasks: [],
  selectionMode: false,
  activeFilter: "all",
  searchTerm: "",
};

export const useBoardStore = create<BoardStore>(() => ({
  ...initialBoardState,
  resetBoard() {},
}));
