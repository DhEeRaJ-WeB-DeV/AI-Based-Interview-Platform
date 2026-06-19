import { useEffect, useRef, useState } from "react";
import api from "../../../api/axiosClient";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useSpeechToText }  from "./hooks/useSpeechToText";

const TOTAL_QUESTIONS    = 6;
const TIME_PER_QUESTION  = 120;

const steps = [
  "Introduction",
  "Experience",
  "Technical skills",
  "Problem solving",
  "Behavioral",
  "Wrap up",
];

export default function InterviewScreen({interviewId}) {
  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const [question,      setQuestion]      = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [timeLeft,      setTimeLeft]      = useState(TIME_PER_QUESTION);
  const [submitting,    setSubmitting]    = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const { startRecording, stopRecording, recording, streamRef } = useMediaRecorder();
  const { transcript, listening, startListening, stopListening, resetTranscript } = useSpeechToText();

  // ── fetch next question from AI ─────────────────────────────
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interview/${interviewId}/question`, {
        headers: authHeader,
      });
      setQuestion(res.data.question);
      setQuestionIndex((prev) => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      resetTranscript();
    } catch (err) {
      console.error("Failed to fetch question", err);
      alert("Failed to load question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── init on mount ───────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const stream = await startRecording();
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
      startListening();
      await fetchQuestion();
    };
    init();

    return () => {
      stopListening();
    };
  }, []);

  // ── countdown timer ─────────────────────────────────────────
  useEffect(() => {
    if (!question) return;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [question]);

  // ── format mm:ss ────────────────────────────────────────────
  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── upload blob to cloudinary via backend ───────────────────
  const uploadRecording = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("video", blob, `q${questionIndex}.webm`);
      const res = await api.post("/interview/upload-recording", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.recordingUrl;
    } catch (err) {
      console.error("Upload failed", err);
      return null;
    }
  };

  // ── save answer for current question ───────────────────────
  const saveAnswer = async (recordingUrl) => {
    await api.post(
      `/interview/${interviewId}/answer`,
      {
        questionId:   question._id,
        answerText:   transcript,
        recordingUrl: recordingUrl || "",
      },
      { headers: authHeader }
    );
  };

  // ── handle next / submit ────────────────────────────────────
  const handleNext = async () => {
    if (submitting) return;
    clearInterval(timerRef.current);
    stopListening();
    setSubmitting(true);

    try {
      const blob = await stopRecording();
      const recordingUrl = blob ? await uploadRecording(blob) : null;
      await saveAnswer(recordingUrl);

      // last question → submit interview
      if (questionIndex >= TOTAL_QUESTIONS) {
        await api.post(`/interview/${interviewId}/submit`, {}, { headers: authHeader });
        stopListening();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
       setShowSuccessModal(true);
        return;   
      }

      // next question — restart recording + STT
      const stream = await startRecording();
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
      startListening();
      await fetchQuestion();
    } catch (err) {
      console.error("Error advancing question", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastQuestion = questionIndex >= TOTAL_QUESTIONS;
  const isLowTime      = timeLeft <= 30;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 sm:p-6 text-white">

      {/* topbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-slate-400">
            AI Interview
          </span>
          <span className="text-sm text-slate-400">
            Question {questionIndex} of {TOTAL_QUESTIONS}
          </span>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isLowTime ? "bg-red-900/40 text-red-300" : "bg-amber-900/30 text-amber-300"}`}>
          <span className={`w-2 h-2 rounded-full ${isLowTime ? "bg-red-400" : "bg-amber-400"}`}></span>
          {formatTime(timeLeft)} remaining
        </div>
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* left — question + transcript */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* question card */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50">
            <p className="text-xs text-slate-500 tracking-widest uppercase mb-3">
              Current question
            </p>
            {loading ? (
              <p className="text-slate-400 text-sm animate-pulse">Generating question...</p>
            ) : (
              <p className="text-base font-medium leading-relaxed">
                {question?.questionText}
              </p>
            )}
          </div>

          {/* transcript card */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p className="text-xs text-slate-500 tracking-widest uppercase">
                Live transcript
              </p>
            </div>

            <div className="min-h-[100px] text-sm text-slate-300 leading-relaxed flex-1">
              {transcript || (
                <span className="text-slate-600">
                  Start speaking — your answer will appear here...
                </span>
              )}
              {listening && (
                <span className="inline-block w-0.5 h-4 bg-white ml-1 animate-pulse align-middle" />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-base">🎙</span>
                {listening ? "Listening..." : "Mic off"}
              </div>
              <button
                onClick={handleNext}
                disabled={loading || submitting}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
               {submitting
    ? "Saving..."
    : isLastQuestion
    ? "Submit Interview"
    : "Next Question →"
}
              </button>
            </div>
          </div>
        </div>

        {/* right — camera + progress */}
        <div className="flex flex-col gap-4">

          {/* camera */}
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] relative border border-slate-700/50">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {recording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs text-red-400 font-medium">REC</span>
              </div>
            )}
            {/* fallback if camera not showing */}
            {!recording && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
                <span className="text-4xl">📷</span>
                <span className="text-xs">Camera initializing...</span>
              </div>
            )}
          </div>

          {/* progress */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 flex-1">
            <p className="text-xs text-slate-500 tracking-widest uppercase mb-4">
              Progress
            </p>
            <div className="flex flex-col gap-3">
              {steps.map((step, i) => {
                const idx    = i + 1;
                const status = idx < questionIndex
                  ? "done"
                  : idx === questionIndex
                  ? "active"
                  : "pending";

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                      ${status === "done"    ? "bg-emerald-900 text-emerald-300" : ""}
                      ${status === "active"  ? "bg-white text-slate-900" : ""}
                      ${status === "pending" ? "bg-slate-700 text-slate-500" : ""}
                    `}>
                      {status === "done" ? "✓" : idx}
                    </div>
                    <span className={`text-sm
                      ${status === "done"    ? "text-slate-500 line-through" : ""}
                      ${status === "active"  ? "text-white font-medium" : ""}
                      ${status === "pending" ? "text-slate-600" : ""}
                    `}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
              {showSuccessModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center">

      <div className="text-6xl mb-4">
        ✅
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        Interview Submitted
      </h2>

      <p className="text-slate-300 mb-6">
        Your interview has been completed successfully.
        The interview responses and evaluation results
        have been submitted to the recruiter.
      </p>

      <button
        onClick={() => {
          setShowSuccessModal(false);
         window.location.reload();// change route if needed
        }}
        className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold"
      >
        Go To Dashboard
      </button>

    </div>
  </div>
)}

    </div>
  );
}