import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Divider,
  Grid,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "./Campaigns.module.css";

const CampaignDetails = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [campaignData, setCampaignData] = useState(null);

  const handleGetCampaignDetails = async () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/core/campaigns/${campaignId}`,
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
        setCampaignData(data);
      } else {
        console.log("Role failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    handleGetCampaignDetails();
  }, [campaignId]);

  const formatDateString = (date) => {
    const formatDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return formatDate;
  };

  const navigateBack = () => {
    navigate(-1);
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
      <Box>
        <IconButton
          sx={{ width: "auto", border: "1px solid" }}
          onClick={navigateBack}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Paper elevation={3} sx={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          {campaignData?.name}
        </Typography>
        <Divider sx={{ marginBottom: "15px" }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={"600"}>
              Description:
            </Typography>
            <Typography>{campaignData?.description}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={"600"}>
              Schedule Time:
            </Typography>
            <Typography>
              {formatDateString(campaignData?.schedule_time)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={"600"}>
              End Time:
            </Typography>
            <Typography>{formatDateString(campaignData?.end_time)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={"600"}>
              Sender:
            </Typography>
            <div>
              <Typography variant="subtitle1">
                Host: {campaignData?.sender.host}
              </Typography>
              <Typography>Mail: {campaignData?.sender.mail}</Typography>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={"600"}>
              Contacts:
            </Typography>
            <Paper>
              <TableContainer>
                <Table className={styles.campaign_table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Group</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaignData?.contacts &&
                      (rowsPerPage > 0
                        ? campaignData?.contacts.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                        : campaignData?.contacts
                      ).map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.company}</TableCell>
                          <TableCell>{contact.group}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={campaignData?.contacts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={"600"}>
              Template:
            </Typography>
            <div>
              <iframe
                title="HTML Preview"
                srcDoc={campaignData?.template.content}
                style={{
                  width: "100%",
                  minHeight: "40vh",
                  border: "1px solid #ccc",
                  marginTop: "8px",
                }}
              ></iframe>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CampaignDetails;
