import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

// A tiny stack navigator. React Navigation is the right tool once the app grows
// (deep links, tabs, gestures); for a 3-screen Phase-1 build a JS-only stack
// keeps the dependency surface — and the bundle — minimal.
export type Route =
  | { name: 'browse' }
  | { name: 'detail'; id: string }
  | { name: 'create' };

interface Nav {
  navigate: (r: Route) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavHost');
  return ctx;
}

export function NavHost({
  screens,
}: {
  screens: Record<Route['name'], (route: Route) => React.ReactElement>;
}) {
  const [stack, setStack] = useState<Route[]>([{ name: 'browse' }]);
  const navigate = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const goBack = useCallback(
    () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const current = stack[stack.length - 1];
  const value: Nav = { navigate, goBack, canGoBack: stack.length > 1 };
  return (
    <NavContext.Provider value={value}>
      {screens[current.name](current)}
    </NavContext.Provider>
  );
}
