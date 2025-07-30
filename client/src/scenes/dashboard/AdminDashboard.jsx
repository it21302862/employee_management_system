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
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useState } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [attendanceData, setAttendanceData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("check-in");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [editRow, setEditRow] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
      .get(`api/admin/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleEditClick = (row) => {
    setEditRow(row);
    setStartTime(row.checkIn ? new Date(row.checkIn) : null);
    setEndTime(row.checkOut ? new Date(row.checkOut) : null);
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const now = new Date();
      const timeString = formatTimeTo12Hour(now.toISOString());
      const action = dialogType === "check-in" ? "Check-in" : "Check-out";

      setSnackbarMessage(`${action} time successfully added at ${timeString}`);
      setSnackbarOpen(true);

      setDialogOpen(false);
      fetchAttendanceData();
    } catch (error) {
      console.error(`Error during ${dialogType}:`, error);
      alert(error?.response?.data?.msg || "Something went wrong.");
    }
  };

  const handleEditSubmit = async () => {
    if (!startTime && !endTime) {
      alert("Please set at least one time");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const dateStr = editRow?.date || date.toISOString().split("T")[0];

      const formatToHHMM = (dateObj) => {
        if (!dateObj) return null;
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      console.log("Editing row:", editRow);

      const payload = {
        employeeId: editRow?.empId || null,
        date: dateStr,
        checkInTime: formatToHHMM(startTime),
        checkOutTime: formatToHHMM(endTime),
      };

      await axios.post("api/admin/update-checkIn", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const calculateWorkingHours = (start, end) => {
        if (!start || !end) return "—";

        const startDate = new Date(start);
        const endDate = new Date(end);

        const diffMs = endDate - startDate;
        if (isNaN(diffMs) || diffMs < 0) return "—";

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      };

      setAttendanceData((prev) =>
        prev.map((item) =>
          item.id === editRow.id
            ? {
                ...item,
                checkIn: startTime ? startTime.toISOString() : item.checkIn,
                checkOut: endTime ? endTime.toISOString() : item.checkOut,
                workingHours: calculateWorkingHours(startTime, endTime),
              }
            : item
        )
      );

      setSnackbarMessage("Attendance times updated successfully");
      setSnackbarOpen(true);
      setDialogOpen(false);
      setEditRow(null);
    } catch (error) {
      console.error("Error updating attendance times:", error);
      alert(error?.response?.data?.msg || "Failed to update attendance times");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
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
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleEditClick(params.row)}
          startIcon={<EditIcon />}
          variant="outlined"
          size="small"
          sx={{
            color: (theme) =>
              `${
                theme.palette.mode === "dark"
                  ? colors.grey[100]
                  : colors.grey[400]
              } !important`,
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[400],
            "&:hover": {
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? colors.grey[100]
                  : colors.grey[400],
            },
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ m: { xs: 1, sm: 2, md: 3 } }}>
      {/* HEADER */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} md={8}>
          <Header title="DASHBOARD" subtitle="Welcome to attendance records" />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 2,
              mt: { xs: 2, md: 0 },
            }}
          >
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: "#fff !important",
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                mr: { xs: 1, md: 2 },
                "&:hover": { backgroundColor: colors.blueAccent[800] },
              }}
              onClick={() => handleOpenDialog("check-in")}
            >
              Check-In
            </Button>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: "#fff !important",
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                "&:hover": { backgroundColor: colors.greenAccent[700] },
              }}
              onClick={() => handleOpenDialog("check-out")}
            >
              Check-Out
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* DATE PICKER TO LOAD ATTENDANCE */}
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ mt: { xs: 2, md: 4 } }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Attendance Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment:
                      params.InputProps.endAdornment &&
                      React.cloneElement(params.InputProps.endAdornment, {
                        style: {
                          color:
                            theme.palette.mode === "dark"
                              ? colors.grey[100]
                              : colors.grey[900],
                        },
                      }),
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            onClick={fetchAttendanceData}
            color="inherit"
            sx={{
              backgroundColor: colors.greenAccent[500],
              width: "100%",
              mt: { xs: 2, sm: 0 },
              color: "#fff !important",
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
                color: "#fff !important",
              },
            }}
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
          width: "100%",
          overflowX: "auto",
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
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[400] + " !important",
          },
          "& .MuiDataGrid-iconButtonContainer .MuiSvgIcon-root": {
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[400] + " !important",
          },
          "& .MuiDataGrid-sortIcon": {
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[400] + " !important",
          },
        }}
      >
        <Typography
          variant="h5"
          color={colors.grey[100]}
          mb={2}
          sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
        >
          Attendance Summary
        </Typography>
        <DataGrid
          rows={attendanceData}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* POPUP DIALOG */}
      {editRow ? (
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditRow(null);
          }}
        >
          <DialogTitle>Edit Attendance Times</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Start Work Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{ mt: 2 }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment:
                        params.InputProps.endAdornment &&
                        React.cloneElement(params.InputProps.endAdornment, {
                          style: {
                            color:
                              theme.palette.mode === "dark"
                                ? colors.grey[100]
                                : colors.grey[900],
                          },
                        }),
                    }}
                  />
                )}
              />
              <TimePicker
                label="End Work Time"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{ mt: 2 }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment:
                        params.InputProps.endAdornment &&
                        React.cloneElement(params.InputProps.endAdornment, {
                          style: {
                            color:
                              theme.palette.mode === "dark"
                                ? colors.grey[100]
                                : colors.grey[900],
                          },
                        }),
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setEditRow(null);
              }}
              sx={{
                color: "#fff",
                backgroundColor: colors.blueAccent[700],
                "&:hover": { backgroundColor: colors.blueAccent[800] },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              sx={{
                color: "#fff",
                backgroundColor: colors.greenAccent[600],
                "&:hover": { backgroundColor: colors.greenAccent[700] },
              }}
            >
              Update Times
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
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
                minDate={new Date()}
                maxDate={new Date()} 
                renderInput={(params) => (
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment:
                        params.InputProps.endAdornment &&
                        React.cloneElement(params.InputProps.endAdornment, {
                          style: {
                            color:
                              theme.palette.mode === "dark"
                                ? colors.grey[100]
                                : colors.grey[900],
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
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? colors.blueAccent[700]
                    : colors.blueAccent[500],
                color:
                  theme.palette.mode === "dark"
                    ? colors.grey[100]
                    : colors.grey[400],
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? colors.greenAccent[600]
                    : colors.greenAccent[400],
                color:
                  theme.palette.mode === "dark"
                    ? colors.grey[100]
                    : colors.grey[400],
              }}
            >
              {dialogType === "check-in"
                ? "Submit Check-In"
                : "Submit Check-Out"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
