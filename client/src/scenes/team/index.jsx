import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Avatar,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Header from "../../components/Header";
import axios from "axios";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/admin/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dataWithId = response.data.map((employee) => ({
          id: employee.employeeId,
          access: employee.role === "admin" ? "admin" : "emp",
          ...employee,
        }));

        setEmployees(dataWithId);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch employees",
          severity: "error",
        });
      }
    };

    fetchEmployees();
  }, []);

  // Open dialog on delete button click
  const handleDeleteClick = () => {
    if (selectionModel.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one user to delete.",
        severity: "warning",
      });
      return;
    }
    setDialogOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    setDialogOpen(false);

    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        selectionModel.map((employeeId) =>
          axios.delete(
            `http://localhost:8000/api/admin/remove-user/${employeeId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );

      setSnackbar({
        open: true,
        message: "Selected users deleted successfully",
        severity: "success",
      });

      setEmployees((prev) =>
        prev.filter((emp) => !selectionModel.includes(emp.employeeId))
      );
      setSelectionModel([]);
    } catch (error) {
      console.error("Error deleting users:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete some users",
        severity: "error",
      });
    }
  };

  const handleCancelDelete = () => {
    setDialogOpen(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const columns = [
    {
      field: "profileImage",
      headerName: "Profile",
      width: 80,
      renderCell: ({ value }) => <Avatar src={value} alt="Profile" />,
      sortable: false,
      filterable: false,
    },
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "position", headerName: "Position", flex: 1 },
    { field: "age", headerName: "Age", type: "number", flex: 0.5 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "zipCode", headerName: "Zip Code", flex: 1 },
    {
      field: "accessLevel",
      headerName: "Access",
      flex: 1,
      renderCell: ({ row }) => {
        const access = row.access;
        return (
          <Box
            width="120%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            backgroundColor={
              access === "admin"
                ? colors.greenAccent[600]
                : colors.greenAccent[400]
            }
            borderRadius="4px"
          >
            {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access === "emp" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100000]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />

      <Button
        variant="contained"
        disabled={selectionModel.length === 0}
        onClick={handleDeleteClick}
        sx={{
          mb: 2,
          color: `${
            theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[400]
          } !important`,
        }}
      >
        Delete Selected
      </Button>

      <Box
        mt="10px"
        height="75vh"
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
            backgroundColor: colors.blueAccent[700],
            borderTop: "none",
          },
        }}
      >
        <DataGrid
          rows={employees}
          columns={columns}
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            setSelectionModel(newSelection);
          }}
          selectionModel={selectionModel}
          getRowId={(row) => row.employeeId}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected user
            {selectionModel.length > 1 ? "s" : ""}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? colors.grey[100]
                  : colors.grey[400] + " !important",
            }}
          >
            No
          </Button>

          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;
