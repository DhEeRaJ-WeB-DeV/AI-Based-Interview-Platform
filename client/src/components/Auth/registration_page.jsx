import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { KeyRound, Mail, Phone, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axiosClient";
import { useAuthContext } from "../../context/AuthContext";

function RegistrationPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (value) => {
    const nextValue = value || "";
    phoneRef.current = nextValue;
    setPhone(nextValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneNumber = (phoneRef.current || "").replace(/\D/g, "").slice(-10);
    const payload = {
      name: nameRef.current?.value?.trim(),
      email: emailRef.current?.value?.trim(),
      password: passwordRef.current?.value || "",
      ph_no: phoneNumber,
    };

    if (!payload.name || !payload.email || !payload.password || !payload.ph_no) {
      toast.error("Please complete all registration fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", payload);
      login(response.data?.user);
      toast.success(response.data?.message || "Registration successful.");
      formRef.current?.reset();
      setPhone("");
      phoneRef.current = "";
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 mx-auto grid min-h-screen w-[min(1120px,calc(100%-32px))] grid-cols-1 items-center gap-7 py-8 md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] md:gap-12 md:py-12">
      <section className="max-w-xl" aria-label="Registration overview">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
          Candidate access
        </p>
        <h1 className="m-0 text-4xl font-semibold leading-none tracking-normal text-white sm:text-5xl lg:text-7xl">
          Create your account
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
          Register once, then return directly to your dashboard after refreshes
          and future sign-ins.
        </p>
      </section>

      <section
        className="-mt-8 w-full rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
        aria-label="Registration form"
      >
        <div className="mb-2 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
            <UserPlus size={22} />
          </div>
          <div>
            <h2 className="m-0 text-2xl font-semibold text-white">Sign up</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Candidate accounts are created with interview access.
            </p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>Full name</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
              <UserPlus size={18} className="shrink-0" />
              <input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="Your full name"
                autoComplete="name"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </label>

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
                placeholder="Create password"
                autoComplete="new-password"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            <span>Phone</span>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10 [&_.PhoneInput]:w-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput::placeholder]:text-slate-500">
              <Phone size={18} className="shrink-0" />
              <PhoneInput
                international
                defaultCountry="IN"
                placeholder="Enter phone number"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
            </div>
          </label>

          <button
            type="submit"
            className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already registered?{" "}
            <Link className="font-bold text-teal-300 hover:text-teal-200" to="/login">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default RegistrationPage;
