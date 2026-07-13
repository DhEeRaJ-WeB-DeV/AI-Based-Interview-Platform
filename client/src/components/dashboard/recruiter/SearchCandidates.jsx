import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";

const SearchCandidates = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [results, setResults]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const[selectCandidate, setSelectCandidate] = useState(null);
  const [filters, setFilters]             = useState({
    name:     "",
    skill:    "",
    minExp:   "",
  });

  // Fetch all candidates once on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data } = await api.get("/users/candidates");
        setAllCandidates(data.candidates || []);
        setResults(data.candidates || []);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load candidates.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    let filtered = allCandidates;

    if (filters.name) {
      filtered = filtered.filter((c) =>
        c.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.skill) {
      filtered = filtered.filter((c) =>
        c.skills?.some((s) =>
          s.toLowerCase().includes(filters.skill.toLowerCase())
        )
      );
    }

    if (filters.minExp) {
      filtered = filtered.filter(
        (c) => (c.experience?.length || 0) >= Number(filters.minExp)
      );
    }

    setResults(filtered);
  };

  const handleReset = () => {
    setFilters({ name: "", skill: "", minExp: "" });
    setResults(allCandidates);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-slate-400">
        Loading candidates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="text-red-400 text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">🔎 Search Candidates</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl">
        <input
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="Search by name"
          className="p-2 bg-slate-800 rounded outline-none"
        />
        <input
          name="skill"
          value={filters.skill}
          onChange={handleChange}
          placeholder="Search by skill (React, Python...)"
          className="p-2 bg-slate-800 rounded outline-none"
        />
        <input
          name="minExp"
          value={filters.minExp}
          onChange={handleChange}
          placeholder="Min experiences count"
          type="number"
          min={0}
          className="p-2 bg-slate-800 rounded outline-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSearch}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Total count */}
      <p className="text-slate-400 text-sm mt-4">
        Showing {results.length} of {allCandidates.length} candidates
      </p>

      {/* Results */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {results.length === 0 ? (
          <p className="text-gray-400">No candidates found.</p>
        ) : (
          results.map((c, i) => (
            <div
              key={c._id || i}
              className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col min-h-[140px]"
              onClick={() => setSelectCandidate(c)}
              >
            <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">{c.name || "N/A"}</h2>

            {c.profileCompleted && (
                <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
                     Profile Complete
                </span>
          )}
            </div>

          <p className="text-sm text-gray-400">{c.email}</p>

        <div
          className="mt-auto self-end text-blue-500 hover:text-blue-400 cursor-pointer font-medium transition-colors"
          onClick={() => setSelectCandidate(c)}
        >
             View Profile
        </div>
      </div>  
            
          ))
          
        )}
        </div>

        {selectCandidate && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
      <button
        onClick={() => setSelectCandidate(null)}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-gray-400 transition-all duration-200 hover:bg-red-600 hover:text-white hover:scale-110 active:scale-95 shadow-lg"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectCandidate.name || "N/A"}
          </h2>
        </div>
        <p className="text-gray-400 mt-1">{selectCandidate.email}</p>
      </div>

      {/* Skills */}
      {selectCandidate.skills?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold mb-2">Skills</h3>

          <div className="flex flex-wrap gap-2">
            {selectCandidate.skills.map((skill, i) => (
              <span
                key={i}
                className="bg-slate-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {selectCandidate.experience?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold mb-3">Experience</h3>

          <div className="space-y-4">
            {selectCandidate.experience.map((exp, i) => (
              <div
                key={i}
                className="border-l-2 border-slate-700 pl-4"
              >
                <p className="font-medium">
                  {exp.designation}
                  {exp.company && ` @ ${exp.company}`}
                </p>

                {exp.dates && (
                  <p className="text-xs text-gray-500">{exp.dates}</p>
                )}

                {exp.description?.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-gray-300">
                    {exp.description.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectCandidate.projects?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Projects</h3>

          <div className="space-y-4">
            {selectCandidate.projects.map((pro, i) => (
              <div
                key={i}
                className="border-l-2 border-slate-700 pl-4"
              >
                <p className="font-medium">
                  {pro.title}

                </p>

                 <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-gray-500">
                  {pro.technologies.map((tech, index) => (
                    <span key={index} className="before:content-['•'] before:mr-2 before:text-cyan-400">
                      {tech.trim()}
                    </span>
                  ))}
                </p>
                
                <p className="list-disc list-inside mt-2 text-gray-300">{pro.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {selectCandidate.education?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Education</h3>

          <div className="space-y-4">
            {selectCandidate.education.map((edu, i) => (
              <div
                key={i}
                className="border-l-2 border-slate-700 pl-4"
              >
                <p className="font-medium">
                  {edu.degree}
                  {edu.institution && ` — ${edu.institution}`}
                </p>

                <p className="text-sm text-gray-400">
                  {[edu.years, edu.location, edu.gpa && `GPA: ${edu.gpa}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
       {selectCandidate.certificates?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">certificates</h3>

          <div className="space-y-4">
            {selectCandidate.certificates.map((cer, i) => (
              <span
                  key={i}
                  className="px-3 py-1 bg-emerald-600 rounded-full text-white text-sm"
                >
                  {cer}
                </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default SearchCandidates;

<div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Certifications
          </h2>

          {profile.certificates?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.certificates.map((certification, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-600 rounded-full text-white text-sm"
                >
                  {certification}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">
              No certifications added.
            </p>
          )}
        </div>