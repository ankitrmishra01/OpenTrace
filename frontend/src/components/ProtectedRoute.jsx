import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("ot_token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Invalid token format");
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("ot_token");
      localStorage.removeItem("ot_user");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch (err) {
    localStorage.removeItem("ot_token");
    localStorage.removeItem("ot_user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
