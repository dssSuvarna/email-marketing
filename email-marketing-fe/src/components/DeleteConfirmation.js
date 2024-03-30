import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

const DeleteConfirmation = ({ open, onClose, onConfirm, data }) => {
  const handleCloseDialog = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this {data}?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} sx={{width: "auto"}}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained" sx={{ width: "auto"}}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmation;
