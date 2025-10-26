"use client";

import { Box } from "@mui/material";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <Box component="main" sx={{ minHeight: "100vh" }}>
        {children}
      </Box>
    </>
  );
}
