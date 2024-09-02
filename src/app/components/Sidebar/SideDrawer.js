import { Box, Divider, Drawer, Grid, Paper, Typography } from "@mui/material";
import { FileText, Layers, ToggleLeft } from "lucide-react";
import { useState } from "react";
import ChunkDialog from "./ChunkDialog";
import SettingsDialog from "./SettingsDialog";

const Parameters = ({ uploadedDocument, numChunks, isRAGEnabled }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Parameters
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <FileText
              size={18}
              style={{ marginRight: "8px", color: "#1976d2" }}
            />
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Document:{" "}
              {uploadedDocument
                ? uploadedDocument.name
                : "No document uploaded"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <Layers
              size={18}
              style={{ marginRight: "8px", color: "#1976d2" }}
            />
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Number of Chunks: {numChunks}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <ToggleLeft
              size={18}
              style={{ marginRight: "8px", color: "#1976d2" }}
            />
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              RAG: {isRAGEnabled ? "Enabled" : "Disabled"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const SideDrawer = () => {
  const [numChunks, setNumChunks] = useState(10);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [isRAGEnabled, setIsRAGEnabled] = useState(false);

  const handleNumChunksChange = (newNumChunks) => {
    setNumChunks(newNumChunks);
  };

  const handleDocumentUpload = (file) => {
    setUploadedDocument(file);
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setIsRAGEnabled(false);
  };

  const handleRAGToggle = (enabled) => {
    setIsRAGEnabled(enabled);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: "border-box",
          height: "calc(100% - 64px)",
          top: 64,
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}
      >
        <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
          <ChunkDialog numChunks={numChunks} />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ mt: 1 }}>
          <SettingsDialog
            initialNumChunks={numChunks}
            uploadedDocument={uploadedDocument}
            isRAGEnabled={isRAGEnabled}
            onNumChunksChange={handleNumChunksChange}
            onDocumentUpload={handleDocumentUpload}
            onRemoveDocument={handleRemoveDocument}
            onRAGToggle={handleRAGToggle}
          />
          <Box sx={{ mt: 1 }}>
            <Parameters
              uploadedDocument={uploadedDocument}
              numChunks={numChunks}
              isRAGEnabled={isRAGEnabled}
            />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideDrawer;
