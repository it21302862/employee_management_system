import React, { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; 
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout"; 
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const coloredIcon =
    icon &&
    (typeof icon.type === "function"
      ? React.cloneElement(icon, {
          sx: {
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[900],
          },
        })
      : icon);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={coloredIcon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "api/attendance/summary?range=week",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSummaryData(res.data);
      } catch (err) {
        console.error("Failed to fetch summary data", err);
      }
    };

    fetchSummary();
  }, []);

  const formatHours = (decimal) => {
    const totalMinutes = Math.round(parseFloat(decimal) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let result = "";
    if (hours > 0) result += `${hours} hr `;
    if (minutes > 0) result += `${minutes} min`;
    return result.trim() || "0 min";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", 
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={
              isCollapsed ? (
                <MenuOutlinedIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              ) : undefined
            }
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {user.role === "admin" ? "ADMIN" : "EMPLOYEE"}
                </Typography>

                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? colors.grey[100]
                          : colors.grey[900],
                    }}
                  />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={user?.profileImage}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user?.name || "User"}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {user?.position || ""}
                </Typography>
                <Typography variant="h6" color={colors.grey[300]}>
                  Total Work Days:{" "}
                  <strong>{summaryData?.totalDays || 0}</strong>/40
                </Typography>

                <Typography variant="h6" color={colors.grey[300]}>
                  Total Work Hours:{" "}
                  {formatHours(summaryData?.totalHours || "0")}
                </Typography>
                <Typography variant="h6" color={colors.grey[300]}>
                  Average Daily Hours:{" "}
                  {formatHours(summaryData?.averageDailyHours || "0")}
                </Typography>
              </Box>
            </Box>
          )}
          <hr />
          <br />
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={
                <HomeOutlinedIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              }
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            {user?.role === "admin" && (
              <Item
                title="Manage Team"
                to="/team"
                icon={
                  <PeopleOutlinedIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? colors.grey[100]
                          : colors.grey[900],
                    }}
                  />
                }
                selected={selected}
                setSelected={setSelected}
              />
            )}

            <Item
              title="Contacts Information"
              to="/contacts"
              icon={
                <ContactsOutlinedIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              }
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title={user?.role === "admin" ? "Employee Logs" : "My Logs"}
              to="/logs"
              icon={
                <HistoryIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              }
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            {/* <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Calendar"
              to="/calendar"
              icon={
                <CalendarTodayOutlinedIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              }
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Chart
            </Typography>
            <Item
              title="Work Chart"
              to="/pie"
              icon={
                <PieChartOutlineOutlinedIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                  }}
                />
              }
              selected={selected}
              setSelected={setSelected}
            />
            {user?.role === "admin" && (
              <Item
                title="Line Chart"
                to="/line"
                icon={
                  <TimelineOutlinedIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? colors.grey[100]
                          : colors.grey[900],
                    }}
                  />
                }
                selected={selected}
                setSelected={setSelected}
              />
            )}
          </Box>

          {/* Logout Button at the bottom */}
          <Box sx={{ mt: "auto", mb: 2, px: 2 }}>
            <MenuItem
              icon={<LogoutIcon sx={{ color: colors.grey[100] }} />}
              onClick={handleLogout}
              style={{ color: colors.grey[100], cursor: "pointer" }}
            >
              <Typography>Logout</Typography>
            </MenuItem>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return sidebarContent;
};

export default Sidebar;
