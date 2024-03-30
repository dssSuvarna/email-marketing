import React, { useEffect, useState } from "react";
import {
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import CampaignIcon from "@mui/icons-material/Campaign";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import styles from "../css/Sidebar.module.css";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

const SideBarLists = ({ drawerOpen }) => {
  const [activeListItem, setActiveListItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleListItemClick = (itemName) => {
    setActiveListItem(itemName);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };
  // const listItemStyle = {
  //   backgroundColor: activeListItem ? "#0f3165" : "transparent",
  //   color: activeListItem ? "white !important" : "inherit",
  // };

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith("/users")) {
      setActiveListItem("Users");
    } else if (currentPath.startsWith("/contacts")) {
      setActiveListItem("Contacts");
    } else if (currentPath.startsWith("/templates")) {
      setActiveListItem("Templates");
    } else if (currentPath.startsWith("/campaign")) {
      setActiveListItem("Campaign");
    } else if (currentPath.startsWith("/sender")) {
      setActiveListItem("Sender");
    } else {
      setActiveListItem(null); // No match, set to null
    }
  }, [location.pathname]);
  return (
    <List sx={{ padding: "0px" }}>
      {localStorage.getItem("userRole") === "ADMIN" && (
        <ListItem
          button
          component={NavLink}
          to="/users"
          onClick={() => {
            handleListItemClick("Users");
            handleNavigate("/users");
          }}
          selected={activeListItem === "Users"}
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#ddd",
            },
          }}
        >
          <ListItemIcon>
            <PeopleIcon className={styles.icon_color} />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText primary="Users" sx={{ marginLeft: "-20px" }} />
          )}
        </ListItem>
      )}
      <ListItem
        button
        component={NavLink}
        to="/contacts"
        onClick={() => {
          handleListItemClick("Contacts");
          handleNavigate("/contacts");
        }}
        selected={activeListItem === "Contacts"}
        sx={{
          "&.Mui-selected": {
            backgroundColor: "#ddd",
          },
        }}
      >
        <ListItemIcon>
          <ContactMailIcon className={styles.icon_color} />
        </ListItemIcon>
        {drawerOpen && (
          <ListItemText primary="Contacts" sx={{ marginLeft: "-20px" }} />
        )}
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/templates"
        onClick={() => {
          handleListItemClick("Templates");
          handleNavigate("/templates");
        }}
        selected={activeListItem === "Templates"}
        sx={{
          "&.Mui-selected": {
            backgroundColor: "#ddd",
          },
        }}
      >
        <ListItemIcon>
          <DescriptionIcon className={styles.icon_color} />
        </ListItemIcon>
        {drawerOpen && (
          <ListItemText primary="Templates" sx={{ marginLeft: "-20px" }} />
        )}
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/campaign"
        onClick={() => {
          handleListItemClick("Campaign");
          handleNavigate("/campaign");
        }}
        selected={activeListItem === "Campaign"}
        sx={{
          "&.Mui-selected": {
            backgroundColor: "#ddd",
          },
        }}
      >
        <ListItemIcon>
          <CampaignIcon className={styles.icon_color} />
        </ListItemIcon>
        {drawerOpen && (
          <ListItemText primary="Campaign" sx={{ marginLeft: "-20px" }} />
        )}
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/sender"
        onClick={() => {
          handleListItemClick("Sender");
          handleNavigate("/sender");
        }}
        selected={activeListItem === "Sender"}
        sx={{
          "&.Mui-selected": {
            backgroundColor: "#ddd",
          },
        }}
      >
        <ListItemIcon>
          <EmailIcon className={styles.icon_color} />
        </ListItemIcon>
        {drawerOpen && (
          <ListItemText primary="Sender" sx={{ marginLeft: "-20px" }} />
        )}
      </ListItem>
    </List>
  );
};

const Sidebar = ({ isOpen, onClose, isAdmin }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Hidden lgUp>
        <Drawer
          variant="temporary"
          anchor="left"
          open={isOpen}
          onClose={onClose}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <SideBarLists drawerOpen={true} isAdmin={isAdmin} />
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          variant="permanent"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            marginRight: drawerOpen ? "180px" : "100px",
          }}
          className={styles.sidebar_list}
          onMouseOver={() => setDrawerOpen(true)}
          onMouseLeave={() => setDrawerOpen(false)}
        >
          <SideBarLists drawerOpen={drawerOpen} isAdmin={isAdmin} />
        </Drawer>
      </Hidden>
    </>
  );
};

export default Sidebar;
