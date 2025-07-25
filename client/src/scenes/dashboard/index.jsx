import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [attendanceData, setAttendanceData] = useState([]);

  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8000/api/attendance/dash-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const dataWithIds = response.data.map((item, index) => ({
          id: index + 1,
          ...item,
        }));
        setAttendanceData(dataWithIds);
      })
      .catch((error) => {
        console.error("Error fetching attendance data:", error);
      });
  }, []);

  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "startTime",
      headerName: "Start Work Time",
      flex: 1,
      valueGetter: (params) => formatTimeTo12Hour(params.row.startTime),
    },
    {
      field: "endTime",
      headerName: "End Work Time",
      flex: 1,
      valueGetter: (params) => formatTimeTo12Hour(params.row.endTime),
    },

    { field: "workingHours", headerName: "Working Hours", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row: { status } }) => {
        const isPresent = status === "Present";

        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="5px 10px"
            borderRadius="4px"
            width="100%"
            sx={{
              backgroundColor: isPresent
                ? colors.greenAccent[600]
                : theme.palette.error.main,
              color: colors.grey[100],
            }}
          >
            {isPresent ? (
              <CheckCircleOutlineIcon sx={{ mr: "6px" }} />
            ) : (
              <HighlightOffIcon sx={{ mr: "6px" }} />
            )}
            <Typography>{status}</Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
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
        }}
      >
        <Typography variant="h5" color={colors.grey[100]} mb={2}>
          Attendance Summary
        </Typography>
        <DataGrid rows={attendanceData} columns={columns} />
      </Box>
    </Box>
  );
};

export default Dashboard;
