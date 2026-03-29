import { useState, useEffect, useRef } from "react";

export const useAnimatedCounter = (target: number, duration = 600, decimals = 0) => {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = prevTarget.current !== target ? count : 0;
    prevTarget.current = target;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return decimals > 0 ? Number(count.toFixed(decimals)) : Math.round(count);
};
