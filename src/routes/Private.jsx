import React from "react";
import { Navigate, Outlet } from "react-router-dom";
const PrivateRoutes = () => {
  const authUser = localStorage.getItem("token");
  // For all other routes, require authentication
  return authUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;