import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
} from "@mui/material";
import styles from "./Sender.module.css";

const SenderForm = ({ open, onClose, onSave, sender, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.mail) {
      newErrors.mail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.mail)) {
      newErrors.mail = "Invalid email address";
    }

    if (!formData?.passKey) {
      newErrors.passKey = "Pass key is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
    setFormData({});
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
      setFormData({});
    }
  };

  useEffect(() => {
    setFormData(sender || { mail: "", passKey: "" });
  }, [sender]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{sender ? "Edit Sender" : "Add Sender"}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <InputLabel htmlFor="mail">Email</InputLabel>
          <TextField
            id="mail"
            name="mail"
            type="email"
            value={formData?.mail}
            onChange={(e) => handleChange("mail", e.target.value)}
            fullWidth
            variant="outlined"
            error={!!errors.mail}
            helperText={errors.mail}
            className={styles.email_input}
          />
        </Box>
        {!sender && (
          <Box mb={2}>
            <InputLabel htmlFor="passKey">Pass Key</InputLabel>
            <TextField
              id="passKey"
              name="passKey"
              value={formData?.passKey}
              onChange={(e) => handleChange("passKey", e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.passKey}
              helperText={errors.passKey}
              className={styles.email_input}
            />
          </Box>
        )}
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
          {sender ? (
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

export default SenderForm;
