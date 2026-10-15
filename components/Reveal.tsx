"use client";

import { ElementType, ReactNode, useRef } from "react";
import { useInView } from "@/lib/hooks";

type Props = {
  as?: ElementType;
  id?: string;
  className?: string;
  delay?: number;
  children: ReactNode;
};

export default function Reveal({ as: Tag = "div", id, className = "", delay = 0, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);
  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
