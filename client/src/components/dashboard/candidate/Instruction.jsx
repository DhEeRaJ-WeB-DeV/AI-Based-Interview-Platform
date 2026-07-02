import { Camera, Clock, Mic, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";

export default function InstructionPage({ post, onBack, onStart }) {
  const rules = [
    {
      icon: Clock,
      title: "Timed session",
      desc: "Each question has a time limit. Answer before time runs out.",
    },
    {
      icon: Mic,
      title: "Speak clearly",
      desc: "Your voice is transcribed in real time. Speak at a natural pace.",
    },
    {
      icon: Camera,
      title: "Camera on",
      desc: "Keep your camera on throughout. Stay in frame at all times.",
    },
    {
      icon: RefreshCcw,
      title: "No retakes",
      desc: "Once you move to the next question, you cannot go back.",
    },
  ];

  const handleStart = async () => {
    try {
      const response = await api.post(
        "/interview/start-interview",
        {
          postId: post._id,
          candidateId: post.candidateId,
          jobRole: post.role,
          jobDescription: post.jobDescription,
          skills: post.skills,
          difficulty: post.difficulty,
          numberOfQuestions: post.numberOfQuestions,
        }
      );

      if (response.status === 201) {
        toast.success("Interview started.");
        onStart(response.data.interviewId);
      }
    } catch {
      toast.error("Failed to start the interview.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl text-white">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        Back to dashboard
      </button>

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          AI interview
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{post?.role}</h1>

        <div className="mt-3 flex flex-wrap gap-2">
          {post?.skills?.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs text-emerald-200"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Read carefully. Once you start, the session will be timed and
          recorded.
        </p>

        <div className="my-6 grid gap-3 sm:grid-cols-2">
          {rules.map((rule) => {
            const Icon = rule.icon;

            return (
              <div
                key={rule.title}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-emerald-300">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-medium text-white">{rule.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {rule.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex flex-wrap gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3">
          <span className="text-xs text-slate-300">Microphone access</span>
          <span className="text-xs text-slate-300">Camera access</span>
          <span className="text-xs text-slate-300">Stable internet</span>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="h-11 w-full rounded-md bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Start interview
        </button>
      </section>
    </div>
  );
}
