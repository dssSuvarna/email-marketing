import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import HtmlFileUploader from "./HtmlFileUploader";
import styles from "./Template.module.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const TemplateForm = ({ open, onClose, template, onSave, onUpdate }) => {
  const [formData, setFormData] = useState({ name: "", content: "" });
  const [errors, setErrors] = useState({});
  const [fileContent, setFileContent] = useState("");
  const [index, setIndex] = React.useState("0");

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
  };

  const handleHtmlContentChange = (content) => {
    setFormData((prevData) => ({ ...prevData, content }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name) {
      newErrors.name = "Name is required";
    }

    if (!formData?.content) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setFormData(template || { name: "", content: "" });
  }, [template]);

  const handleSubmitForm = () => {
    console.log(formData);
    if (validateForm()) {
      if (template) {
        handleUpdate();
      } else {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    setFormData({ name: "", content: "" });
    setFileContent("");
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
    setFormData({ name: "", content: "" });
    setFileContent("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{template ? "Edit Template" : "Add Template"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmitForm}>
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
              disabled={template}
              className={styles.template_input}
            />
          </Box>
          <Box mb={2}>
            <TabContext value={index.toString()}>
              <Tabs
                value={index}
                aria-label="Segmented Tabs"
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={(event, value) => setIndex(value)}
              >
                <TabList
                  disableUnderline
                  variant="plain"
                  className={styles.tab_list}
                >
                  <Tab
                    label="Upload file"
                    value="0"
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#393943",
                        borderRadius: "25px",
                        margin: "5px",
                        color: "#fff",
                      },
                    }}
                  />
                  <Tab
                    label="Enter text"
                    value="1"
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#393943",
                        borderRadius: "25px",
                        margin: "5px",
                        color: "#fff",
                      },
                    }}
                  />
                </TabList>
              </Tabs>
              <TabPanel value="0" sx={{ padding: "0", marginTop: "8px" }}>
                <HtmlFileUploader
                  htmlFileContent={handleHtmlContentChange}
                  template={template?.content}
                />
              </TabPanel>
              <TabPanel value="1" sx={{ padding: "0", marginTop: "8px" }}>
                <Box mb={2}>
                  <InputLabel htmlFor="content">Content</InputLabel>
                  <TextField
                    id="content"
                    name="content"
                    multiline
                    fullWidth
                    rows={5}
                    value={formData?.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    variant="outlined"
                    error={!!errors.content}
                    helperText={errors.content}
                  />
                </Box>
              </TabPanel>
            </TabContext>
          </Box>
        </form>
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
          {template ? (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitForm}
              sx={{ backgroundColor: "#0f3165" }}
            >
              Update
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitForm}
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

export default TemplateForm;
