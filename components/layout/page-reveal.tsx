"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { useAppTransition } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
};

const revealTransition = {
  duration: 0.32,
  ease: [0.215, 0.61, 0.355, 1] as const
};

export function PageReveal({
  children,
  className,
  delay = 0,
  distance = 18
}: PageRevealProps) {
  const { routeChanged, shouldAnimate } = useAppTransition();
  const animateIn = routeChanged && shouldAnimate;

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: distance } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animateIn ? { ...revealTransition, delay } : undefined}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
