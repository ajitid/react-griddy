import React, { useState, createContext, useContext, useCallback } from "react";

import { PackingGridContext } from "./PackingGrid";
import { noop, clamp } from "helpers";

interface RectOptional {
  top?: number;
  left?: number;
  height?: number;
  width?: number;
}

interface Options extends RectOptional {
  from?: RectOptional;
}

interface SetPositionReturnShape extends Options {
  size: [number, number];
}

interface SetPositionShape {
  (
    options: Options,
    item: HTMLDivElement,
    height: number
  ): SetPositionReturnShape;
}

export interface SizePreviewBoxContextShape {
  setPosition: SetPositionShape;
  setShow: Function;
}

export const SizePreviewBoxContext = createContext<SizePreviewBoxContextShape>({
  // @ts-ignore
  setPosition: noop,
  setShow: noop,
});

/**
 * Gives a visual cue to user of what the item size they'll end up with if they let go its
 * resize handle.
 */
const SizePreviewBox: React.FC = ({ children }) => {
  const { gridWidth, cols, elRef: gridElRef } = useContext(PackingGridContext);

  // Toggle visibility of preview box
  const [show, setShow] = useState(false);

  const [, set] = useState();
  const [style, setStyle] = useState({
    top: 0,
    left: 0,
    height: 0,
    width: 0,
  });

  // Set position and size of the box. Passed width and height are re-calculated
  // to accomodate integral stepped sizes. Returns set of values which define
  // what values the item should snap to if the user releases their click from
  // handle of the item.
  const setPosition = useCallback<SetPositionShape>(
    (options, item, height) => {
      if (gridElRef.current === null) return { ...options, size: [-1, -1] };

      const computed = getComputedStyle(item);
      const itemMargins = {
        top: parseFloat(computed.marginTop.replace("px", "")),
        bottom: parseFloat(computed.marginBottom.replace("px", "")),
        left: parseFloat(computed.marginLeft.replace("px", "")),
        right: parseFloat(computed.marginRight.replace("px", "")),
      };
      const itemRect = item.getBoundingClientRect();

      if (options.width !== undefined) {
        const totalWidth =
          itemMargins.left + itemRect.width + itemMargins.right;
        const perColWidth = gridWidth / cols;
        const insideColBoundsWidth = totalWidth % perColWidth;
        const exceedsFromHalf = insideColBoundsWidth > perColWidth / 2;

        const { left: gridLeft } = gridElRef.current.getBoundingClientRect();
        const colNo =
          Math.round(
            (itemRect.left - itemMargins.left - gridLeft) / perColWidth
          ) + 1;

        if (exceedsFromHalf) {
          options.width =
            clamp(
              perColWidth,
              gridWidth - (colNo - 1) * perColWidth,
              totalWidth - insideColBoundsWidth + perColWidth
            ) -
            (itemMargins.left + itemMargins.right);
        } else {
          options.width =
            clamp(
              perColWidth,
              gridWidth - (colNo - 1) * perColWidth,
              totalWidth - insideColBoundsWidth
            ) -
            (itemMargins.left + itemMargins.right);
        }
      }

      if (options.height !== undefined) {
        const totalHeight =
          itemMargins.top + itemRect.height + itemMargins.bottom;
        const perColHeight = itemMargins.top + height + itemMargins.bottom;
        const insideColBoundsHeight = totalHeight % perColHeight;
        const exceedsFromHalf = insideColBoundsHeight > perColHeight / 2;

        if (exceedsFromHalf) {
          options.height =
            totalHeight -
            insideColBoundsHeight +
            perColHeight -
            (itemMargins.top + itemMargins.bottom);
        } else {
          options.height =
            totalHeight -
            insideColBoundsHeight -
            (itemMargins.top + itemMargins.bottom);
        }
      }

      // Apply calculated styles to preview box
      setStyle((s) => ({ ...s, ...options }));

      const { left: gridLeft } = gridElRef.current.getBoundingClientRect();
      const perColWidth = gridWidth / cols;
      const colNo =
        Math.round(
          (itemRect.left - itemMargins.left - gridLeft) / perColWidth
        ) + 1;

      return {
        ...options,
        size: [
          clamp(
            1,
            cols - colNo + 1,
            Math.round(
              (itemMargins.left + itemRect.width + itemMargins.right) /
                (gridWidth / cols)
            )
          ),
          Math.round(
            (itemRect.height - height) /
              (height + itemMargins.top + itemMargins.bottom)
          ) + 1,
        ],
      };
    },
    [cols, gridElRef, gridWidth, set]
  );

  return (
    <SizePreviewBoxContext.Provider value={{ setShow, setPosition }}>
      {children}
      {/* The moving box that'll give you a preview of size */}
      {show && <div className="packing-grid-size-preview-box" style={style} />}
    </SizePreviewBoxContext.Provider>
  );
};

export default SizePreviewBox;
