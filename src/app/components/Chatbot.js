import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Rendering from "./Rendering";
import ChunkDialog from "./Sidebar/ChunkDialog";

const Chatbot = ({ uploadedDocument, isRAGEnabled }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome to **DocTelligence**!\nI'm your AI-powered document reading assistant based on the **RAG (Retrieval-Augmented Generation) architecture**.\nI can help you solve problems directly or based on the document you upload. Feel free to ask me anything!`,
    },
  ]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [chunks, setChunks] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    console.log("Chunks updated in Chatbot:", chunks);
  }, [chunks]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setMessage("");
    setChunks([]); // Clear previous chunks before new query

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          fileName: uploadedDocument
            ? uploadedDocument.name
            : "Corleone Yang draft .docx", // Use default filename if not provided
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.relevantChunks && Array.isArray(data.relevantChunks)) {
        console.log("Received chunks in Chatbot:", data.relevantChunks);
        setChunks(data.relevantChunks); // Update chunks with retrieved data
      }

      // Generate GPT response
      const gptResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          fileName: uploadedDocument
            ? uploadedDocument.name
            : "Corleone Yang draft .docx",
          relevantChunks: data.relevantChunks,
        }),
      });

      if (!gptResponse.ok) {
        throw new Error(`HTTP error! status: ${gptResponse.status}`);
      }

      const reader = gptResponse.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = { role: "assistant", content: "" };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const text = decoder.decode(value, { stream: true });
        console.log("Received text chunk:", text);
        assistantMessage.content += text;
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { ...assistantMessage },
        ]);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError(
        "Sorry, there was an error processing your request: " + error.message
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your request: " +
            error.message,
        },
      ]);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Sidebar with ChunkDialog */}
      {isRAGEnabled && (
        <Box
          sx={{
            width: 300,
            borderRight: "1px solid #e0e0e0",
            p: 2,
            overflowY: "auto",
          }}
        >
          <ChunkDialog chunks={chunks} />
        </Box>
      )}

      {/* Main chat area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            backgroundImage: 'url("/images/homepage.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Rendering messages={messages} />
        </Box>
        <Paper sx={{ p: 2, bgcolor: "background.paper" }} elevation={3}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              size="small"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="contained" onClick={sendMessage}>
              Send
            </Button>
          </Box>
        </Paper>
        {error && (
          <Typography
            color="error"
            sx={{ mt: 2, p: 2, bgcolor: "background.paper" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Chatbot;
