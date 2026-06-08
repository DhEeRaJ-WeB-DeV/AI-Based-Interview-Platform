import { useState } from "react";
import api, { getErrorMessage } from "../api/axiosClient";

function ResetPassword({ email, otp, onBackToLogin, onPasswordReset }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        password: newPassword,
        confirmPassword,
      });

      onPasswordReset(email, newPassword);
      setMessage(response.data?.message || "Password updated. Redirecting to login...");
      console.log("Reset password response:", response.data);

      setTimeout(() => {
        onBackToLogin();
      }, 1200);
    } catch (error) {
      setMessage(
        getErrorMessage(error, "Unable to reset password. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card reset-card">
        <div className="profile-icon">RP</div>

        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="form-message">{message}</p>}

          <button type="submit" className="login-btn">
            {loading ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>

        <button type="button" className="register-text" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;