import { createContext, RefObject } from "react";
import type Muuri from "muuri";
import { noop } from "./helpers";

interface PackingGridContextShape {
  grid: Muuri | null;
  relayout: () => void;
  cols: number;
  gridWidth: number;
  elRef: RefObject<HTMLDivElement>;
  onResize: (itemId: string, size: [number, number]) => void;
  spacing: string | number;
  itemHeight: number;
}

export const PackingGridContext = createContext<PackingGridContextShape>({
  grid: null,
  relayout: noop,
  cols: 1,
  gridWidth: 0,
  elRef: {
    current: null,
  },
  onResize: noop,
  spacing: 0,
  itemHeight: 0,
});
