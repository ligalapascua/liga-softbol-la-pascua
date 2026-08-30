// Estado global (Zustand): temporada, categoría seleccionada.
import { create } from "zustand";
import { DEFAULT_SEASON_ID } from "../lib/api";
import type { FixtureGroup } from "../lib/types";

interface AppState {
  seasonID: number;
  seasonName: string;
  categories: FixtureGroup[];
  selectedCategory: FixtureGroup | null;

  setSeason: (id: number, name: string) => void;
  setCategories: (groups: FixtureGroup[]) => void;
  selectCategory: (group: FixtureGroup | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  seasonID: DEFAULT_SEASON_ID,
  seasonName: "2026",
  categories: [],
  selectedCategory: null,

  setSeason: (id, name) => set({ seasonID: id, seasonName: name }),
  setCategories: (groups) => {
    const divisions = groups.filter((g) => g.fixtureTypeID === 1);
    set({
      categories: divisions,
      selectedCategory: divisions[0] ?? null,
    });
  },
  selectCategory: (group) => set({ selectedCategory: group }),
}));
