import React, { useState } from "react";

const dummyCandidates = [
  {
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    skills: ["React", "Node", "MongoDB"],
    experience: 2,
    interviewScore: 82,
    position: "Frontend Developer",
  },
  {
    name: "Neha Verma",
    email: "neha@gmail.com",
    skills: ["Python", "ML", "Pandas"],
    experience: 3,
    interviewScore: 90,
    position: "Data Analyst",
  },
  {
    name: "Rohit Singh",
    email: "rohit@gmail.com",
    skills: ["Java", "Spring", "SQL"],
    experience: 4,
    interviewScore: 75,
    position: "Backend Developer",
  },
  {
    name: "Priya Nair",
    email: "priya@gmail.com",
    skills: ["UI/UX", "Figma", "Design"],
    experience: 2,
    interviewScore: 88,
    position: "UI Designer",
  },
   {
    name: "Gaurang Sharma",
    email: "gaurangsharma@gmail.com",
    skills: ["UI/UX", "Figma", "Design"],
    experience: 2,
    interviewScore: 90,
    position: "UI Designer",
  },
   {
    name: "Ankur Sharma",
    email: "ankur@gmail.com",
    skills: ["project management", "Design"],   
    experience: 2,
    interviewScore: 34,
    position: "UI Designer",
  },
   {
    name: "Rishika Singh",
    email: "rishika@gmail.com",
    skills: ["Data Science", "Python", "Flask"],
    experience: 2,
    interviewScore: 68,
    position: "UI Designer",
  },
   {
    name: "Aakash Rangrez",
    email: "aakash@gmail.com",
    skills: ["UI/UX", "Marketing", "Design"],
    experience: 2,
    interviewScore: 95,
    position: "UI Designer",
  },
];

const SearchCandidates = () => {
  const [filters, setFilters] = useState({
    name: "",
    skill: "",
    position: "",
    minScore: "",
  });

  const [results, setResults] = useState(dummyCandidates);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    let filtered = dummyCandidates;

    if (filters.name) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.skill) {
      filtered = filtered.filter((c) =>
        c.skills.some((s) =>
          s.toLowerCase().includes(filters.skill.toLowerCase())
        )
      );
    }

    if (filters.position) {
      filtered = filtered.filter((c) =>
        c.position.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    if (filters.minScore) {
      filtered = filtered.filter(
        (c) => c.interviewScore >= Number(filters.minScore)
      );
    }

    setResults(filtered);
  };

  const handleReset = () => {
    setFilters({
      name: "",
      skill: "",
      position: "",
      minScore: "",
    });
    setResults(dummyCandidates);
  };

  return (
     <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">
        🔎 Search Candidates Dashboard
      </h1>

      {/* FILTER BOX */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl">
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
          placeholder="Search skill (React, Python)"
          className="p-2 bg-slate-800 rounded outline-none"
        />

        <input
          name="position"
          value={filters.position}
          onChange={handleChange}
          placeholder="Position"
          className="p-2 bg-slate-800 rounded outline-none"
        />

        <input
          name="minScore"
          value={filters.minScore}
          onChange={handleChange}
          placeholder="Min Score"
          type="number"
          className="p-2 bg-slate-800 rounded outline-none"
        />
      </div>

      {/* BUTTONS */}
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

      {/* RESULTS */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {results.length === 0 ? (
          <p className="text-gray-400">No candidates found</p>
        ) : (
          results.map((c, i) => (
            <div
              key={i}
              className="bg-slate-900 p-4 rounded-xl border border-slate-700"
            >
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <p className="text-sm text-gray-400">{c.email}</p>

              <p className="mt-2">
                <b>Position:</b> {c.position}
              </p>

              <p>
                <b>Experience:</b> {c.experience} years
              </p>

              <p>
                <b>Score:</b>{" "}
                <span className="text-green-400">{c.interviewScore}</span>
              </p>

              <p className="mt-1">
                <b>Skills:</b> {c.skills.join(", ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchCandidates;