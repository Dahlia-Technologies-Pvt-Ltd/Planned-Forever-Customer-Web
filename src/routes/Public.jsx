import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
  const authUser = localStorage.getItem("token");
  return <>{!authUser ? <Outlet /> : <Navigate to="/event-screen" />}</>;
};

export default PublicRoutes;