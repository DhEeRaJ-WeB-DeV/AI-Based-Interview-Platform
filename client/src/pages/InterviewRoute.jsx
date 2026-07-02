import { Navigate, useParams } from "react-router-dom";
import InterviewScreen from "../components/dashboard/candidate/InterviewScreen";
import { useAuthContext } from "../context/AuthContext";

const InterviewRoute = () => {
  const { interviewId } = useParams();
  const { authUser } = useAuthContext();

  if (authUser?.role?.toLowerCase() !== "candidate") {
    return <Navigate to="/dashboard" replace />;
  }

  return <InterviewScreen interviewId={interviewId} />;
};

export default InterviewRoute;
