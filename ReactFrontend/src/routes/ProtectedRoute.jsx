import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { canAccess } from "../config/roleAccess";

export default function ProtectedRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(location.pathname, user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
