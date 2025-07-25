import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  return (
    <Box display="flex" justifyContent="space-between" sx={{ p: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        sx={{ width: { xs: '100%', sm: 'auto' }, mb: { xs: 1, sm: 0 } }}
      >
        <InputBase sx={{ ml: 2, flex: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }} />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex" sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon sx={{ color: colors.grey[100] }} />
          ) : (
            <LightModeOutlinedIcon sx={{ color: colors.grey[900] }} />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }} />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }} />
        </IconButton>
        <IconButton>
          <PersonOutlinedIcon sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
