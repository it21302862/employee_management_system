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

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [attendanceData, setAttendanceData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("check-in");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());

  const formatTimeTo12Hour = (isoString) => {
  if (!isoString) return "—"; 

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "—"; 

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


  const fetchAttendanceData = () => {
    const token = localStorage.getItem("token");
    const selectedDate = date.toLocaleDateString("en-CA");
    axios
      .get(`http://localhost:8000/api/admin/attendance?date=${selectedDate}`, {
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
        alert("Error loading attendance");
      });
  };

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
        `http://localhost:8000/api/attendance/${dialogType}`,
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
    { field: "empId", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "checkIn",
      headerName: "Start Work Time",
      flex: 1,
      valueGetter: (params) => formatTimeTo12Hour(params.row.checkIn),
    },
    {
      field: "checkOut",
      headerName: "End Work Time",
      flex: 1,
      valueGetter: (params) => formatTimeTo12Hour(params.row.checkOut),
    },
    { field: "workingHours", headerName: "Working Hours", flex: 1 },
    {
  field: "status",
  headerName: "Status",
  flex: 1,
  renderCell: ({ row }) => {
    const { checkIn, checkOut } = row;

    let status = "Absent";
    let bgColor = theme.palette.error.main;
    let icon = <HighlightOffIcon sx={{ mr: "6px" }} />;

    if (checkIn && checkOut) {
      status = "Present";
      bgColor = colors.greenAccent[600];
      icon = <CheckCircleOutlineIcon sx={{ mr: "6px" }} />;
    } else if (checkIn && !checkOut) {
      status = "Incomplete";
      bgColor = colors.yellowAccent?.[600] || "#FFFFCC";
      icon = <HighlightOffIcon sx={{ mr: "6px" }} />;
    } else if (!checkIn && checkOut) {
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
          <Header
            title="DASHBOARD"
            subtitle="Welcome to your attendance records"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
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
                color: colors.grey[900],
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

      {/* DATE PICKER TO LOAD ATTENDANCE */}
      <Grid container alignItems="center" spacing={2} sx={{ mt: { xs: 2, md: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Attendance Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            onClick={fetchAttendanceData}
            sx={{ backgroundColor: colors.greenAccent[500], width: '100%', mt: { xs: 2, sm: 0 } }}
          >
            Get Attendance
          </Button>
        </Grid>
      </Grid>

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
            color: `${colors.grey[100]} !important`,
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
                <TextField fullWidth sx={{ mt: 2 }} {...params} />
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {dialogType === "check-in" ? "Submit Check-In" : "Submit Check-Out"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
