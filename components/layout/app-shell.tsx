"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

type AppShellProps = {
  children: ReactNode;
};

type AppTransitionContextValue = {
  routeChanged: boolean;
  shouldAnimate: boolean;
};

const AppTransitionContext = createContext<AppTransitionContextValue>({
  routeChanged: false,
  shouldAnimate: true
});

const pageTransition = {
  duration: 0.3,
  ease: [0.215, 0.61, 0.355, 1] as const
};

export function useAppTransition() {
  return useContext(AppTransitionContext);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const previousPathnameRef = useRef(pathname);
  const routeChanged = !reduceMotion && previousPathnameRef.current !== pathname;

  useEffect(() => {
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <AppTransitionContext.Provider value={{ routeChanged, shouldAnimate: !reduceMotion }}>
      <div className="relative min-h-screen overflow-x-clip">
        <div className="min-h-screen">{children}</div>

        {routeChanged ? (
          <motion.div
            key={pathname}
            aria-hidden="true"
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={pageTransition}
            className="pointer-events-none fixed inset-y-0 left-0 z-50 w-full bg-background/96"
          >
            <div className="absolute inset-y-0 right-0 w-px bg-border/70" />
          </motion.div>
        ) : null}
      </div>
    </AppTransitionContext.Provider>
  );
}
