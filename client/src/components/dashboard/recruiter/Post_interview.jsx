import { useState } from "react";
import api from "../../../api/axiosClient";

const PostInterview = () => {
  const [form, setForm] = useState({
    roundName: "",
    role: "",
    jd: "",
    candidateType: "fresher",
    minExperience: "",
    maxExperience: "",
    difficulty: "medium",
    questions: 10,
    skills: "",
    followUps: true,
    adaptive: true,
    Email: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Basic validation
    if (!form.roundName.trim()) {
      setErrorMsg("Please enter the round name.");
      return;
    }
    if (!form.role.trim()) {
      setErrorMsg("Please enter the job role.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/interview-posts/post", form);

      setSuccessMsg(`Interview posted! It will be available for candidates for 2 hours.`);

      // Reset form after successful post
      setForm({
        roundName: "",
        role: "",
        jd: "",
        candidateType: "fresher",
        minExperience: "",
        maxExperience: "",
        difficulty: "medium",
        questions: 10,
        skills: "",
        followUps: true,
        adaptive: true,
        Email: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 !text-white">AI Interview Setup</h2>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-600 text-emerald-300 rounded">
          {successMsg}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 text-red-300 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ✅ Fixed: name was "Name of the round" (spaces break req.body) */}
        <input
          name="roundName"
          value={form.roundName}
          placeholder="Name of the round (e.g. 'Technical Round 1' or 'HR Round')"
          className="w-full h-10 px-3 bg-slate-800 rounded"
          onChange={handleChange}
        />

        <input
          name="role"
          value={form.role}
          placeholder="Job Role"
          className="w-full h-10 px-3 bg-slate-800 rounded"
          onChange={handleChange}
        />

        <textarea
          name="jd"
          value={form.jd}
          placeholder="Job Description"
          className="w-full h-48 p-3 bg-slate-800 rounded resize-none overflow-y-auto"
          onChange={handleChange}
        />

        <input
          name="skills"
          value={form.skills}
          placeholder="Skills (comma separated)"
          className="w-full p-2 bg-slate-800 rounded"
          onChange={handleChange}
        />

        <select
          name="candidateType"
          value={form.candidateType}
          className="w-full h-10 p-2 bg-slate-800 rounded"
          onChange={handleChange}
        >
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
        </select>

        {form.candidateType === "experienced" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Min Experience (Years)</label>
              <select
                name="minExperience"
                value={form.minExperience}
                className="w-full h-10 p-2 bg-slate-800 rounded"
                onChange={handleChange}
              >
                <option value="">Select</option>
                {[...Array(16)].map((_, i) => (
                  <option key={i} value={i}>{i} Years</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Max Experience (Years)</label>
              <select
                name="maxExperience"
                value={form.maxExperience}
                className="w-full h-10 p-2 bg-slate-800 rounded"
                onChange={handleChange}
              >
                <option value="">Select</option>
                {[...Array(16)].map((_, i) => (
                  <option key={i} value={i}>{i} Years</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <select
          name="difficulty"
          value={form.difficulty}
          className="w-full h-10 p-2 bg-slate-800 rounded"
          onChange={handleChange}
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>

        <input
          name="questions"
          type="number"
          value={form.questions}
          placeholder="Number of Questions"
          className="w-full p-2 bg-slate-800 rounded"
          onChange={handleChange}
        />

        <input
        required
          name="Email"
          type="email"
          value={form.Email}
          placeholder="Candidate's email to send interview details (e.g. john@gmail.com)"
          className="w-full p-2 bg-slate-800 rounded"
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="followUps"
            onChange={handleChange}
            checked={form.followUps}
          />
          Enable Follow-up Questions
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="adaptive"
            onChange={handleChange}
            checked={form.adaptive}
          />
          Adaptive Difficulty
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
        >
          {loading ? "Posting..." : "Generate Interview"}
        </button>

      </form>
    </div>
  );
};

export default PostInterview;
