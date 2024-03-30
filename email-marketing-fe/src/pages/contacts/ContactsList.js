import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import ContactFormDialog from "./ContactForm";
import styles from "./Contacts.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import UploadContactFile from "./UploadContactFile";
import AlertSnackbar from "../../components/AlertSnackbar";

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [openUploadFile, setOpenUploadFile] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });
  const [groups, setGroups] = useState(null);
  const [groupName, setGroupName] = useState("all");

  const handleOpenUpload = () => {
    setOpenUploadFile(true);
  }

  const handleCloseUpload = () => {
    setOpenUploadFile(false);
  }

  const handleOpenDialog = (contact) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedContact(null);
    setDialogOpen(false);
  };

  const handleOpenConfirm = (contact) => {
    setSelectedContact(contact)
    setOpenConfirm(true)
  }

  const handleCloseConfirm = () => {
    setSelectedContact(null);
    setOpenConfirm(false);
  }

  const handleDeleteContact = async(contactId) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts/${contactId}`,
        {
          method: "DELETE",
          headers: {
            // "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Template deleted successfully");
        await handleGetAllContacts();
        showSnackbar({
          severity: "info",
          message: "Contact deleted successfully",
        });
      } else {
        console.error("Failed to delete template");
        showSnackbar({
          severity: "error",
          message: "Failed to delete contact",
        });
      }
    } catch (error) {
      console.log("Error", error)
      showSnackbar({
        severity: "error",
        message: "Failed to delete contact",
      });
    }
  }

  const handleConfirmDelete = () => {
    handleDeleteContact(selectedContact.id);
    handleCloseConfirm();
  }

  const handleGetAllContacts = async () => {
    const storedToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts`,
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
        setContacts(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGetAllGroups = async () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts/groups`,
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
        setGroups(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleGetContactsByGroups = async(name) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts/group/${name}`,
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
        setContacts(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    handleGetAllContacts();
    handleGetAllGroups();
  }, []);

  const handleCreateContact = async (contactData) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(contactData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("User created:", data);
        handleGetAllContacts();
        showSnackbar({
          severity: "success",
          message: "Contacts created successfully",
        });
      } else {
        console.error("Failed to create user");
        showSnackbar({
          severity: "error",
          message: "Failed to create contact",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar({
        severity: "error",
        message: "Failed to create contact",
      });
    }
  };

  const handleUpdateContactData = async (contactData) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/contacts/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(contactData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Contact updated:", data);
        handleGetAllContacts();
        showSnackbar({
          severity: "success",
          message: "Contacts updated successfully",
        });
      } else {
        console.error("Failed to update");
        showSnackbar({
          severity: "error",
          message: "Failed to update contact",
        });
      }
    } catch (error) {
      console.error("Error Updating contact:", error);
      showSnackbar({
        severity: "error",
        message: "Failed to update contact",
      });
    }
  };

  const handleUpdateContact = (contact) => {
    const updateData = {
      contactId: contact.id,
      name: contact.name,
      email: contact.email,
    };
    handleUpdateContactData(updateData);
    handleCloseDialog();
  };

  const handleSaveContact = (contact) => {
    console.log(contact);
    handleCreateContact(contact);
    handleCloseDialog();
  };

  const handleReload = () => {
    handleGetAllContacts();
    handleCloseUpload();
    showSnackbar({
      severity: "success",
      message: "Contacts created successfully",
    });
  }

  const handleGroupSelect = (e) => {
    setGroupName(e.target.value);
    if(e.target.value === "all") {
      handleGetAllContacts();
    } else {
      handleGetContactsByGroups(e.target.value);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: "#0f3165" }}
          onClick={handleOpenUpload}
        >
          Upload file
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ width: "auto", backgroundColor: "#0f3165", marginLeft: "5px" }}
        >
          Add Contact
        </Button>
      </Box>

      <Box sx={{ marginTop: "10px", display:"flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
        <Typography fontSize={"20px"} fontWeight={"600"}>
          Contacts
        </Typography>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          Filter by groups :
          <Box sx={{ minWidth: 250, marginLeft: "10px" }}>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={groupName}
                onChange={handleGroupSelect}
              >
                <MenuItem value={"all"}>All Groups</MenuItem>
                {groups &&
                  groups.map((group, index) => (
                    <MenuItem value={group} key={index}>
                      {group}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
      </Box>

      <Paper sx={{ marginTop: "10px" }}>
        <TableContainer>
          <Table
            stickyHeader
            aria-label="sticky table"
            className={styles.contacts_table}
          >
            <TableHead>
              <TableRow>
                <TableCell width={"25%"}>Name</TableCell>
                <TableCell width={"25%"}>Email</TableCell>
                <TableCell width={"25%"}>Company</TableCell>
                <TableCell width={"25%"}>Group</TableCell>
                <TableCell width={"25%"}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? contacts.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : contacts
              ).map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.group}</TableCell>
                  <TableCell>
                    <IconButton
                      sx={{ width: "auto" }}
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenConfirm(contact)}
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
          count={contacts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className={styles.pagination_icons}
        />
      </Paper>
      <ContactFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveContact}
        contact={selectedContact}
        onUpdate={handleUpdateContact}
      />
      <DeleteConfirmation
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        data={"contact"}
      />
      <UploadContactFile
        open={openUploadFile}
        onClose={handleCloseUpload}
        onReload={handleReload}
      ></UploadContactFile>
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </Box>
  );
};

export default ContactsList;
