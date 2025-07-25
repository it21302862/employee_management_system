import React from "react";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "../../scenes/dashboard";
import { useAuth } from "../../context/AuthContext";

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "admin") return <AdminDashboard />;
  if (role === "employee") return < Dashboard/>;

  return <div>Unknown role</div>;
};

export default RoleBasedDashboard; 