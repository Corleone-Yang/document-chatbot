"use client";

import { auth } from "@/lib/firebase";
import { Box, CssBaseline } from "@mui/material";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Chatbot from "./components/Chatbot";
import SideDrawer from "./components/Sidebar/SideDrawer";
import Toolbar from "./components/Toolbar";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/SignIn");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/SignIn");
    } catch (error) {
      console.error(`Error signing out`, error);
      setError(`Failed to sign out. Please try again.`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CssBaseline />
      <Toolbar onSignOut={handleSignOut} />
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          mt: "64px", // Add top margin to account for the Toolbar height
        }}
      >
        <SideDrawer />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Chatbot />
        </Box>
      </Box>
    </Box>
  );
}
