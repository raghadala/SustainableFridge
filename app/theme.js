"use client";

import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  palette: {
    primary: {
      main: "#faf7f2",
    },
    secondary: {
      main: "#9D8980",
    },
    tertiary: {
      main: "#049152",
    },
  },
});

export default function Theme({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}