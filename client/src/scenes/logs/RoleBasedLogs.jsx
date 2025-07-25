import React from "react";
import { useAuth } from "../../context/AuthContext";
import EmployeeLogs from "./EmployeeLogs";
import MyLogs from "./MyLogs";

const RoleBasedLogs = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "admin") return <EmployeeLogs />;
  if (role === "employee") return < MyLogs/>;

  return <div>Unknown role</div>;
};

export default RoleBasedLogs; 