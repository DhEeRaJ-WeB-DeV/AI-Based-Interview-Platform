import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axiosClient";

function ForgotPassword({ initialEmail = "", onOtpVerified }) {
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const [step, setStep] = useState("send-otp");
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const getEmail = () =>
    emailRef.current?.value?.trim() || submittedEmail || initialEmail;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const email = getEmail();

    if (!email) {
      toast.error("Enter your registered email.");
      emailRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your registered email.");
      setSubmittedEmail(email);
      setStep("otp");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const email = getEmail();
    const otp = otpRef.current?.value?.trim();

    if (!email || !otp) {
      toast.error("Enter your email and OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });
      toast.success(response.data?.message || "OTP verified.");
      onOtpVerified(email, otp);
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 mx-auto grid min-h-screen w-[min(440px,calc(100%-24px))] items-center py-8">
      <section
        className="w-full rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
        aria-label="Forgot password form"
      >
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="m-0 text-2xl font-semibold text-white">
              Reset access
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Verify your email before choosing a new password.
            </p>
          </div>
        </div>

        {step === "send-otp" && (
          <form onSubmit={handleSendOtp} className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              <span>Email</span>
              <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
                <Mail size={18} className="shrink-0" />
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  defaultValue={initialEmail}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              <span>OTP</span>
              <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
                <KeyRound size={18} className="shrink-0" />
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6 digit OTP"
                  autoComplete="one-time-code"
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="justify-self-center border-0 bg-transparent text-sm font-bold text-teal-300 hover:text-teal-200"
              onClick={() => setStep("send-otp")}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-400">
          Remembered it?{" "}
          <Link className="font-bold text-teal-300 hover:text-teal-200" to="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;
