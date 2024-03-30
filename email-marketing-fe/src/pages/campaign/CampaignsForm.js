import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import styles from "./Campaigns.module.css";
import AlertSnackbar from "../../components/AlertSnackbar";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const CampaignsForm = ({ open, onClose, campaignListData, onReload }) => {
  // const [formData, setFormData] = useState(null);
  const [fileName, setFileName] = useState("");

  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    scheduleTime: "",
    endTime: "",
    templateIds: "",
    senders: "",
    groupNames: null,
  });
  const [file, setFile] = useState(null);
  const [errorMessages, setErrorMessages] = useState({
    name: "",
    description: "",
    scheduleTime: "",
    endTime: "",
    templateIds: "",
    senders: "",
    file: "",
    groupNames: "",
  });
  const [templateLists, setTemplateLists] = useState([]);
  const [senderLists, setSenderLists] = useState([]);
  const [existingContacts, setExistingContacts] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setErrorMessages({
      name: "",
      description: "",
      scheduleTime: "",
      endTime: "",
      templateIds: "",
      senders: "",
      file: "",
      groupNames: "",
    });
    setCampaignData({ ...campaignData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleGroupNameChange = (value) => {
    setCampaignData((prevCampaignData) => ({
      ...prevCampaignData,
      groupNames: value,
    }));
  }

  const handleSelectSender = (event) => {
    setCampaignData((prevCampaignData) => ({
      ...prevCampaignData,
      senders: event.target.value,
    }));
  }

  const handleSelectTemplate = (event) => {
    setCampaignData((prevCampaignData) => ({
      ...prevCampaignData,
      templateIds: event.target.value,
    }));
  }

  const validateForm = () => {
    const errors = {};
    let hasError = false;
    const today = new Date().toISOString().split("T")[0];
    for (const key in campaignData) {
      if (!campaignData[key] && key !== "groupNames") {
        errors[key] = "This field is required";
        hasError = true;
      }

      if (!campaignData.groupNames && !file) {
        errors["groupNames"] = "Select any contact";
        errors.file = "Please upload a file";
        hasError = true;
      } else if (
        (!campaignData.groupNames && file) ||
        (campaignData.groupNames && !file)
      ) {
        hasError = false;
      }
    }

    if (
      campaignData.endTime < today ||
      campaignData.endTime < campaignData.scheduleTime
    ) {
      errors.endTime =
        "End time should be greater than or equal to today and schedule time";
      hasError = true;
    }

    // if (!file && !campaignData.groupNames.length) {
    //   errors.file = "Please upload a file";
    //   hasError = true;
    // }

    if (hasError) {
      setErrorMessages(errors);
    }
    return hasError;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      campaignData.templateIds = [campaignData.templateIds];
      campaignData.senders = [campaignData.senders];
      campaignData.scheduleTime = campaignData.scheduleTime + "T00:00:00"
      campaignData.endTime = campaignData.endTime + "T23:59:00"
      try {
        const formData = new FormData();
        formData.append("createCampaignRequest", JSON.stringify(campaignData));
        if(file) {
          formData.append("file", file);
        } else {
          const emptyBlob = new Blob([], { type: "application/octet-stream" });
          const emptyFile = new File([emptyBlob], "empty.txt", {
            type: "text/plain",
          });
          formData.append("file", emptyFile);
        }
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}/core/campaigns`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        if(response.ok) {
          const data = await response;
          console.log(data);
          onReload();
          showSnackbar({
            severity: "success",
            message: "Campaign started successfully",
          });
          setCampaignData({
            name: "",
            description: "",
            scheduleTime: "",
            endTime: "",
            templateIds: "",
            senders: "",
            groupNames: null,
          });
          setErrorMessages({
            name: "",
            description: "",
            scheduleTime: "",
            endTime: "",
            templateIds: "",
            senders: "",
            file: "",
            groupNames: "",
          });
          setFile(null)
          setFileName("")
        } else {
          showSnackbar({
            severity: "error",
            message: "Failed to create campaign",
          });
        }
      } catch (error) {
        console.log("Error", error)
        showSnackbar({
          severity: "error",
          message: "Failed to create campaign",
        });
      }
    }
  };

  const handleTextFieldClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleGetAllTemplates = async () => {
    const storedToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/template`,
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
        console.log("data", data);
        setTemplateLists(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleGetAllSendersList = async () => {
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
        setSenderLists(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleGetAllExistingContacts = async () => {
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
        setExistingContacts(data);
      }
    } catch (error) {
      console.error("Error:", error);
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

  useEffect(() => {
    handleGetAllTemplates();
    handleGetAllSendersList();
    handleGetAllExistingContacts();
  }, [campaignListData]);
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {campaignListData ? "Update" : "Start"} Campaign
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <InputLabel htmlFor="name">Campaign Name</InputLabel>
            <TextField
              name="name"
              id="name"
              fullWidth
              variant="outlined"
              value={campaignData.name}
              onChange={handleInputChange}
              error={!!errorMessages.name}
              helperText={errorMessages.name}
              className={styles.campaign_input}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="description">Description</InputLabel>
            <TextField
              name="description"
              id="description"
              fullWidth
              variant="outlined"
              value={campaignData.description}
              onChange={handleInputChange}
              error={!!errorMessages.description}
              helperText={errorMessages.description}
              className={styles.campaign_input}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="scheduleTime">Schedule Time</InputLabel>
            <TextField
              name="scheduleTime"
              id="scheduleTime"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={campaignData.scheduleTime}
              onChange={handleInputChange}
              error={!!errorMessages.scheduleTime}
              helperText={errorMessages.scheduleTime}
              className={styles.campaign_date}
              inputProps={{ max: campaignData.endTime }}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="endTime">End Time</InputLabel>
            <TextField
              name="endTime"
              id="endTime"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={campaignData.endTime}
              onChange={handleInputChange}
              error={!!errorMessages.endTime}
              helperText={errorMessages.endTime}
              className={styles.campaign_date}
              inputProps={{ min: campaignData.scheduleTime }}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="templateIds">Template IDs</InputLabel>
            <Select
              name="templateIds"
              id="templateIds"
              value={campaignData.templateIds}
              onChange={(e) => handleSelectTemplate(e)}
              fullWidth
              variant="outlined"
              error={!!errorMessages.templateIds}
              className={styles.select_input}
            >
              {templateLists &&
                templateLists.map((template, index) => (
                  <MenuItem value={template.id} key={index}>
                    {template.name}
                  </MenuItem>
                ))}
            </Select>
            {errorMessages.templateIds && (
              <Typography
                color="error"
                sx={{ fontSize: "0.75rem", margin: "3px 14px 0 14px" }}
              >
                {errorMessages.templateIds}
              </Typography>
            )}
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="senders">Senders</InputLabel>
            <Select
              name="senders"
              id="senders"
              value={campaignData.senders}
              onChange={(e) => handleSelectSender(e)}
              fullWidth
              variant="outlined"
              error={!!errorMessages.senders}
              className={styles.select_input}
            >
              {senderLists &&
                senderLists.map((sender, index) => (
                  <MenuItem value={sender.senderId} key={index}>
                    {sender.mail}
                  </MenuItem>
                ))}
            </Select>
            {errorMessages.senders && (
              <Typography
                color="error"
                sx={{ fontSize: "0.75rem", margin: "3px 14px 0 14px" }}
              >
                {errorMessages.senders}
              </Typography>
            )}
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="existing_contacts">
              Existing contacts
            </InputLabel>
            <Autocomplete
              multiple
              name="groupNames"
              id="existing_contacts"
              options={existingContacts}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select contact groups"
                  error={!!errorMessages.groupNames}
                  helperText={errorMessages.groupNames}
                />
              )}
              onChange={(e, value) => handleGroupNameChange(value)}
              className={styles.campaign_select_group}
            />
          </Box>
          <Box mb={2}>
            <InputLabel htmlFor="contact">New contacts</InputLabel>
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
              className={styles.campaign_input}
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
      <AlertSnackbar
        isOpen={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
      ></AlertSnackbar>
    </>
  );
};

export default CampaignsForm;
