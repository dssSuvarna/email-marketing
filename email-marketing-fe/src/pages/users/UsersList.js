import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Paper,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TablePagination,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CreateUserForm from "./CreateUserForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./Users.module.css";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import AlertSnackbar from "../../components/AlertSnackbar";

const UsersList = () => {
  const [openUserForm, setOpenUserForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [activationConfirmation, setActivationConfirmation] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleAddUser = (user) => {
    setSelectedUser(user);
    setOpenUserForm(true);
  };

  const handleCloseUserForm = () => {
    setSelectedUser(null);
    setOpenUserForm(false);
  };

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    if (user.status === "ACTIVE") {
      setActivationConfirmation(
        "Are you sure you want to deactivate this user?"
      );
    } else {
      setActivationConfirmation("Are you sure you want to activate this user?");
    }
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedUser(null);
  };

  const handleChangeStatus = async (status, userId) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/user/update-status/${userId}?status=${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
            body: {},
          },
        }
      );

      if (response.ok) {
        console.log("User updated successfully");
        handleGetAllUsers();
        showSnackbar({
          severity: "success",
          message: "User status updated successfully",
        });
      } else {
        console.error("Failed to update user");
        showSnackbar({
          severity: "error",
          message: "Failed to update user status",
        });
      }
    } catch (error) {
      console.log("Error", error);
      showSnackbar({
        severity: "error",
        message: "Failed to update user status",
      });
    }
  };

  const handleConfirmChangeStatus = () => {
    let userStatus;
    if (selectedUser.status === "ACTIVE") {
      userStatus = "DEACTIVE";
    } else {
      userStatus = "ACTIVE";
    }
    handleChangeStatus(userStatus, selectedUser.id);
    handleCloseStatusDialog();
  };

  const handleDeleteUser = async (userId) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("User deleted successfully");
        handleGetAllUsers();
        showSnackbar({
          severity: "info",
          message: "User deleted successfully",
        });
      } else {
        console.error("Failed to delete user");
        showSnackbar({
          severity: "error",
          message: "Failed to delete user",
        });
      }
    } catch (error) {
      console.log("Error", error);
      showSnackbar({
        severity: "error",
        message: "Failed to delete user",
      });
    }
  };

  const handleOpenConfirm = (user) => {
    setSelectedUser(user);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setSelectedUser(null);
    setOpenConfirm(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteUser(selectedUser.id);
    handleCloseConfirm();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGetAllUsers = async () => {
    const storedToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/user`,
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
        console.log(data);
        setUsers(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return styles.active_status;
      case "DEACTIVE":
        return styles.inactive_status;
      default:
        return styles.default_status;
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

  const handleReload = () => {
    handleGetAllUsers();
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          marginBottom: "10px",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddUser(null)}
          sx={{ width: "auto", backgroundColor: "#0f3165" }}
        >
          Add User
        </Button>
      </Box>
      <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>
        Users List
      </Typography>

      <CreateUserForm
        open={openUserForm}
        onClose={handleCloseUserForm}
        onReload={handleReload}
        userData={selectedUser}
      />

      <Paper sx={{ marginTop: "10px" }}>
        <TableContainer>
          <Table
            stickyHeader
            aria-label="sticky table"
            className={styles.users_table}
          >
            <TableHead>
              <TableRow>
                <TableCell width={"25%"}>Name</TableCell>
                <TableCell width={"25%"}>Username</TableCell>
                <TableCell width={"25%"}>Status</TableCell>
                <TableCell width={"25%"}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? users.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : users
              ).map((user, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <span className={getStatusClass(user.status)}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Status" arrow>
                      <Switch
                        checked={user.status === "ACTIVE"}
                        onChange={() => handleToggleStatus(user)}
                        inputProps={{ "aria-label": "user status" }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        onClick={() => handleAddUser(user)}
                        sx={{ width: "auto" }}
                        variant="contained"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        sx={{ width: "auto" }}
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenConfirm(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className={styles.pagination_icons}
        />
      </Paper>
      <DeleteConfirmation
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        data={"user"}
      />
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>{activationConfirmation}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseStatusDialog}
            color="primary"
            variant="outlined"
            sx={{ width: "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmChangeStatus}
            color="primary"
            variant="contained"
            sx={{ width: "auto" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </Box>
  );
};

export default UsersList;
