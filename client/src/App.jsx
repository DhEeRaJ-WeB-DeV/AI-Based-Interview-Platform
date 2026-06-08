import { useState } from "react";
import ForgotPassword from "./components/ForgotPassword";
import Login from "./components/Login";
import RegistrationPage from "./components/registration_page";
import ResetPassword from "./components/ResetPassword";
import "./App.css";
import AnimatedBackground from "./components/AnimatedBackground";

const STORAGE_KEY = "registeredUsers";

const getInitialUsers = () => {
  const savedUsers = localStorage.getItem(STORAGE_KEY);

  if (!savedUsers) {
    return [];
  }

  try {
    return JSON.parse(savedUsers);
  } catch {
    return [];
  }
};

function App() {
  const [page, setPage] = useState("login");
  const [registeredUsers, setRegisteredUsers] = useState(getInitialUsers);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");

  const saveUsers = (users) => {
    setRegisteredUsers(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const handleRegisterUser = (user) => {
    const filteredUsers = registeredUsers.filter(
      (registeredUser) =>
        registeredUser.email.toLowerCase() !== user.email.toLowerCase()
    );

    saveUsers([...filteredUsers, user]);
    setPage("login");
  };

  const handlePasswordReset = (email, password) => {
    const updatedUsers = registeredUsers.map((user) =>
      user.email.toLowerCase() === email.toLowerCase()
        ? { ...user, password }
        : user
    );

    saveUsers(updatedUsers);
    setResetEmail("");
    setResetOtp("");
  };

  const handleOtpVerified = (email, otp) => {
    setResetEmail(email);
    setResetOtp(otp);
    setPage("reset-password");
  };

  let pageContent = (
    <Login
      onForgotPasswordClick={() => setPage("forgot-password")}
      onRegisterClick={() => setPage("register")}
    />
  );

  if (page === "register") {
    pageContent = (
      <RegistrationPage
        onBackToLogin={() => setPage("login")}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  if (page === "forgot-password") {
    pageContent = (
      <ForgotPassword
        onBackToLogin={() => setPage("login")}
        onOtpVerified={handleOtpVerified}
      />
    );
  }

  if (page === "reset-password") {
    pageContent = (
      <ResetPassword
        email={resetEmail}
        otp={resetOtp}
        onBackToLogin={() => setPage("login")}
        onPasswordReset={handlePasswordReset}
      />
    );
  }

  return (
    <>
      <AnimatedBackground />
      {pageContent}
    </>
  );
}

export default App;
