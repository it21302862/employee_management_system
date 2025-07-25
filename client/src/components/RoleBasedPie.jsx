import React from "react";
import AdminPieChart from "./AdminPieChart";
import PieChart from "./PieChart";
import { useAuth } from "../context/AuthContext";

const RoleBasedPie = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "admin") return <AdminPieChart />;
  if (role === "employee") return < PieChart/>;

  return <div>Unknown role</div>;
};

export default RoleBasedPie; 