import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { AttachFile } from "@mui/icons-material";
import styles from "./Template.module.css"

const HtmlFileUploader = ({ htmlFileContent, template }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [editedHtmlContent, setEditedHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditHtmlContent, setIsEditHtmlContent] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      setHtmlContent(fileContent);
      setEditedHtmlContent(fileContent);
      htmlFileContent(fileContent);
    };
    reader.readAsText(file);
  };

  const handleHtmlChange = (e) => {
    console.log(e.target.value)
    setIsEditHtmlContent(true);
    setEditedHtmlContent(e.target.value);
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleSaveChanges = () => {
    setHtmlContent(editedHtmlContent);
    htmlFileContent(editedHtmlContent);
  };

  const handleClickFile = () => {
    document.getElementById("content").click();
  }

  useEffect(()=>{
    setHtmlContent(template)
    setEditedHtmlContent(template)
  },[template])

  return (
    <Box>
      <InputLabel htmlFor="content">Content</InputLabel>
      <input
        id="content"
        type="file"
        accept=".html"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <TextField
        // disabled
        fullWidth
        variant="outlined"
        value={fileName}
        className={styles.template_input}
        onClick={handleClickFile}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                component="label"
                htmlFor="content"
                color="primary"
                aria-label="upload file"
                edge="end"
              >
                <AttachFile />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {htmlContent && (
        <Box mt={1}>
          <textarea
            value={editedHtmlContent}
            onChange={handleHtmlChange}
            style={{ width: "100%", minHeight: "200px" }}
            // readOnly={!isEditHtmlContent}
          />
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              sx={{ width: "auto", backgroundColor: "#0f3165" }}
              disabled={!isEditHtmlContent}
            >
              Save Changes
            </Button>
            <Button
              variant="contained"
              onClick={handlePreview}
              sx={{ ml: 1, width: "auto", backgroundColor: "#0f3165" }}
            >
              {showPreview ? "Hide" : "Preview"}
            </Button>
          </Box>
          {showPreview && (
            <iframe
              title="HTML Preview"
              srcDoc={htmlContent}
              style={{
                width: "100%",
                minHeight: "200px",
                border: "1px solid #ccc",
                marginTop: "8px",
              }}
            ></iframe>
          )}
        </Box>
      )}
    </Box>
  );
};

export default HtmlFileUploader;
