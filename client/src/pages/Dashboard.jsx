import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient";
import AdminLayout from "../layouts/AdminLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";
import { useAuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthContext();
  const role = authUser?.role?.toLowerCase();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Local session cleared. Please sign in again.");
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  if (role === "candidate") {
    return <CandidateLayout user={authUser} onLogout={handleLogout} />;
  }

  if (role === "recruiter") {
    return <RecruiterLayout user={authUser} onLogout={handleLogout} />;
  }

  if (role === "admin") {
    return <AdminLayout user={authUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto mt-24 max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="text-2xl font-semibold">Unknown role</h1>
        <p className="mt-3 text-sm text-slate-400">
          Your account role could not be matched to a dashboard.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
