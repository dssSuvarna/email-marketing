import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "./Layout.module.css";

const Layout = ({ children, isAdmin }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  const handleMenuClick = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar onMenuClick={handleMenuClick} onLogout={handleLogout} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} isAdmin={isAdmin}/>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          //   marginLeft: isSidebarOpen ? "240px" : "0",
          marginTop: "64px",
          transition: "margin-left 0.3s",
          width: "-webkit-fill-available",
        }}
        className={
          viewportWidth <= 800
            ? `${styles.child_component_small}`
            : `${styles.child_component_large}`
        }
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
