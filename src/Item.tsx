import React, {
  useContext,
  useEffect,
  useRef,
  RefObject,
  createContext,
} from "react";

import { PackingGridContext } from "./contexts";

interface ItemContextShape {
  itemRef: RefObject<HTMLDivElement | null>;
  w: number;
  h: number;
  itemId: string;
}

export const ItemContext = createContext<ItemContextShape>({
  itemRef: { current: null },
  w: 1,
  h: 1,
  itemId: "",
});

type ElAttrs = Pick<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style"
>;

interface ItemProps extends ElAttrs {
  itemId: string;
  w?: number;
  h?: number;
}

/**
 * A wrapper to denote that its an item of a grid. Requires `itemId` (string).
 *
 * An `Item` must be a direct child of `PackingGrid`. All items inside a grid must
 * receive same styles to avoid inconsistent calculations when the grid
 * positions them.
 *
 * Items also add themselves to the grid in the order they have been mounted;
 * switching their order on subsequent renders won't affect their order in which
 * they are displayed in the DOM.
 */
const Item: React.FC<ItemProps> = ({
  children,
  className,
  style,
  itemId,
  w = 1,
  h = 1,
}) => {
  const { grid, spacing } = useContext(PackingGridContext);
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!grid || !el) return;

    const items = grid.add(el);

    return () => {
      grid.remove(items);
    };
  }, [grid]);

  return (
    <div
      data-grid-item-id={itemId}
      ref={itemRef}
      className={className}
      style={{ ...style, position: "absolute", margin: spacing }}
    >
      <ItemContext.Provider value={{ itemRef, w, h, itemId }}>
        {children}
      </ItemContext.Provider>
    </div>
  );
};

export default Item;
