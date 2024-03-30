import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  InputLabel,
  DialogActions,
} from "@mui/material";
import styles from "./Users.module.css";
import AlertSnackbar from "../../components/AlertSnackbar";

const CreateUserForm = ({ open, onClose, onReload, userData }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "USER",
  });
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (formData) => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.username) {
      errors.username = "Username is required";
    }
    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    }
    if (!userData && !formData.password) {
      errors.password = "Password is required";
    } else if (!userData && !passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return errors;
  };

  const handleSubmit = () => {
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length === 0) {
      if (userData) {
        updateUser(formData);
      } else {
        createUser(formData);
      }
      setFormData({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "USER",
      });
      onClose();
    } else {
      setErrors(formErrors);
    }
  };

  const createUser = async (userData) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/auth/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("User created:", data);
        onReload();
        showSnackbar({
          severity: "success",
          message: "User created successfully",
        });
      } else {
        showSnackbar({
          severity: "error",
          message: "Failed to create user",
        });
        console.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar({
        severity: "error",
        message: "Failed to create user",
      });
    }
  };

  const updateUser = async (userData) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        onReload();
        showSnackbar({
          severity: "success",
          message: "User updated successfully",
        });
      } else {
        console.error("Failed to create user");
        showSnackbar({
          severity: "error",
          message: "Failed to update user",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar({
        severity: "error",
        message: "Failed to update user",
      });
    }
  };

  const showSnackbar = ({ severity, message }) => {
    setOpenSnackbar(true);
    setSnackbarConfig({ severity, message });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarConfig({ severity: "", message: "" });
  };

  useEffect(() => {
    setFormData([]);
    if (userData) {
      setFormData(userData);
      setErrors({})
    }
  }, [userData]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{userData ? "Update" : "Add"} User</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <InputLabel htmlFor="username">Username</InputLabel>
            <TextField
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className={styles.user_input}
              error={!!errors.username}
              helperText={errors.username}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="firstName">First Name</InputLabel>
            <TextField
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className={styles.user_input}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="lastName">Last Name</InputLabel>
            <TextField
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className={styles.user_input}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Box>
          {!userData && (
            <Box mb={2}>
              <InputLabel htmlFor="password">Password</InputLabel>
              <TextField
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className={styles.user_input}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Box>
          )}
          <DialogActions>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "50%",
                gap: "10px",
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={onClose}
                sx={{ width: "50%", color: "#0f3165", borderColor: "#0f3165" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ width: "50%", backgroundColor: "#0f3165" }}
              >
                Submit
              </Button>
            </Box>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </>
  );
};

export default CreateUserForm;
