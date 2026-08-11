import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";
import socket from "../../../socket/socketclient";
import { useTabSwitchGuard } from "../../../hooks/useTabSwitchGuard";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useSpeechSynthesis } from "./hooks/useTextToSpeech";
import { useRealtimeAudio } from "./hooks/useRealtimeAudio";
import { useNavigationGuard } from "./hooks/useNavigationGuard";

const TOTAL_QUESTIONS = 6;

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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [inputMode, setInputMode] = useState("voice");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [backButton, setBackbutton] = useState(false);
  const [interviewcompleted, setinterviewcompleted] = useState(false);
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(false);
  const [isTabSwitchLocked, setIsTabSwitchLocked] = useState(false);
  const isInterviewLocked = isFullscreenLocked || isTabSwitchLocked;

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const answerPhaseStartedRef = useRef(false);
  const isFetchingQuestionRef = useRef(false);
  const violationInProgressRef = useRef(false);
  const terminationStartedRef = useRef(false);

  // Always holds the latest transcript synchronously, so handleNext can
  // read it without waiting on a React re-render and without needing
  // liveTranscript in its dependency array (which would redefine the
  // callback — and reset the question timer — on every transcript delta).
  const liveTranscriptRef = useRef("");

  const questionSeqRef = useRef(0);

  const {
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    recording,
    streamRef,
  } = useMediaRecorder();

  const { speak, stopSpeaking } = useSpeechSynthesis();

  const {
    startStreaming,
    stopStreaming
  } = useRealtimeAudio();

  // socket test
  useEffect(() => {

    socket.connect();

    socket.on("connect", () => {

      console.log("Connected:", socket.id);

      socket.emit("join_interview", {
        interviewId,
      });

    });

    socket.on("joined_interview", (data) => {

      console.log("Joined interview:", data.interviewId);

    });

    socket.on("transcript", (data) => {

      console.log("Transcript:", data);

      // Drop anything left over from a question we've already moved on
      // from — this is what stops a late-arriving event from a previous
      // answer showing up appended to the current one.
      if (data.questionSeq !== questionSeqRef.current) {
        return;
      }
      liveTranscriptRef.current = data.fullTranscript;
      setLiveTranscript(data.fullTranscript);

    });

    return () => {

      socket.off("connect");
      socket.off("joined_interview");
      socket.off("transcript");

      socket.disconnect();

    };

  }, [interviewId]);



  const cleanupSession = useCallback(() => {

    stopSpeaking();
    stopStreaming();

    setIsRecordingAnswer(false);

    // Stop MediaRecorder if it's still recording
    stopVideoRecording().catch(() => { });

    // Stop camera + microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;
    }

    // Remove video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }


    liveTranscriptRef.current = "";
    setLiveTranscript("");
    setTypedAnswer("");

  }, [
    stopSpeaking,
    stopStreaming,
    stopVideoRecording,
  ]);


  const terminateInterview = useCallback(async () => {
    try {
      stopSpeaking();
      await stopStreaming();

      setIsRecordingAnswer(false);

      await stopVideoRecording();

      await api.post(
        `/interview/${interviewId}/submit`,
        {
          terminate: true,
        }
      );

      cleanupSession();

      navigate("/dashboard", {
        replace: true,
        state: {
          malpractice: true,
        },
      });

    } catch (err) {
      console.error("Termination failed:", err);

      toast.error(
        "Failed to submit terminated interview."
      );
    }
  }, [
    interviewId,
    stopSpeaking,
    stopStreaming,
    stopVideoRecording,
    cleanupSession,
    navigate,
  ]);

  // tabswitch
  const handleTabSwitchViolation = useCallback(
    async (reason) => {

      // Ignore violations after termination has started
      if (terminationStartedRef.current) {
        return;
      }

      // Prevent duplicate API calls
      if (violationInProgressRef.current) {
        return;
      }

      violationInProgressRef.current = true;

      try {

        // Stop AI audio processing
        stopSpeaking();
        await stopStreaming();

        setIsRecordingAnswer(false);

        // Disable interview controls
        setIsTabSwitchLocked(true);

        console.log("TAB SWITCH VIOLATION:", {
          interviewId,
          type: "tabSwitch",
          reason,
        });

        const { data } = await api.post(
          "/interview/interview-violation",
          {
            interviewId,
            type: "tabSwitch",
          }
        );

        console.log(
          "TAB SWITCH RESPONSE:",
          data
        );

        // SECOND VIOLATION
        if (data.terminate) {

          terminationStartedRef.current = true;

          toast.error(
            "Interview terminated due to multiple tab switches."
          );

          await terminateInterview();

          return;
        }

        // FIRST VIOLATION
        setShowWarningModal(true);

      } catch (err) {

        console.error(
          "Tab switch violation failed:",
          err
        );

      } finally {

        violationInProgressRef.current = false;

      }

    },
    [
      interviewId,
      stopSpeaking,
      stopStreaming,
      terminateInterview,
    ]
  );

  useTabSwitchGuard({
    enabled: true,
    onViolation: handleTabSwitchViolation,
  });




  // for locking the esc and cntrlc and v
  useEffect(() => {
    // 1. Right-click block
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    // enters into full screen mode
    document.documentElement.requestFullscreen()

    // 2. Keyboard shortcuts block (Copy, Paste)
    const handleKeyDown = (event) => {
      const isCopyOrPaste = event.key === "c" || event.key === "v" || event.key === "C" || event.key === "V";
      if ((event.ctrlKey || event.metaKey) && isCopyOrPaste) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // 3. Monitor Fullscreen Transitions
    const handleFullscreenChange = async () => {

      if (terminationStartedRef.current) {
        return;
      }

      if (document.fullscreenElement) {
        setIsFullscreenLocked(false);

        if (inputMode === "voice") {
          setIsRecordingAnswer(true);

          if (mediaStreamRef.current instanceof MediaStream) {
            await startStreaming(mediaStreamRef.current);
          }
        }

        return;
      }

      // Prevent duplicate violation API calls
      if (violationInProgressRef.current) {
        return;
      }

      violationInProgressRef.current = true;

      try {
        stopSpeaking();
        await stopStreaming();

        setIsRecordingAnswer(false);
        setIsFullscreenLocked(true);


        const { data } = await api.post(
          "/interview/interview-violation",
          {
            interviewId,
            type: "fullscreen",
          }
        );


        if (data.terminate) {

          terminationStartedRef.current = true;
          toast.error(
            "Interview terminated due to multiple fullscreen violations."
          );

          await terminateInterview();

          return;
        }

        toast.error(
          "Return to fullscreen to continue."
        );

      } catch (err) {
        console.error(
          "Fullscreen violation request failed:",
          err
        );
      } finally {
        violationInProgressRef.current = false;
      }
    };

    // 4. Attach all listeners
    // document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // 5. Cleanup function
    return () => {
      if (interviewcompleted === true) {
        // document.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if ('keyboard' in navigator && 'unlock' in navigator.keyboard) {
          navigator.keyboard.unlock();
        }
      }
    };
  }, []);



  const isFirstModeRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstModeRenderRef.current) {
      isFirstModeRenderRef.current = false;
      return;
    }

    // Question is still being read aloud — nothing to toggle yet.
    // The speak() callback above will respect inputMode once it starts.
    if (!answerPhaseStartedRef.current) {
      return;
    }

    if (inputMode === "text") {
      stopStreaming();
      setIsRecordingAnswer(false);
    } else {
      setIsRecordingAnswer(true);
      startStreaming(mediaStreamRef.current);
    }
  }, [inputMode]);



  const fetchQuestion = useCallback(async () => {


    // Prevent concurrent requests
    if (isFetchingQuestionRef.current) {
      return;
    }

    isFetchingQuestionRef.current = true;

    setLoading(true);

    try {

      const res = await api.get(
        `/interview/${interviewId}/question`
      );

      if (!res.data.question) {
        return;
      }

      setQuestion(res.data.question);

      questionSeqRef.current += 1;
      socket.emit("start_question");

      liveTranscriptRef.current = "";
      setLiveTranscript("");
      setTypedAnswer("");

      stopSpeaking();

      speak(
        res.data.question.questionText,
        async () => {

          if (inputMode === "voice") {

            setIsRecordingAnswer(true);

            await startStreaming(
              mediaStreamRef.current
            );

          }

        }
      );

      setQuestionIndex(res.data.question.orderIndex);


    } catch (err) {

      toast.error(
        "Failed to load question. Please try again."
      );

    } finally {

      isFetchingQuestionRef.current = false;

      setLoading(false);

    }

  }, [
    interviewId,
    speak,
    stopSpeaking,
    startStreaming,
    inputMode
  ]);


  useEffect(() => {
    const init = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: true,

          });

        mediaStreamRef.current = stream;

        await startVideoRecording(stream);

        if (videoRef.current) {

          videoRef.current.srcObject = stream;

        }
        await fetchQuestion();

      } catch {
        toast.error(
          "Camera or microphone could not be started."
        );
      }
    };

    init();

    return () => {
      cleanupSession();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const uploadAnswer = useCallback(async (videoBlob, transcriptText) => {

    const formData = new FormData();

    formData.append(
      "video",
      videoBlob,
      `q${questionIndex}.webm`
    );

    formData.append(
      "questionId",
      question._id
    );

    formData.append(
      "transcript",
      transcriptText || ""
    );

    await api.post(
      `/interview/${interviewId}/answer`,
      formData
    );

  }, [
    interviewId,
    question,
    questionIndex,
  ]);


  const handleNext = useCallback(async () => {


    if (submitting || !question) {
      return;
    }

    stopSpeaking();

    setSubmitting(true);

    try {

      // Force OpenAI to finalize any speech still sitting in the buffer
      // before we read the transcript, so the last sentence before "Next"
      // isn't lost.
      if (inputMode === "voice") {

        await new Promise((resolve) => {

          socket.once("transcript_commit_complete", () => {
            resolve();
          });

          socket.emit("commit_audio");

        });


      }

      if (inputMode === "voice") {
        await stopStreaming();
      }

      setIsRecordingAnswer(false);

      const videoBlob = await stopVideoRecording();

      await uploadAnswer(
        videoBlob,
        inputMode === "text" ? typedAnswer : liveTranscriptRef.current
      );

      if (questionIndex >= TOTAL_QUESTIONS) {
        await api.post(
          `/interview/${interviewId}/submit`,
          {}
        );

        setinterviewcompleted(true)

        cleanupSession();
        setShowSuccessModal(true);
        return;
      }

      await startVideoRecording(
        mediaStreamRef.current
      );


      if (videoRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }

      await fetchQuestion()

    } catch (err) {
      toast.error(
        "Something went wrong. Please try again."
      );
    }

    finally {
      setSubmitting(false);
    }
  }, [
    cleanupSession,
    fetchQuestion,
    interviewId,
    question,
    questionIndex,
    startVideoRecording,
    stopVideoRecording,
    stopSpeaking,
    submitting,
    uploadAnswer,
    inputMode,
    typedAnswer
  ]);





  const isLastQuestion = questionIndex >= TOTAL_QUESTIONS;


  const switchToVoice = async () => {

    setInputMode("voice");

    setIsRecordingAnswer(true);

    await startStreaming(mediaStreamRef.current);

  };

  const switchToText = async () => {
    await stopStreaming();
    setIsRecordingAnswer(false);
    setInputMode("text");
    setTypedAnswer(liveTranscript)
  };

  return (
    <>
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
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 min-h-[140px]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current question
              </p>
              <p className="text-base font-medium leading-relaxed">
                {question?.questionText}
              </p>
            </section>

            <section className="flex flex-1 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Live transcript
                </p>
              </div>

              <div className="min-h-[260px] flex-1 text-sm leading-relaxed text-slate-300">
                {inputMode === "text" ? (
                  <textarea
                    disabled={isInterviewLocked}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    spellCheck={false}
                    autoFocus
                    className="
    h-72
    w-full
    resize-none
    rounded-xl
    border
    border-slate-700
    bg-[#0f172a]
    p-5
    text-base
    leading-7
    text-slate-100
    placeholder:text-slate-500
    outline-none
    transition-all
    duration-200
    focus:border-emerald-500
    focus:ring-2
    focus:ring-emerald-500/20
  "
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-base leading-7 text-slate-300">
                    {liveTranscript || (
                      <span className="text-slate-500 italic">
                        Your speech will appear here...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {isRecordingAnswer ? "Listening..." : "Mic off"}
              </div>

              <button
                disabled={isInterviewLocked}
                onClick={switchToVoice}
                className={`px-5 py-2 text-sm font-medium transition ${inputMode === "voice"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
                  }`}
              >
                🎤 Voice
              </button>

              <button
                disabled={isInterviewLocked}
                onClick={switchToText}
                className={`px-5 py-2 text-sm font-medium transition ${inputMode === "text"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
                  }`}
              >
                ⌨️ Type
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || submitting || isInterviewLocked}
                className="h-10 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? "Saving..."
                  : isLastQuestion
                    ? "Submit interview"
                    : "Next question"}
              </button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
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
      </div>

      {
        showSuccessModal && (
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
                  cleanupSession()
                  navigate("/dashboard", { replace: true })
                }}
                className="rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 cursor-pointer"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )
      }

      {
        showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-lg border border-amber-700 bg-slate-900 p-8 text-center">

              <h2 className="mb-3 text-2xl font-bold text-amber-400">
                Tab Switch Detected
              </h2>

              <p className="mb-6 text-slate-300">
                You have switched away from the interview tab.
                This is your first violation.
                Switching tabs again will terminate the interview.
              </p>

              <button
                type="button"
                onClick={async () => {

                  setShowWarningModal(false);

                  // Re-enable interview
                  setIsTabSwitchLocked(false);

                  // Resume voice mode if selected
                  if (
                    inputMode === "voice" &&
                    mediaStreamRef.current instanceof MediaStream
                  ) {
                    setIsRecordingAnswer(true);

                    await startStreaming(
                      mediaStreamRef.current
                    );
                  }

                }}
                className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-500"
              >
                Continue Interview
              </button>

            </div>
          </div>
        )
      }

      {
        isFullscreenLocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="w-full max-w-md rounded-lg bg-slate-900 p-8 text-center">

              <h2 className="text-2xl font-bold text-red-400">
                Fullscreen Required
              </h2>

              <p className="mt-3 text-slate-300">
                warning : You exited fullscreen.
                Return to fullscreen to continue your interview.
                next time interview will be auto submitted
              </p>

              <button
                onClick={async () => {
                  try {
                    await document.documentElement.requestFullscreen();
                  } catch {
                    toast.error("Unable to enter fullscreen.");
                  }
                }}
                className="mt-6 rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Return to Fullscreen
              </button>
            </div>
          </div>
        )
      }

    </>
  );
}