"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterProps {
  phrases: string[];
  speed?: number;
  pause?: number;
  className?: string;
}

/**
 * Typewriter — cycles through phrases with a blinking cursor.
 * Uses refs internally to avoid re-triggering the effect on every char change.
 */
export default function Typewriter({ phrases, speed = 70, pause = 2200, className = "" }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting,  setDeleting]  = useState(false);

  // Refs so the timeout callback always sees the latest values without
  // being listed in the effect's dependency array (prevents the re-render loop).
  const displayedRef = useRef("");
  const deletingRef  = useRef(false);
  const phraseIdxRef = useRef(0);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout>>();

  // Keep refs in sync with state
  displayedRef.current = displayed;
  deletingRef.current  = deleting;
  phraseIdxRef.current = phraseIdx;

  useEffect(() => {
    const tick = () => {
      const current  = phrases[phraseIdxRef.current];
      const disp     = displayedRef.current;
      const isDel    = deletingRef.current;

      if (!isDel) {
        if (disp.length < current.length) {
          const next = current.slice(0, disp.length + 1);
          setDisplayed(next);
          timeoutRef.current = setTimeout(tick, speed);
        } else {
          timeoutRef.current = setTimeout(() => {
            setDeleting(true);
            timeoutRef.current = setTimeout(tick, speed);
          }, pause);
        }
      } else {
        if (disp.length > 0) {
          setDisplayed(disp.slice(0, -1));
          timeoutRef.current = setTimeout(tick, speed / 2);
        } else {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % phrases.length);
          timeoutRef.current = setTimeout(tick, speed);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount — refs keep internal state current

  return (
    <span className={className}>
      {displayed}
      <span className="typewriter-cursor" />
    </span>
  );
}
