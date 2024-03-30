import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import Login from "./components/Login.js";
import { AuthProvider } from "./authContext.js";
import ProtectedRoute from "./protectedRoute.js";
import DashboardComponent from "./dashboard/dashboard.js";
import Layout from "./layout/Layout.js";
import PageNotFound from "./components/PageNotFound.js";
import UsersList from "./pages/users/UsersList.js";
import ContactsList from "./pages/contacts/ContactsList.js";
import TemplatePage from "./pages/templates/TemplateList.js";
import SenderList from "./pages/sender/SenderList.js";
import CampaignsList from "./pages/campaign/CampaignsList.js";
import CampaignDetails from "./pages/campaign/CampaignDetails.js";
import Profile from "./pages/profile/Profile.js";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("authToken");
  };

  const handleSetUserRole = () => {
    console.log(localStorage.getItem("userRole"))
    if(localStorage.getItem("userRole") === "ADMIN") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        const isTokenExpired = decodedToken.exp * 1000 < Date.now();
        if (!isTokenExpired) {
          setIsLoggedIn(true);
        } else {
          handleLogout();
        }
        
      } catch (error) {
        handleLogout();
      }
    }
    
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
          />
          <Route
            path="/login"
            element={
              <Login onLogin={handleLogin} onSetUserRole={handleSetUserRole} />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={
                  <Layout isAdmin={isAdmin}>
                    <DashboardComponent
                      onLogout={handleLogout}
                      isAdmin={isAdmin}
                    />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                element={
                  <Layout isAdmin={isAdmin}>
                    <UsersList />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute
                element={
                  <Layout isAdmin={isAdmin}>
                    <ContactsList />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TemplatePage />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/campaign"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <CampaignsList />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/campaign/:campaignId"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <CampaignDetails />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/sender"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <SenderList />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <Profile />
                  </Layout>
                }
                authenticated={isLoggedIn}
                redirectPath="/login"
              />
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
