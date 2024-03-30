import React, { useEffect } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DescriptionIcon from "@mui/icons-material/Description";
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import { Link } from "react-router-dom";

const DashboardComponent = () => {

  const handleUserDetails = async () => {
    const storedToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/auth/get-user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const userId = data.id;
        localStorage.setItem("userId", userId);
        console.log(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    handleUserDetails();
  },[])

  return (
    <Grid container spacing={3}>
      {localStorage.getItem("userRole") === "ADMIN" && (
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <Card>
              <CardContent>
                <GroupIcon style={{ fontSize: 48, color: "#0f3165" }} />
                <Typography variant="h5" component="div" mt={2}>
                  Users
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      )}

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/contacts" style={{ textDecoration: "none" }}>
          <Card>
            <CardContent>
              <ContactMailIcon style={{ fontSize: 48, color: "#0f3165" }} />
              <Typography variant="h5" component="div" mt={2}>
                Contacts
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/templates" style={{ textDecoration: "none" }}>
          <Card>
            <CardContent>
              <DescriptionIcon style={{ fontSize: 48, color: "#0f3165" }} />
              <Typography variant="h5" component="div" mt={2}>
                Templates
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/campaign" style={{ textDecoration: "none" }}>
          <Card>
            <CardContent>
              <CampaignIcon style={{ fontSize: 48, color: "#0f3165" }} />
              <Typography variant="h5" component="div" mt={2}>
                Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/sender" style={{ textDecoration: "none" }}>
          <Card>
            <CardContent>
              <EmailIcon style={{ fontSize: 48, color: "#0f3165" }} />
              <Typography variant="h5" component="div" mt={2}>
                Sender
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Grid>
    </Grid>
  );
};

export default DashboardComponent;
