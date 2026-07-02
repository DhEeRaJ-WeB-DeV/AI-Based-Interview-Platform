import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axiosClient";

function ResetPassword({ email, otp, onBackToLogin }) {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
        confirmPassword,
      });

      toast.success(response.data?.message || "Password updated.");
      formRef.current?.reset();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to reset password. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 mx-auto grid min-h-screen w-[min(440px,calc(100%-24px))] items-center py-8">
      <section
        className="w-full rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
        aria-label="Reset password form"
      >
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="m-0 text-2xl font-semibold text-white">
              New password
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Choose a strong password for {email}.
            </p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>New password</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
              <KeyRound size={18} className="shrink-0" />
              <input
                ref={passwordRef}
                type="password"
                placeholder="Enter new password"
                autoComplete="new-password"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>Confirm password</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
              <KeyRound size={18} className="shrink-0" />
              <input
                ref={confirmPasswordRef}
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
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
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          <button
            type="button"
            className="border-0 bg-transparent font-bold text-teal-300 hover:text-teal-200"
            onClick={onBackToLogin}
          >
            Back to login
          </button>
          <span aria-hidden="true"> / </span>
          <Link
            className="font-bold text-teal-300 hover:text-teal-200"
            to="/forgot-password"
          >
            Request new OTP
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
