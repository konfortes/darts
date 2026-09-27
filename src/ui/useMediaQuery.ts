import { useEffect, useState } from 'react';

const query = (q: string) => (typeof window.matchMedia === 'function' ? window.matchMedia(q) : null);

export function useMediaQuery(q: string): boolean {
  const [matches, setMatches] = useState(() => query(q)?.matches ?? false);

  useEffect(() => {
    const mql = query(q);
    if (!mql) return;
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [q]);

  return matches;
}
