import { useState, useRef, useEffect } from "react";

export function Card() {
  const { elementProps, onReset } = useDragger();

  return (
    <div
      {...elementProps}
      className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 select-none transition-transform"
    >
      <p className="font-normal text-gray-100 mb-4">You can drag me!</p>

      <p className="font-normal text-gray-100 mb-4">- Ronald Rey</p>

      <button
        onClick={onReset}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Reset
      </button>
    </div>
  );
}

function useDragger() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const boundary = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const interpretEvent = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
  ) => {
    const pos =
      "touches" in e
        ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
        : { clientX: e.clientX, clientY: e.clientY };
    return pos;
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (ref.current) {
      setIsDragging(true);

      const { clientX, clientY } = interpretEvent(e);

      dragStartPos.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };

      const gutter = 10;

      const elementRect = ref.current.getBoundingClientRect();
      boundary.current = {
        minX: position.x - elementRect.left + gutter,
        maxX: window.innerWidth + position.x - elementRect.right - gutter,

        minY: position.y - elementRect.top + gutter,
        maxY: window.innerHeight + position.y - elementRect.bottom - gutter,
      };
    }
  };

  const onReset = () => setPosition({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (ref.current) {
        const { clientX, clientY } = interpretEvent(e);

        const { minX, maxX, minY, maxY } = boundary.current;

        const unboundedX = clientX - dragStartPos.current.x;
        const newX = Math.max(minX, Math.min(unboundedX, maxX));

        const unboundedY = clientY - dragStartPos.current.y;
        const newY = Math.max(minY, Math.min(unboundedY, maxY));

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return {
    onReset,
    elementProps: {
      ref,
      onMouseDown,
      onTouchStart: onMouseDown,
      style: {
        transition: isDragging ? ("none" as const) : undefined,
        transform: `translate(${position.x}px, ${position.y}px)`,
      },
    },
  };
}
