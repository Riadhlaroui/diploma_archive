// hooks/usePocketBaseStatus.ts
import { useEffect, useState } from "react";

export function usePocketBaseStatus(url: string, interval = 5000) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      try {
        const res = await fetch(`${url}/api/health`);
        if (isMounted) {
          setIsOnline(res.ok);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsOnline(false);
          setLoading(false);
        }
      }
    };

    checkConnection();
    const id = setInterval(checkConnection, interval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [url, interval]);

  return { isOnline, loading };
}
