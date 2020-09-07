import React, { useRef, useState, useEffect, useCallback } from "react";
import Muuri, { Item } from "muuri";
import useDimensions from "react-cool-dimensions";

import { noop } from "./helpers";
import SizePreviewBox from "./SizePreviewBox";

import "./packing-grid.css";
import { PackingGridContext } from "./contexts";

export interface OnResizeShape {
  (itemId: string, size: [number, number]): void;
}

/**
 * Made exclusively for requirements of wallboard's metrics tiling
 *
 * @example
 * <PackingGrid cols={3}>
 *   <Item itemId="one">
 *     <Component id={1} />
 *   </Item>
 *   <Item itemId="two">
 *     <Component id={2} />
 *   </Item>
 * </PackingGrid>
 */
const PackingGrid: React.FC<{
  onLayoutChange?: (itemIds: Array<string>) => void;
  onResize?: OnResizeShape;
  cols: number;
  spacing?: string | number;
  itemHeight: number;
}> = ({
  children,
  onLayoutChange = noop,
  cols,
  onResize = noop,
  spacing = 0,
  itemHeight,
}) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [grid, setGrid] = useState<Muuri | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    const grid = new Muuri(elRef.current, {
      dragEnabled: true,
      dragHandle: "[data-grid-item-drag-handle]",
      layout: {
        fillGaps: true,
      },
    });

    /*
      Muuri, on initialisation, recognizes its children and automatically adds
      them into its items list. We need to clean that up as Item component
      itself adds that item to the list.
    */
    grid.remove(grid.getItems());

    setGrid(grid);

    return () => {
      grid.destroy();
    };
  }, []);

  useEffect(() => {
    if (grid == null) return;

    const handleLayoutEnd = (items: Item[]) => {
      const idsWithNull = items.map(
        (item) => item.getElement()?.dataset.gridItemId ?? null
      );
      const ids = idsWithNull.filter((key) => Boolean(key)) as Array<string>;

      onLayoutChange(ids);
    };
    grid.on("layoutEnd", handleLayoutEnd);

    const handleDragEnd = () => {
      const idsWithNull = grid
        .getItems()
        .map((item) => item.getElement()?.dataset.gridItemId ?? null);
      const ids = idsWithNull.filter((key) => Boolean(key)) as Array<string>;

      onLayoutChange(ids);
    };
    grid.on("dragEnd", handleDragEnd);

    return () => {
      grid.off("layoutEnd", handleLayoutEnd);
      grid.off("dragEnd", handleDragEnd);
    };
  }, [grid, onLayoutChange]);

  const relayout = useCallback(() => {
    if (!grid) return;
    grid.refreshItems().layout();
  }, [grid]);

  const { width: gridWidth } = useDimensions({
    ref: elRef,
  });

  return (
    <PackingGridContext.Provider
      value={{
        grid,
        relayout,
        cols,
        gridWidth,
        elRef,
        onResize,
        spacing,
        itemHeight,
      }}
    >
      <SizePreviewBox>
        <div ref={elRef} style={{ position: "relative" }}>
          {children}
        </div>
      </SizePreviewBox>
    </PackingGridContext.Provider>
  );
};

export default PackingGrid;
