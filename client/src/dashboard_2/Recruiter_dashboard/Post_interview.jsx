import React, { useState } from "react";

const PostInterview = () => {
 const [form, setForm] = useState({
  role: "",
  jd: "",
  candidateType: "fresher",
  minExperience: "",
  maxExperience: "",
  interviewType: "technical",
  difficulty: "medium",
  questions: 10,
  skills: "",
  followUps: true,
  adaptive: true,
  codingAllowed: true,
});
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Interview Config Sent to LLM:", form);
    // API call to backend → LLM
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
    <h2 className="text-2xl font-bold mb-6 !text-white">
  AI Interview Setup
</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

       
        <input
          name="Name of the round"
          placeholder="Name of the round (e.g. 'Technical Round 1' or 'HR Round')"
          className="w-full h-10 p-10 bg-slate-800 rounded"
          onChange={handleChange}
        />
       
       
        <input
          name="role"
          placeholder="Job Role"
          className="w-full h-10 p-10 bg-slate-800 rounded"
          onChange={handleChange}
        />


                    <textarea
            name="jd"
            placeholder="Job Description"
            className="w-full h-48 p-3 bg-slate-800 rounded resize-none overflow-y-auto"
            onChange={handleChange}
            />

            <input
                    name="skills"
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
      <label className="block mb-1 text-sm">
        Min Experience (Years)
      </label>

      <select
        name="minExperience"
        value={form.minExperience}
        className="w-full h-10 p-2 bg-slate-800 rounded"
        onChange={handleChange}
      >
        <option value="">Select</option>
        {[...Array(16)].map((_, i) => (
          <option key={i} value={i}>
            {i} Years
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block mb-1 text-sm">
        Max Experience (Years)
      </label>

                <select
                    name="maxExperience"
                    value={form.maxExperience}
                    className="w-full h-10 p-2 bg-slate-800 rounded"
                    onChange={handleChange}
                >
                    <option value="">Select</option>
                    {[...Array(16)].map((_, i) => (
                    <option key={i} value={i}>
                        {i} Years
                    </option>
                    ))}
                </select>
                </div>
            </div>
            )}

        <select
          name="difficulty"
          className="w-full h-10 p-2 bg-slate-800 rounded"
          onChange={handleChange}
        >
          <option>easy</option>
          <option>medium</option>
          <option>hard</option>
        </select>

        <input
          name="questions"
          type="number"
          placeholder="Number of Questions"
          className="w-full p-2 bg-slate-800 rounded"
          onChange={handleChange}
        />
        
        <input
          name="Email"
          type="Email"
          placeholder="Type candidate's email to send them the interview details (Eg - john@gmail.com)"
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
          className="bg-emerald-600 px-4 py-2 rounded"
        >
          Generate Interview
        </button>
      </form>
    </div>
  );
};

export default PostInterview;