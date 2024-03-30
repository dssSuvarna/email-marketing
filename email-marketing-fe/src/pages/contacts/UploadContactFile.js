import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import styles from "./Contacts.module.css";

const UploadContactFile = ({ open, onClose, onReload }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    file: "",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const validateForm = () => {
    const errors = {};
    let hasError = false;

    if (!file) {
      errors.file = "Please upload a csv file";
      hasError = true;
    }

    if (hasError) {
      setErrorMessages(errors);
    }
    return hasError;
  };

  const handleUploadContacts = async(formData) => {
    try {
        const token = localStorage.getItem("authToken");
        const url = `${process.env.REACT_APP_HOST_URL}/core/contacts/upload`;
        const requestOptions = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        };
        const response = await fetch(url, requestOptions);
        const data = await response;
        console.log(data);
        onReload();
    } catch (error) {
        console.log("Error:", error)
    }
  }

  const handleTextFieldClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = () => {
    if(!validateForm()) {
        const formData = new FormData();
        formData.append("file", file);
        handleUploadContacts(formData);
        setFile(null)
        setFileName("");
        setErrorMessages({file: ""})
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload File</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <InputLabel htmlFor="contact">Contacts file</InputLabel>
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <TextField
            fullWidth
            variant="outlined"
            value={fileName}
            error={!!errorMessages.file}
            helperText={errorMessages.file}
            onClick={handleTextFieldClick}
            className={styles.email_input}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    aria-label="upload file"
                    edge="end"
                  >
                    <AttachFileIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
    </Dialog>
  );
};

export default UploadContactFile;
