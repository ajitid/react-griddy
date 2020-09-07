import { useEffect, RefObject, useContext } from "react";
import { noop } from "helpers";
import { SizePreviewBoxContext } from "./SizePreviewBox";
import { ItemContext } from "./Item";

export interface OnResizeDoneShape {
  (size: [number, number]): void;
}

interface UseResizeHandleAttrsShape {
  handleRef: RefObject<HTMLElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  height: number;
  onResizeStart?: Function;
  onResizeDone?: OnResizeDoneShape;
}

const useResizeHandle = ({
  handleRef,
  containerRef,
  height,
  onResizeStart = noop,
  onResizeDone = noop,
}: UseResizeHandleAttrsShape) => {
  const { setPosition, setShow } = useContext(SizePreviewBoxContext);
  const { itemRef } = useContext(ItemContext);

  useEffect(() => {
    const handle = handleRef.current;
    const container = containerRef.current;
    const item = itemRef.current;

    if (handle == null || container == null || item == null) return;

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();
      if (handle == null || container == null || item == null) return;

      item.classList.add("muuri-item-resizing");
      onResizeStart();

      let isFirstResizeDone = false;
      let extraWidth = 0;
      let extraHeight = 0;

      // This final size is what gets applied to the container inside Item when
      // user let goes of resize handle.
      let finalSize = {
        width: container.getBoundingClientRect().width ?? 0,
        height: container.getBoundingClientRect().height ?? 0,
        size: [-1, -1] as [number, number],
      };

      function resize(e: MouseEvent) {
        if (handle == null || container == null || item == null) return;

        const containerRect = container.getBoundingClientRect();

        // Enable visibility of SizePreviewBox when resizing starts
        if (!isFirstResizeDone) {
          isFirstResizeDone = true;
          extraWidth = containerRect.right - e.pageX;
          extraHeight = containerRect.bottom - e.pageY;

          setPosition(
            {
              // Setting `from` helps SizePreviewBox to not to animate to its
              // new position.
              from: {
                left: containerRect.left,
                top: containerRect.top,
                height: containerRect.height,
                width: containerRect.width,
              },
              left: containerRect.left,
              top: containerRect.top,
              height: containerRect.height,
              width: containerRect.width,
            },
            item,
            height
          );
          setShow(true);
        }

        // This variable contains constraints to which SizePreviewBox is snapped
        // to and this is what we apply when the user will let go of resize
        // handle.
        const calculated = setPosition(
          {
            left: containerRect.left,
            top: containerRect.top,
            height: containerRect.height,
            width: containerRect.width,
          },
          item,
          height
        );

        finalSize = {
          width: calculated.width!,
          height: calculated.height!,
          size: calculated.size,
        };

        const newWidth =
          e.pageX - container.getBoundingClientRect().left + extraWidth;
        if (newWidth > handle.getBoundingClientRect().width) {
          container.style.width = `${newWidth}px`;
        }

        const newHeight =
          e.pageY - container.getBoundingClientRect().top + extraHeight;
        if (newHeight > handle.getBoundingClientRect().height) {
          container.style.height = `${newHeight}px`;
        }
      }

      function stopResize() {
        if (handle == null || container == null || item == null) return;

        container.style.height = `${finalSize.height}px`;
        container.style.width = `${finalSize.width}px`;
        item.classList.remove("muuri-item-resizing");
        setShow(false);
        onResizeDone(finalSize.size);

        window.removeEventListener("pointermove", resize);
        window.removeEventListener("pointerup", stopResize);
      }

      window.addEventListener("pointermove", resize);
      window.addEventListener("pointerup", stopResize);
    }

    handle.addEventListener("mousedown", handleMouseDown);

    return () => {
      handle.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    containerRef,
    handleRef,
    height,
    itemRef,
    onResizeDone,
    onResizeStart,
    setPosition,
    setShow,
  ]);

  return [handleRef, containerRef];
};

export default useResizeHandle;
