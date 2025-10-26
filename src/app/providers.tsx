"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme";
import { QueryProvider } from "@/providers/QueryProvider";
import { HydrationZustand } from "@/components/HydrationZustand";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HydrationZustand />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
