import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const ChunkDialog = ({ chunks = [] }) => {
  const [openChunk, setOpenChunk] = useState(null);

  useEffect(() => {
    // Logs chunks to the console whenever they change
    console.log("ChunkDialog received chunks:", chunks);
  }, [chunks]);

  const handleChunkClick = (chunk) => {
    // Sets the chunk to be displayed in the dialog
    setOpenChunk(chunk);
  };

  const handleCloseChunk = () => {
    // Closes the dialog
    setOpenChunk(null);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chunks ({chunks.length})
      </Typography>
      {chunks.length > 0 ? (
        chunks.map((chunk, index) => (
          <Card
            key={index}
            sx={{
              mb: 2,
              cursor: "pointer",
              "&:hover": {
                boxShadow: 3,
              },
            }}
            onClick={() => handleChunkClick(chunk)}
          >
            <CardContent>
              <Typography variant="h6" component="div">
                Chunk {index + 1}
              </Typography>
              <Chip
                label={`Score: ${chunk.score.toFixed(4)}`}
                color="primary"
                size="small"
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" noWrap>
                {chunk.text}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No chunks retrieved yet. Ask a question to see relevant chunks here.
        </Typography>
      )}

      <Dialog
        open={!!openChunk}
        onClose={handleCloseChunk}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chunk Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Score: {openChunk?.score.toFixed(4)}
          </Typography>
          <Typography variant="body1" paragraph>
            {openChunk?.text}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChunk} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChunkDialog;
