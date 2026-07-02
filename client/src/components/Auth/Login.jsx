import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, LogIn, Mail } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axiosClient";
import { useAuthContext } from "../../context/AuthContext";

function Login({ onForgotPasswordClick }) {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value || "";

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data?.user);
      toast.success(response.data?.message || "Login successful.");
      formRef.current?.reset();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = emailRef.current?.value?.trim();

    if (!email) {
      toast.error("Enter your email first.");
      emailRef.current?.focus();
      return;
    }

    onForgotPasswordClick(email);
  };

  return (
    <main className="relative z-10 mx-auto grid min-h-screen w-[min(1120px,calc(100%-32px))] grid-cols-1 items-center gap-7 py-8 md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] md:gap-12 md:py-12">
      <section className="max-w-xl" aria-label="Interview platform overview">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
          AI Interview Platform
        </p>
        <h1 className="m-0 text-4xl font-semibold leading-none tracking-normal text-white sm:text-5xl lg:text-7xl">
          Welcome back
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
          Sign in to continue interviews, manage candidates, or review platform
          analytics from your dashboard.
        </p>
      </section>

      <section
        className="w-full rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
        aria-label="Login form"
      >
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
            <LogIn size={22} />
          </div>
          <div>
            <h2 className="m-0 text-2xl font-semibold text-white">Login</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Use your registered account details.
            </p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>Email</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
              <Mail size={18} className="shrink-0" />
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>Password</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
              <KeyRound size={18} className="shrink-0" />
              <input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="Enter password"
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </label>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="w-fit border-0 bg-transparent text-sm font-bold text-teal-300 hover:text-teal-200"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-slate-400">
            New candidate?{" "}
            <Link className="font-bold text-teal-300 hover:text-teal-200" to="/signup">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
