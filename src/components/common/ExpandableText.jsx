import { useEffect, useRef, useState } from "react";

const ExpandableText = ({ text, fallback = "-", className = "" }) => {
  const contentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const content = text || fallback;

  useEffect(() => {
    setExpanded(false);
  }, [content]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || expanded) return;

    const updateOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    updateOverflow();
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [content, expanded]);

  return (
    <div className={className}>
      <p
        ref={contentRef}
        className="break-words text-sm font-medium leading-5 text-black"
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }
        }
      >
        {content}
      </p>
      {(canExpand || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-xs font-semibold text-secondary underline underline-offset-2"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
