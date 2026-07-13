import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";
import { useTabSwitchGuard } from "../../../hooks/useTabSwitchGuard";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useSpeechToText } from "./hooks/useSpeechToText";

const TOTAL_QUESTIONS = 6;
const TIME_PER_QUESTION = 120;

const steps = [
  "Introduction",
  "Experience",
  "Technical skills",
  "Problem solving",
  "Behavioral",
  "Wrap up",
];

export default function InterviewScreen({ interviewId }) {
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState("text");
  const [typedAnswer,setTypedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const { startRecording, stopRecording, recording, streamRef } =
    useMediaRecorder();
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  const cleanupSession = useCallback(() => {
    clearInterval(timerRef.current);
    stopListening();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, [stopListening, streamRef]);

  const handleMalpractice = useCallback(
    (reason) => {
      cleanupSession();
      toast.error(
        reason === "tab-switch"
          ? "Tab switch detected. Interview session closed."
          : "Interview focus lost. Session closed."
      );
      navigate("/dashboard", { replace: true, state: { malpractice: true } });
    },
    [cleanupSession, navigate]
  );

  useTabSwitchGuard({
    enabled: true,
    maxViolations: 3,

    onWarning: ({ count, remaining }) => {
      toast.error(
        `Warning : Please do not switch tabs, the session is monitored.`
      );
    },

    onViolation: async () => {
      try {
        await api.post("/interview/interview-violation", {
          isviolated: true,
        });

        toast.error(
          "Interview terminated because you switched tabs multiple times."
        );

        // Navigate away
        navigate("/");
        setTimeout(() => {
          window.location.reload()
        }, 2000);

      } catch (err) {
        console.error(err);
      }
    },
  });

  const fetchQuestion = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get(`/interview/${interviewId}/question`);
      setQuestion(res.data.question);
      setQuestionIndex((prev) => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      resetTranscript();
    } catch {
      toast.error("Failed to load question. Please try again.");
    } finally {
      setLoading(false);
    }
    setTypedAnswer("");
    setQuestion(res,data.question);
    setTimeLeft(TIME_PER_QUESTION);

    resetTranscipt();
    setTypeanswer("");
  }, [interviewId, resetTranscript]);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await startRecording();

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }

        startListening();
        await fetchQuestion();
      } catch {
        toast.error("Camera or microphone could not be started.");
      }
    };

    init();

    return () => {
      cleanupSession();
    };
    // Camera, mic, and first-question setup must run once for the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadRecording = useCallback(
    async (blob) => {
      try {
        const formData = new FormData();
        formData.append("video", blob, `q${questionIndex}.webm`);
        const res = await api.post("/interview/upload-recording", formData);
        return res.data.recordingUrl;
      } catch {
        toast.error("Recording upload failed. Saving answer without video.");
        return null;
      }
    },
    [questionIndex]
  );

  const saveAnswer = useCallback(
    async (recordingUrl) => {
      await api.post(
        `/interview/${interviewId}/answer`,
        {
          questionId: question._id,
          answerText: inputMode === "text" ? typedAnswer : transcript,
          recordingUrl: recordingUrl || "",
        },
      );
    },
    [interviewId, question, transcript , typedAnswer, inputMode]
  );

  const handleNext = useCallback(async () => {
    if (submitting || !question) {
      return;
    }

    clearInterval(timerRef.current);
    stopListening();
    setSubmitting(true);

    try {
      const blob = await stopRecording();
      const recordingUrl = blob ? await uploadRecording(blob) : null;
      await saveAnswer(recordingUrl);

      if (questionIndex >= TOTAL_QUESTIONS) {
        await api.post(
          `/interview/${interviewId}/submit`,
          {}
        );
        cleanupSession();
        setShowSuccessModal(true);
        return;
      }

      const stream = await startRecording();

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }

      startListening();
      await fetchQuestion();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    cleanupSession,
    fetchQuestion,
    interviewId,
    question,
    questionIndex,
    saveAnswer,
    startListening,
    startRecording,
    stopListening,
    stopRecording,
    submitting,
    uploadRecording,
  ]);

  useEffect(() => {
    if (!question) {
      return undefined;
    }

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
  }, [handleNext, question]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const isLastQuestion = questionIndex >= TOTAL_QUESTIONS;
  const isLowTime = timeLeft <= 30;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 text-white sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
            AI Interview
          </span>
          <span className="text-sm text-slate-400">
            Question {questionIndex} of {TOTAL_QUESTIONS}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isLowTime
              ? "bg-red-950 text-red-200"
              : "bg-amber-950 text-amber-200"
            }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isLowTime ? "bg-red-400" : "bg-amber-400"
              }`}
          />
          {formatTime(timeLeft)} remaining
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Current question
            </p>
            {loading ? (
              <p className="animate-pulse text-sm text-slate-400">
                Generating question...
              </p>
            ) : (
              <p className="text-base font-medium leading-relaxed">
                {question?.questionText}
              </p>
            )}
          </section>

          <section className="flex flex-1 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Live transcript
              </p>
            </div>

            {inputMode === "voice" ? (
              
              <div className="h-32 overflow-auto rounded-2xl border border-slate-50/10 bg-slate-50/5 p-4 text-sm text-slate-200">
                {transcript || (
                  <span className="text-slate-600">
                    Start speaking. Your answer will appear here.
                  </span>
                )}
                {listening && (
                  <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-white align-middle" />
                )}
              </div>
            ) : (
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="h-32 resize-none rounded-2xl border border-slate-50/10 bg-slate-50/5 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {inputMode === "voice"? listening ? "Listening..." :"Mic off" : "Typing mode"}
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || submitting}
                className="h-10 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : isLastQuestion
                    ? "Submit interview"
                    : "Next question"}
              </button>
            </div>
            <div className="mb-4 flex gap-3">
                    <button
                        onClick={() => {
                            setInputMode("voice");
                            startListening();
                        }}
                        className={`px-4 py-2 rounded ${
                            inputMode === "voice"
                                ? "bg-emerald-600"
                                : "bg-slate-700"
                        }`}
                    >
                        🎤 Voice
                    </button>

                    <button
                        onClick={() => {
                            setInputMode("text");
                            stopListening();
                        }}
                        className={`px-4 py-2 rounded ${
                            inputMode === "text"
                                ? "bg-emerald-600"
                                : "bg-slate-700"
                        }`}
                    >
                        ⌨️ Type
                    </button>
                </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {recording && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-300">REC</span>
              </div>
            )}
            {!recording && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
                Camera initializing...
              </div>
            )}
          </section>

          <section className="flex-1 rounded-lg border border-slate-800 bg-slate-900 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Progress
            </p>
            <div className="flex flex-col gap-3">
              {steps.map((step, index) => {
                const stepIndex = index + 1;
                const status =
                  stepIndex < questionIndex
                    ? "done"
                    : stepIndex === questionIndex
                      ? "active"
                      : "pending";

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${status === "done"
                          ? "bg-emerald-950 text-emerald-300"
                          : ""
                        } ${status === "active" ? "bg-white text-slate-900" : ""
                        } ${status === "pending"
                          ? "bg-slate-800 text-slate-500"
                          : ""
                        }`}
                    >
                      {status === "done" ? "OK" : stepIndex}
                    </div>
                    <span
                      className={`text-sm ${status === "done" ? "text-slate-500 line-through" : ""
                        } ${status === "active" ? "font-medium text-white" : ""} ${status === "pending" ? "text-slate-600" : ""
                        }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white">
              Interview submitted
            </h2>
            <p className="mb-6 text-slate-300">
              Your responses and evaluation data have been submitted to the
              recruiter.
            </p>
            <button
              type="button"
              onClick={() => {
                navigate("/dashboard", { replace: true })
                setTimeout(() => {
                  window.location.reload()
                }, 2000);
              }}
              className="rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
