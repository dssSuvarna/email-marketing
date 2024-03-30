import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Preview";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import styles from "./Campaigns.module.css";
import CampaignsForm from "./CampaignsForm";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import AlertSnackbar from "../../components/AlertSnackbar";

const CampaignsList = () => {
  const navigate = useNavigate();
  const [campaignsList, setCampaignsList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openCampaignForm, setOpenCampaignForm] = useState(false);
  const [selectedCampaignData, setSelectedCampaignData] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState({
    severity: "",
    message: "",
  });

  const formatDateString = (date) => {
    const formatDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return formatDate;
  }

  const navigateDetails = (id) => {
    navigate(`/campaign/${id}`);
  }

  const handleOpenForm = (campaign) => {
    setSelectedCampaignData(campaign);
    setOpenCampaignForm(true);
  };

  const handleCloseForm = () => {
    setSelectedCampaignData(null);
    setOpenCampaignForm(false);
  };

  const handleOpenConfirmation = (campaign) => {
    setSelectedCampaignData(campaign);
    setDeleteConfirmOpen(true);
  }

  const handleCloseConfirmation = () => {
    setSelectedCampaignData(null);
    setDeleteConfirmOpen(false);
  }

  const handleDeleteCampaign = async(campaignId) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/campaigns/${campaignId}`,
        {
          method: "DELETE",
          headers: {
            // "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Campaign deleted successfully");
        await handleGetAllCampaigns();
        showSnackbar({
          severity: "info",
          message: "Campaign deleted successfully",
        });
      } else {
        console.error("Failed to delete campaign");
        showSnackbar({
          severity: "error",
          message: "Failed to delete campaign",
        });
      }
    } catch (error) {
      console.log("Error", error);
      showSnackbar({
        severity: "error",
        message: "Failed to delete campaign",
      });
    }
  }

  const handleConfirmDeleteCampaign = () => {
    handleDeleteCampaign(selectedCampaignData.id);
    handleCloseConfirmation();
  }

  const handleGetAllCampaigns = async () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/campaigns`,
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
        setCampaignsList(data);
      } else {
        console.log("Role failed");
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReload = () => {
    handleGetAllCampaigns();
    handleCloseForm();
  }

  useEffect(() => {
    handleGetAllCampaigns();
  },[])

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
          onClick={() => handleOpenForm(null)}
        >
          Start Campaign
        </Button>
      </Box>
      <Box sx={{ margin: "10px 0" }}>
        <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>
          Campaigns List
        </Typography>
      </Box>
      <Paper sx={{ marginTop: "10px" }}>
        <TableContainer>
          <Table className={styles.campaigns_table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Schedule time</TableCell>
                <TableCell>End time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaignsList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((campaign, index) => (
                  <TableRow key={index}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.description}</TableCell>
                    <TableCell>
                      {formatDateString(campaign.schedule_time)}
                    </TableCell>
                    <TableCell>{formatDateString(campaign.end_time)}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="preview"
                        sx={{ width: "auto" }}
                        onClick={() => navigateDetails(campaign.id)}
                      >
                        <PreviewIcon sx={{ color: "#06284b" }} />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleOpenConfirmation(campaign)}
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
          count={campaignsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className={styles.pagination_icons}
        />
      </Paper>
      <CampaignsForm
        open={openCampaignForm}
        onClose={handleCloseForm}
        campaignListData={selectedCampaignData}
        onReload={handleReload}
      />
      <DeleteConfirmation
        data={"campaign"}
        open={deleteConfirmOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmDeleteCampaign}
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

export default CampaignsList;
