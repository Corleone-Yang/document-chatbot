import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";
import { FileText, Settings, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SettingsDialog = ({
  initialNumChunks,
  uploadedDocument,
  isRAGEnabled,
  onNumChunksChange,
  onDocumentUpload,
  onRemoveDocument,
  onRAGToggle,
}) => {
  const [open, setOpen] = useState(false);
  const [numChunks, setNumChunks] = useState(initialNumChunks);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      onNumChunksChange(numChunks);
      // Send the updated numChunks to the backend
      axios
        .patch("/api/chat", { numChunks })
        .then((response) => {
          console.log("Number of chunks updated successfully");
        })
        .catch((error) => {
          console.error("Error updating number of chunks:", error);
        });
    }
  }, [open, numChunks, onNumChunksChange]);

  const handleOpenSettings = () => setOpen(true);
  const handleCloseSettings = () => setOpen(false);
  const handleDocumentUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input ref is not available");
    }
  };

  const handleRAGToggle = (event) => {
    const newRAGState = event.target.checked;
    onRAGToggle(newRAGState);

    // Send the updated RAG state to the backend
    axios
      .put("/api/chat", {
        isRAGEnabled: newRAGState,
        fileName: uploadedDocument ? uploadedDocument.name : null,
      })
      .then((response) => {
        console.log("RAG state updated successfully");
      })
      .catch((error) => {
        console.error("Error updating RAG state:", error);
      });
  };

  const handleNumChunksChange = (event) => setNumChunks(event.target.value);
  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onDocumentUpload({
          name: file.name,
          ...response.data,
        });
        // Clear the file input for next upload
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadError("Failed to upload document. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveDocument = async () => {
    if (uploadedDocument) {
      setRemoving(true);
      try {
        await axios.delete("/api/upload", {
          data: { fileName: uploadedDocument.name },
        });
        onRemoveDocument();
        setUploadError(null);
      } catch (error) {
        console.error("Error deleting file:", error);
        setUploadError("Failed to remove document. Please try again.");
      } finally {
        setRemoving(false);
      }
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Settings />}
        fullWidth
        onClick={handleOpenSettings}
      >
        PARAMETERS SETTINGS
      </Button>

      <Dialog open={open} onClose={handleCloseSettings}>
        <DialogTitle>Parameters Settings</DialogTitle>
        <DialogContent
          sx={{
            width: 400,
            height: 300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Number of Chunks:
            </Typography>
            <Select
              value={numChunks}
              onChange={handleNumChunksChange}
              fullWidth
              size="small"
            >
              {[...Array(15)].map((_, index) => (
                <MenuItem key={index} value={index + 1}>
                  {index + 1}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {!uploadedDocument ? (
              <>
                <Button
                  variant="contained"
                  startIcon={
                    uploading ? <CircularProgress size={20} /> : <Upload />
                  }
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={handleDocumentUploadClick}
                  disabled={uploading}
                >
                  {uploading ? "UPLOADING..." : "UPLOAD DOCUMENT"}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center" }}
                >
                  Note: PDF files may not be parsed accurately. For best
                  results, use text or Word documents.
                </Typography>
              </>
            ) : (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Document:
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Chip
                    icon={<FileText size={16} />}
                    label={uploadedDocument.name}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    startIcon={
                      removing ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )
                    }
                    color="error"
                    onClick={handleRemoveDocument}
                    disabled={removing}
                  >
                    {removing ? "Removing..." : "Remove"}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {uploadError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {uploadError}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Typography variant="body2">Enable RAG</Typography>
            <Switch
              checked={isRAGEnabled}
              onChange={handleRAGToggle}
              disabled={!uploadedDocument}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} color="primary">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleDocumentUpload}
      />
    </>
  );
};

export default SettingsDialog;
