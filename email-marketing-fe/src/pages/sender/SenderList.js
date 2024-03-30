import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./Sender.module.css";
import SenderForm from "./SenderForm";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import AlertSnackbar from "../../components/AlertSnackbar";

const SenderList = () => {
  const [senderList, setSenderList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSender, setSelectedSender] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [senderId, setSenderId] = useState("")
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleOpenDialog = (sender) => {
    setSelectedSender(sender);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSender(null);
  }

  const handleOpenConfirm = (id) => {
    setDeleteConfirmationOpen(true);
    setSenderId(id);
  }

  const handleCloseConfirm = () => {
    setDeleteConfirmationOpen(false);
    setSenderId(null);
  }

  const handleConfirmDeleteSender = () => {
    handleDeleteSender(senderId);
    handleCloseConfirm();
  }

  const handleGetAllSenders = async () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/sender`,
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
        setSenderList(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSender = async (senderId) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/sender/delete/${senderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.ok) {
        await handleGetAllSenders();
        showSnackbar({
          severity: "info",
          message: "Sender deleted successfully",
        });
      } else {
        console.error("Failed to delete sender");
        showSnackbar({
          severity: "error",
          message: "Failed to delete sender",
        });
      }
    } catch (error) {
      console.log("Error", error);
      showSnackbar({
        severity: "error",
        message: "Failed to delete sender",
      });
    }
  }

  const handleUpdateSender = async(sender) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/sender/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(sender),
        }
      );

      if (response.ok) {
        await handleGetAllSenders();
        showSnackbar({
          severity: "success",
          message: "Sender updated successfully",
        });
      } else {
        console.error("Failed to update");
        showSnackbar({
          severity: "error",
          message: "Failed to update sender",
        });
      }
    } catch (error) {
      console.log("Error", error)
      showSnackbar({
        severity: "error",
        message: "Failed to update sender",
      });
    }
  }

  const handleDelete = (senderId) => {
    handleOpenConfirm(senderId);
  };

  const handleCreateSender = async (sender) => {
    try {
        const storedToken = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || 1;
        const senderData = {
          port: "25",
          host: "smtp.gmail.com",
          signatures: [],
          mail: sender.mail,
          passKey: sender.passKey,
          userId,
        };
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}/core/sender/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify(senderData),
          }
        );

        if (response.ok) {
          
          await handleGetAllSenders();
          showSnackbar({
            severity: "success",
            message: "Sender created successfully",
          });
        } else {
          console.error("Failed to create user");
          showSnackbar({
            severity: "error",
            message: "Failed to create sender",
          });
        }
    } catch (error) {
        console.log("Error", error)
        showSnackbar({
          severity: "error",
          message: "Failed to create sender",
        });
    }
  }

  const handleUpdate = (sender) => {
    const data = {
      senderId: sender.senderId,
      mail: sender.mail
    }
    handleUpdateSender(data);
  }

  const showSnackbar = ({ severity, message }) => {
    setOpenSnackbar(true);
    setSnackbarConfig({ severity, message });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarConfig({ severity: "", message: "" });
  };

  useEffect(() => {
    handleGetAllSenders();
  }, []);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "auto", backgroundColor: "#0f3165" }}
          onClick={() => handleOpenDialog(null)}
        >
          Add sender
        </Button>
      </Box>
      <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>
        Senders List
      </Typography>
      <Paper sx={{ marginTop: "10px" }}>
        <TableContainer>
          <Table className={styles.senders_table}>
            <TableHead>
              <TableRow>
                <TableCell>Host</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senderList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((sender) => (
                  <TableRow key={sender.senderId}>
                    <TableCell>{sender.host}</TableCell>
                    <TableCell>{sender.mail}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleOpenDialog(sender)}
                        sx={{ width: "auto" }}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(sender.senderId)}
                        sx={{ width: "auto" }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={senderList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className={styles.pagination_icons}
        />
      </Paper>
      <SenderForm
        open={isDialogOpen}
        onClose={handleCloseDialog}
        sender={selectedSender}
        onSave={handleCreateSender}
        onUpdate={handleUpdate}
      ></SenderForm>
      <DeleteConfirmation
        open={deleteConfirmationOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDeleteSender}
        data={"sender"}
      ></DeleteConfirmation>
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </Box>
  );
};

export default SenderList;
