"use client";

import { useEffect, useRef, useState } from "react";

export default function usePolling(fetcher, interval = 5000, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        const result = await fetcherRef.current();
        if (mounted) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, interval);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [interval, enabled]);

  return { data, error, loading };
}
