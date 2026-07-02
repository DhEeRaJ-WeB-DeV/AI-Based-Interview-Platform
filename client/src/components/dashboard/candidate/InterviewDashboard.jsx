import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { useFetchData } from "../../../hooks/useFetchData";

const TimeLeft = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date();

      if (diff <= 0) {
        setTimeLeft("Expiring soon");
        return;
      }

      const mins = Math.floor((diff / 1000 / 60) % 60);
      const hrs = Math.floor(diff / 1000 / 60 / 60);
      setTimeLeft(hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`);
    };

    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span className="text-xs font-medium text-amber-300">{timeLeft}</span>;
};

const CandidateDashboard = ({ onAttend }) => {
  const fetchPosts = useCallback(async () => {
    const { data } = await api.get("/interview-posts/dashboard");
    return data.posts || [];
  }, []);

  const getDashboardError = useCallback((err) => {
    const msg =
      err.response?.data?.message || err.message || "Failed to load interviews.";
    const status = err.response?.status;

    if (status === 401) {
      return "Session expired. Please login again.";
    }

    if (status === 403) {
      return "Access denied. Only candidates can view this page.";
    }

    return `Error: ${msg}`;
  }, []);

  const {
    data: posts,
    loading,
    error,
    refetch,
  } = useFetchData(fetchPosts, {
    initialData: [],
    getErrorMessage: getDashboardError,
  });

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        Loading interviews...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3">
        <div className="text-center text-red-300">{error}</div>
        <button
          type="button"
          onClick={refetch}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl text-white">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Candidate dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Available interviews</h2>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="w-fit rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
          No interviews available right now.
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post._id}
              className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{post.role}</h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {post.roundName}
                    </span>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs text-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mb-2 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>
                      {post.candidateType === "fresher"
                        ? "Fresher"
                        : `${post.minExperience}-${post.maxExperience} yrs`}
                    </span>
                    {post.difficulty && <span>{post.difficulty}</span>}
                  </div>

                  <TimeLeft expiresAt={post.expiresAt} />
                </div>

                <button
                  type="button"
                  onClick={() => onAttend(post)}
                  className="h-11 shrink-0 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  Start interview
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
