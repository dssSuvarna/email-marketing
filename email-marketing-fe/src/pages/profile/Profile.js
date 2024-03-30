import React, { useEffect, useState } from "react";
import { Box, Button, Grid, InputLabel, Paper, TextField, Typography } from "@mui/material";
import styles from "./Profile.module.css"
import AlertSnackbar from "../../components/AlertSnackbar";

const Profile = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userDetails, setUserDetails] = useState(null);
   const [passwordMatch, setPasswordMatch] = useState(true);
  const [isEditUser, setIsEditUser] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [errors, setErrors] = useState({})
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleChangeNewPassword = (event) => {
    setIsChangePassword(true)
    setNewPassword(event.target.value);
    setPasswordMatch(event.target.value === confirmPassword);
  };

  const handleChangeConfirmPassword = (event) => {
    setConfirmPassword(event.target.value);
    setPasswordMatch(event.target.value === newPassword);
  };

  const handleInputChange = (event) => {
    setIsEditUser(true);
    const { name, value } = event.target;
    setUserDetails((prevUserDetails) => ({
      ...prevUserDetails,
      [name]: value,
    }));
  };

  const handleGetUserDetails = async () => {
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
        setUserDetails(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateUserDetails = async(userData) => {
    try {
        const storedToken = localStorage.getItem("authToken");
        const userRole = localStorage.getItem("userRole");
        let url;
        if(userRole === "ADMIN") {
            url = `${process.env.REACT_APP_HOST_URL}/auth/update-admin`;
        } else {
            url = `${process.env.REACT_APP_HOST_URL}/core/user/update`;
        }
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(userData),
        });
        if(response.ok) {
            handleGetUserDetails();
            setIsEditUser(false);
            showSnackbar({
              severity: "success",
              message: "User details updated successfully",
            });
        } else {
          showSnackbar({
            severity: "error",
            message: "Failed to update the user details",
          });
        }
    } catch (error) {
        console.error("Error:", error);
        showSnackbar({
          severity: "error",
          message: "Failed to update the user details",
        });
    }
  }

  const handleResetPassword = async (passwords) => {
    try {
        const storedToken = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}/auth/reset-password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify(passwords),
          }
        );

        if (response.ok) {
            console.log("Password updated successfully")
            setIsChangePassword(false)
            showSnackbar({
              severity: "success",
              message: "Password updated successfully",
            });
        } else {
          console.error("Failed to create user");
          showSnackbar({
            severity: "error",
            message: "Failed to reset the password",
          });
        }
    } catch (error) {
        console.error("Error:", error);
        showSnackbar({
          severity: "error",
          message: "Failed to reset the password",
        });
    }
  }

  useEffect(() => {
    handleGetUserDetails();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!userDetails?.username) {
      newErrors.username = "Username is required";
    }

    if (!userDetails?.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!userDetails?.lastName) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validatePassword = () => {
    if (!newPassword || !confirmPassword) {
      return false;
    }
   const regex =
     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   const isPasswordValid = regex.test(newPassword);

   if (!isPasswordValid) {
     return false;
   }

    if (!passwordMatch) {
      return false;
    }
    return true;
  };

  const handleUserUpdate = (event) => {
    event.preventDefault();
    const userData = {
        id: userDetails.id,
        username: userDetails.username,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
    }
    if(validateForm()) {
        handleUpdateUserDetails(userData);
        setErrors({})
    }
  }

  const showSnackbar = ({ severity, message }) => {
    setOpenSnackbar(true);
    setSnackbarConfig({ severity, message });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarConfig({ severity: "", message: "" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validatePassword()) {
      return;
    }
    console.log("New Password:", newPassword);
    const passwords = {
      newPassword,
      confirmPassword,
    };
    handleResetPassword(passwords);
    setNewPassword("");
    setConfirmPassword("");
  };
  return (
    <Box>
      <Typography fontSize={"20px"} fontWeight={"600"} marginBottom={"10px"}>
        Profile
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: "10px" }}>
            <form onSubmit={handleUserUpdate}>
              <Box mb={2}>
                <InputLabel htmlFor="firstName">First Name</InputLabel>
                <TextField
                  id="firstName"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="firstName"
                  value={userDetails?.firstName}
                  onChange={handleInputChange}
                  className={styles.profile_input}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Box>
              <Box mb={2}>
                <InputLabel htmlFor="lastName">Last Name</InputLabel>
                <TextField
                  id="lastName"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="lastName"
                  value={userDetails?.lastName}
                  onChange={handleInputChange}
                  className={styles.profile_input}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Box>
              <Box mb={2}>
                <InputLabel htmlFor="username">Username</InputLabel>
                <TextField
                  id="username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="username"
                  value={userDetails?.username}
                  onChange={handleInputChange}
                  className={styles.profile_input}
                  error={!!errors.username}
                  helperText={errors.username}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={styles.button_clr}
                  disabled={!isEditUser}
                >
                  Update
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: "10px" }}>
            <form onSubmit={handleSubmit}>
              <Box mb={2}>
                <InputLabel htmlFor="newPassword">New Password</InputLabel>
                <TextField
                  id="newPassword"
                  variant="outlined"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={handleChangeNewPassword}
                  className={styles.profile_input}
                  placeholder="Enter new password"
                  error={isChangePassword && !validateNewPassword(newPassword)}
                  helperText={
                    isChangePassword &&
                    !validateNewPassword(newPassword) &&
                    "Password must contain at least one capital letter, one special character, one number, and one lowercase letter"
                  }
                />
              </Box>
              <Box mb={2}>
                <InputLabel htmlFor="confirmPassword">
                  Confirm Password
                </InputLabel>
                <TextField
                  id="confirmPassword"
                  variant="outlined"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={confirmPassword}
                  onChange={handleChangeConfirmPassword}
                  className={styles.profile_input}
                  error={!passwordMatch}
                  helperText={!passwordMatch && "Passwords do not match"}
                  placeholder="Confirm new password"
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={styles.button_clr}
                  disabled={!newPassword || !confirmPassword}
                >
                  Update Password
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </Box>
  );
};

export default Profile;
