import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import "katex/dist/katex.min.css";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  ...theme.typography.body1,
  "& p": { margin: 0 },
  "& a": { color: theme.palette.primary.main },
  overflowWrap: "break-word",
  wordWrap: "break-word",
  "& .katex-display": {
    margin: "1em 0",
    overflow: "auto hidden",
    textAlign: "center",
    fontSize: "1.2em",
    lineHeight: "1.5",
  },
  "& .katex": { fontSize: "1em", lineHeight: "1.5" },
  "& pre": {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    borderRadius: "5px",
    overflowX: "auto",
  },
  "& code": {
    backgroundColor: "#f5f5f5",
    padding: "2px 4px",
    borderRadius: "3px",
    fontSize: "1em",
  },
}));

const MessageRenderer = ({ message, index }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          message.role === "assistant" ? "flex-start" : "flex-end",
        mb: 2,
        alignItems: "flex-start",
      }}
    >
      {message.role === "assistant" && (
        <Box sx={{ mr: 2, mt: 1 }}>
          <Image
            src="/images/chatbot.jpg"
            alt="Assistant"
            width={40}
            height={40}
            style={{ borderRadius: "50%" }}
          />
        </Box>
      )}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          maxWidth: "70%",
          bgcolor:
            message.role === "assistant"
              ? "rgba(255,255,255,0.9)"
              : "rgba(220,220,255,0.9)",
          overflowX: "auto",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {message.content ? (
          <StyledReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {message.content}
          </StyledReactMarkdown>
        ) : (
          <Typography color="text.secondary">Empty message</Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {`[Debug] Message ${index + 1}: ${message.role}`}
        </Typography>
      </Paper>
    </Box>
  );
};

const Rendering = ({ messages }) => {
  return (
    <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
      {messages.length === 0 ? (
        <Typography>No messages to display</Typography>
      ) : (
        messages.map((msg, index) => (
          <MessageRenderer key={index} message={msg} index={index} />
        ))
      )}
    </Box>
  );
};

export default Rendering;
