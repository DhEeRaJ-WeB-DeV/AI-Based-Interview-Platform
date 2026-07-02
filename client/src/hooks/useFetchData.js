import { useEffect, useState } from "react";

export const useFetchData = (
  fetcher,
  {
    enabled = true,
    initialData = null,
    getErrorMessage = () => "Failed to load data.",
  } = {}
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetcher();

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [enabled, fetcher, getErrorMessage, refreshKey]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefreshKey((key) => key + 1),
  };
};
