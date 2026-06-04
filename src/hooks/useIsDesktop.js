import { useState, useEffect } from 'react';

const BREAKPOINT = 768;

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINT : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
