import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputLabel,
} from "@mui/material";
import styles from "./Contacts.module.css";

const ContactForm = ({ open, onClose, onSave, contact, onUpdate }) => {
  const [formData, setFormData] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name) {
      newErrors.name = "Name is required";
    }

    if (!formData?.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData?.company) {
      newErrors.company = "Company is required";
    }

    if (!formData?.group) {
      newErrors.group = "Group is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
      setFormData([]);
      setErrors({});
    }
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
    setFormData([]);
    setErrors({});
  };

  useEffect(() => {
    console.log(contact);
    setFormData(contact);
  }, [contact]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <InputLabel htmlFor="name">Name</InputLabel>
          <TextField
            id="name"
            name="name"
            value={formData?.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
            variant="outlined"
            error={!!errors.name}
            helperText={errors.name}
            className={styles.email_input}
          />
        </Box>
        <Box mb={2}>
          <InputLabel htmlFor="email">Email</InputLabel>
          <TextField
            id="email"
            name="email"
            type="email"
            value={formData?.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email}
            className={styles.email_input}
          />
        </Box>
        {!contact && (
          <Box mb={2}>
            <InputLabel htmlFor="company">Company</InputLabel>
            <TextField
              id="company"
              name="company"
              value={formData?.company}
              onChange={(e) => handleChange("company", e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.company}
              helperText={errors.company}
              className={styles.email_input}
            />
          </Box>
        )}
        <Box mb={2}>
          <InputLabel htmlFor="group">Group name</InputLabel>
          <TextField
            id="group"
            name="group"
            value={formData?.group}
            onChange={(e) => handleChange("group", e.target.value)}
            fullWidth
            variant="outlined"
            error={!!errors.group}
            helperText={errors.group}
            className={styles.email_input}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "50%",
            gap: "10px",
          }}
        >
          {contact ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              sx={{ backgroundColor: "#0f3165" }}
            >
              Update
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ backgroundColor: "#0f3165" }}
            >
              Save
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={onClose}
            sx={{ color: "#0f3165", borderColor: "#0f3165" }}
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ContactForm;
