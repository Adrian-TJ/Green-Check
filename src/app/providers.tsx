"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {mounted && <CssBaseline />}
      {children}
    </ThemeProvider>
  );
}
