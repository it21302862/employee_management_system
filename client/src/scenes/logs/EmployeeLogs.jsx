import {
  Box,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";

const EmployeeLogs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [attendanceData, setAttendanceData] = useState([]);

  function convertTo12HourFormat(time24) {
    if (!time24) return "—";

    const [hour, minute] = time24.split(":");
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const formattedHour = hourNum % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  }

  const fetchAttendanceData = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/all-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allLogs = response.data;

      const dataWithIds = allLogs.map((item, index) => ({
        id: index + 1,
        empId: item.empId || "—",
        type: item.type,
        date: item.date,
        time: convertTo12HourFormat(item.time),
        reason: item.reason || "—",
      }));

      setAttendanceData(dataWithIds);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Error loading logs");
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const columns = [
    { field: "empId", headerName: "Employee ID", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "time", headerName: "Time", flex: 1 },
    { field: "reason", headerName: "Reason", flex: 2 },
  ];

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Attendence Logs"
          subtitle="Here the attendence logs"
        />
      </Box>

      {/* TABLE */}
      <Box
        mt="40px"
        height="400px"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400]} !important`,
          },
        }}
      >
        <Typography variant="h5" color={colors.grey[100]} mb={2}>
          Attendance Logs
        </Typography>

        <DataGrid
          rows={attendanceData}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default EmployeeLogs;
