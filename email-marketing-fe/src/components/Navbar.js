import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Hidden,
  Box,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <AppBar
      position="fixed"
      style={{
        backgroundColor: "#0f3165",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Toolbar>
        <Hidden mdUp>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, width: "10%" }}
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", minWidth: "fit-content", cursor: "pointer" }}
          onClick={() => handleNavigate("/")}
        >
          Email Marketing Tool
        </Typography>
      </Toolbar>
      <Box>
        <Tooltip title="Profile">
          <IconButton
            color="inherit"
            sx={{ width: "fit-content" }}
            onClick={() => handleNavigate("/profile")}
          >
            <PersonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton
            color="inherit"
            sx={{ width: "fit-content" }}
            onClick={onLogout}
          >
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </AppBar>
  );
};

export default Navbar;
