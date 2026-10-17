"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

export default function Typewriter({ words }: { words: string[] }) {
  const reduced = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const word = words[wordIndex];
    let delay = deleting ? 40 : 85;
    if (!deleting && length === word.length) delay = 1800;

    const t = setTimeout(() => {
      if (!deleting && length === word.length) {
        setDeleting(true);
      } else if (deleting && length === 0) {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else {
        setLength((l) => l + (deleting ? -1 : 1));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [length, deleting, wordIndex, words, reduced]);

  const text = reduced ? words[0] : words[wordIndex].slice(0, length);
  return (
    <>
      <span className="typed">{text}</span>
      <span className="caret" />
    </>
  );
}
