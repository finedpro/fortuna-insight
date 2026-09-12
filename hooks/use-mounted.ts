import { useEffect, useState } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Useful for guarding client-only rendering (e.g. wallet state) once
 * those features land — placeholder utility for the FC-001 foundation.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
