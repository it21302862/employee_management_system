import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useEffect, useState } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React from "react";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [attendanceData, setAttendanceData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("check-in"); // or "check-out"
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());

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

  const fetchAttendanceData = () => {
    const token = localStorage.getItem("token");
    axios
      .get("api/attendance/dash-summary", {
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
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setNote("");
    setDate(new Date());
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `api/attendance/${dialogType}`,
        {
          date: date.toISOString().split("T")[0],
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogOpen(false);
      fetchAttendanceData();
    } catch (error) {
      console.error(`Error during ${dialogType}:`, error);
      alert(error?.response?.data?.msg || "Something went wrong.");
    }
  };

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
      renderCell: ({ row }) => {
        const { startTime, endTime } = row;
    
        let status = "Absent";
        let bgColor = theme.palette.error.main;
        let icon = <HighlightOffIcon sx={{ mr: "6px" }} />;
    
        if (startTime && endTime) {
          status = "Present";
          bgColor = colors.greenAccent[600];
          icon = <CheckCircleOutlineIcon sx={{ mr: "6px" }} />;
        } else if (startTime && !endTime) {
          status = "Incomplete";
          bgColor = colors.yellowAccent?.[600] || "#FFFFCC";
          icon = <HighlightOffIcon sx={{ mr: "6px" }} />;
        } else if (!startTime && endTime) {
          status = "Incomplete";
          bgColor = colors.yellowAccent?.[600] || "#facc15";
          icon = <HighlightOffIcon sx={{ mr: "6px" }} />;
        }
    
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="5px 10px"
            borderRadius="4px"
            width="100%"
            sx={{
              backgroundColor: bgColor,
              color: colors.grey[900],
            }}
          >
            {icon}
            <Typography fontWeight="bold">{status}</Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ m: { xs: 1, sm: 2, md: 3 } }}>
      {/* HEADER */}
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} md={8}>
          <Header title="DASHBOARD" subtitle="Welcome to your attendance records" />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: `${theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400]} !important`,
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                mr: { xs: 1, md: 2 },
              }}
              onClick={() => handleOpenDialog("check-in")}
            >
              Check-In
            </Button>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: `${theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400]} !important`,
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
              }}
              onClick={() => handleOpenDialog("check-out")}
            >
              Check-Out
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* POPUP DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogType === "check-in" ? "Check In" : "Check Out"}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: params.InputProps.endAdornment &&
                      React.cloneElement(params.InputProps.endAdornment, {
                        style: {
                          color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
                        },
                      }),
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            variant="outlined"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
              color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[600] : colors.greenAccent[400],
              color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
            }}
          >
            {dialogType === "check-in" ? "Submit Check-In" : "Submit Check-Out"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TABLE */}
      <Box
        mt={{ xs: 2, md: 5 }}
        height={{ xs: 300, sm: 400 }}
        sx={{
          width: '100%',
          overflowX: 'auto',
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
          "& .MuiDataGrid-iconButtonContainer .MuiSvgIcon-root": {
            color: `${theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400]} !important`,
          },
          "& .MuiDataGrid-sortIcon": {
            color: `${theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400]} !important`,
          },
        }}
      >
        <Typography variant="h5" color={colors.grey[100]} mb={2} sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          Attendance Summary
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

export default Dashboard;
