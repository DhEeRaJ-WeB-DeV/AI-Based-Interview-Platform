import api from "../../../api/axiosClient";

// InstructionPage.jsx
export default function InstructionPage({ post, onBack, onStart }) {
  const rules = [
    { icon: "🕐", title: "Timed session",  desc: "Each question has a time limit. Answer before time runs out." },
    { icon: "🎙", title: "Speak clearly",  desc: "Your voice is transcribed in real time. Speak at a natural pace." },
    { icon: "📷", title: "Camera on",      desc: "Keep your camera on throughout. Stay in frame at all times." },
    { icon: "🔁", title: "No retakes",     desc: "Once you move to the next question, you cannot go back." },
  ];

const handleStart = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post(
      "/interview/start-interview",
      {
        postId: post._id,
        candidateId:    post.candidateId,
        jobRole:        post.role,
        jobDescription: post.jobDescription,
        skills:         post.skills,
        difficulty:     post.difficulty,
        numberOfQuestions : post.numberOfQuestions
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201) {
      const interviewId = response.data.interviewId;
       onStart(interviewId);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to start the interview.");
  }
};

  return (
    <div className="max-w-lg mx-auto text-white">
      <button
        onClick={onBack}
        className="text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to dashboard
      </button>

      <div className="bg-slate-800 rounded-2xl p-8">

        {/* header */}
        <span className="text-xs text-slate-500 tracking-widest uppercase">
          AI Interview
        </span>
        <h1 className="text-xl font-semibold mt-2 mb-1">{post?.role}</h1>
        <div className="flex flex-wrap gap-2 mb-1">
          {post?.skills?.map((skill, i) => (
            <span key={i} className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-3 mb-6">
          Read carefully. Once you start, the session will be timed and recorded.
        </p>

        {/* rules */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {rules.map((rule) => (
            <div key={rule.title} className="bg-slate-700 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-lg">{rule.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{rule.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* permissions */}
        <div className="bg-slate-700 rounded-xl px-4 py-3 flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Microphone access
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Camera access
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Stable internet
          </div>
        </div>

        {/* start button */}
        <button
          onClick={handleStart}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 rounded-xl active:scale-[0.99] transition-all"
        >
          Start interview
        </button>

      </div>
    </div>
  );
}