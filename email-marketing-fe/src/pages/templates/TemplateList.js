import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import TemplateForm from "./TemplateForm";
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteConfirmation from "../../components/DeleteConfirmation";
import AlertSnackbar from "../../components/AlertSnackbar";

const TemplatePage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const handleOpenDialog = (template) => {
    console.log(template);
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTemplate(null);
    setDialogOpen(false);
  };

  const handleOpenConfirm = () => {
    setDeleteConfirmationOpen(true);
  }

  const handleCloseConfirm = () => {
    setDeleteConfirmationOpen(false);
    setTemplateToDelete(null);
  }

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
        console.log(data);
        setTemplates(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleOnCreateTemplate = async (template) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/template/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(template),
        }
      );
        console.log(response)
      if (response) {
        // const data = await response.json();
        console.log("Template created:");
        await handleGetAllTemplates();
        showSnackbar({
          severity: "success",
          message: "Template created successfully",
        });
      } else {
        console.error("Failed to create template");
        showSnackbar({
          severity: "error",
          message: "Failed to create template",
        });
      }
    } catch (error) {
      console.log("Error", error);
      showSnackbar({
        severity: "error",
        message: "Failed to create template",
      });
    }
  };

  const handleUpdateTemplateData = async (template) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/template/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(template),
        }
      );

      if (response.ok) {
        console.log("Template updated:");
        await handleGetAllTemplates();
        showSnackbar({
          severity: "success",
          message: "Template updated successfully",
        });
      } else {
        console.error("Failed to update");
        showSnackbar({
          severity: "error",
          message: "Failed to update template",
        });
      }
    } catch (error) {
      console.error("Error Updating template:", error);
      showSnackbar({
        severity: "error",
        message: "Failed to update template",
      });
    }
  };

  const handleSaveTemplate = (template) => {
    handleOnCreateTemplate(template);
    handleCloseDialog();
  };

  const handleUpdateTemplate = (template) => {
    const updateData = {
      templateId: template.id,
      content: template.content,
    };
    handleUpdateTemplateData(updateData);
    handleCloseDialog();
  };

  const handleDeleteTemplate = (event, id) => {
    event.stopPropagation();
    handleOpenConfirm();
    setTemplateToDelete(id);
    console.log(id)
  }

  const handleConfirmDelete = async () => {
    const storedToken = localStorage.getItem("authToken");
    const response = await fetch(
      `${process.env.REACT_APP_HOST_URL}/core/template/delete/${templateToDelete}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    if (response.ok) {
      console.log("Template deleted successfully");
      await handleGetAllTemplates();
      showSnackbar({
        severity: "info",
        message: "Template deleted successfully",
      });
    } else {
      console.error("Failed to delete template");
      showSnackbar({
        severity: "error",
        message: "Failed to delete template",
      });
    }
  }

  const handleConfirmDeleteTemplate = () => {
    handleConfirmDelete();
    handleCloseConfirm();
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
  }, []);

  return (
    <Box>
      <Box
        sx={{ display: "flex", justifyContent: "end", marginBottom: "10px" }}
      >
        <Button
          sx={{ width: "auto", backgroundColor: "#0f3165" }}
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Create template
        </Button>
      </Box>
      <Typography variant="h4" align="center" gutterBottom>
        Templates
      </Typography>

      <Grid container spacing={2}>
        {templates &&
          templates.map((template, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                onClick={() => handleOpenDialog(template)}
                sx={{
                  backgroundColor: "#f0f0f0",
                  cursor: "pointer",
                  position: "relative",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <iframe
                    title="Template Content"
                    srcDoc={template.content}
                    style={{ width: "100%", height: "200px", border: "none" }}
                  ></iframe>
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => handleDeleteTemplate(e, template.id)}
                    color="error"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      justifyContent: "end",
                      width: "auto",
                      zIndex: 2,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      <TemplateForm
        open={isDialogOpen}
        onClose={handleCloseDialog}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onUpdate={handleUpdateTemplate}
      ></TemplateForm>

      <DeleteConfirmation
        open={deleteConfirmationOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDeleteTemplate}
        data={"template"}
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

export default TemplatePage;
