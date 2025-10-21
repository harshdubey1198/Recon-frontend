import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  // if no user, redirect to signin
  if (!user) return <Navigate to="/signin" replace />;

  return children;
}
