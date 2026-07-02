import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import AnimatedBackground from "./components/Auth/AnimatedBackground";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Login from "./components/Auth/Login";
import RegistrationPage from "./components/Auth/registration_page";
import ResetPassword from "./components/Auth/ResetPassword";
import { useAuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import InterviewRoute from "./pages/InterviewRoute";

const AuthShell = ({ children }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#080d16]">
    <AnimatedBackground />
    {children}
  </div>
);

const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-[#080d16]" />
);

const PublicOnly = ({ children }) => {
  const { authUser, authLoading } = useAuthContext();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return authUser ? <Navigate to="/dashboard" replace /> : children;
};

const PrivateOnly = ({ children }) => {
  const { authUser, authLoading } = useAuthContext();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return authUser ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const navigate = useNavigate();
  const { authUser, authLoading } = useAuthContext();
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");

  const handleOtpVerified = (email, otp) => {
    setResetEmail(email);
    setResetOtp(otp);
    navigate("/reset-password");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          authLoading ? (
            <AuthLoadingScreen />
          ) :
          authUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <AuthShell>
              <Login
                onForgotPasswordClick={(email) => {
                  setForgotEmail(email);
                  navigate("/forgot-password");
                }}
              />
            </AuthShell>
          </PublicOnly>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnly>
            <AuthShell>
              <RegistrationPage />
            </AuthShell>
          </PublicOnly>
        }
      />

      {/* <Route
        path="/register"
        element={<Navigate to="/signup" replace />}
      /> */}

      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <AuthShell>
              <ForgotPassword
                initialEmail={forgotEmail}
                onOtpVerified={handleOtpVerified}
              />
            </AuthShell>
          </PublicOnly>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicOnly>
            <AuthShell>
              <ResetPassword
                email={resetEmail}
                otp={resetOtp}
                onBackToLogin={() => navigate("/login")}
              />
            </AuthShell>
          </PublicOnly>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateOnly>
            <Dashboard />
          </PrivateOnly>
        }
      />

      <Route
        path="/interview/:interviewId"
        element={
          <PrivateOnly>
            <InterviewRoute />
          </PrivateOnly>
        }
      />

      <Route
        path="*"
        element={
          authLoading ? (
            <AuthLoadingScreen />
          ) : (
            <Navigate to={authUser ? "/dashboard" : "/login"} replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#111827",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            color: "#f8fafc",
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
