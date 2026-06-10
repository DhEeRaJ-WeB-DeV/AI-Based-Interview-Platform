import { useState } from "react";
import api, { getErrorMessage } from "../../api/axiosClient";

function ForgotPassword({ onBackToLogin, onOtpVerified }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data?.message || "OTP sent to your registered email.");
      console.log("Forgot password response:", response.data);
      setStep("otp");
    } catch (error) {
      setMessage(
        getErrorMessage(error, "Unable to send OTP. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      setMessage(response.data?.message || "OTP verified.");
      console.log("OTP verification response:", response.data);
      onOtpVerified(email, otp);
    } catch (error) {
      setMessage(getErrorMessage(error, "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card forgot-card">
        <div className="profile-icon">FP</div>

        <h2>Forgot Password</h2>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Registered Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && <p className="form-message">{message}</p>}

            <button type="submit" className="login-btn">
              {loading ? "SENDING..." : "SEND OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <div className="input-group">
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            {message && <p className="form-message">{message}</p>}

            <button type="submit" className="login-btn">
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>
          </form>
        )}

        <button type="button" className="register-text" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;