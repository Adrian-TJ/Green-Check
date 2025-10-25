"use client";

import { createTheme } from "@mui/material/styles";

// 🎨 Paleta Banorte Verde
const BANORTE_RED = "#EB0029";
const BANORTE_RED_HOVER = "#DB0026";
const BANORTE_GRAY = "#5B6670";
const WHITE = "#FFFFFF";

// adicionales de la guía
const POSITIVE_GREEN = "#6CC04A"; // success
const ALERT_ORANGE = "#FF671B";   // alertas -> lo usaremos como error
const NOTICE_AMBER = "#FFA400";   // avisos -> lo usaremos como warning

// Escala de grises coherente con UI
const GRAY_900 = "#111111";
const GRAY_700 = "#555555";
const GRAY_500 = "#777777";
const GRAY_300 = "#D0D5DD";
const GRAY_50  = "#F9F9F9";

// 🧱 Tema base
const theme = createTheme({
  palette: {
    primary: { main: BANORTE_RED, contrastText: WHITE },
    secondary: { main: BANORTE_GRAY, contrastText: WHITE },
    background: { default: GRAY_50, paper: WHITE },
    text: { primary: GRAY_900, secondary: GRAY_700, disabled: GRAY_500 },
    divider: GRAY_300,

    // mapeo a la guía
    success: { main: POSITIVE_GREEN, contrastText: WHITE },
    error:   { main: ALERT_ORANGE,  contrastText: WHITE },
    warning: { main: NOTICE_AMBER,  contrastText: GRAY_900 },
    info:    { main: BANORTE_GRAY,  contrastText: WHITE },
  },

  shape: { borderRadius: 10 }, // múltiplo de 5

  typography: {
    // ✅ Usa Montserrat globalmente (ya cargada desde layout.tsx)
    fontFamily: "'Montserrat'",

    // Escala 15/20/25/30/40 px
    h3: { fontSize: "2.5rem", fontWeight: 700 },      // 40px
    h4: { fontSize: "1.875rem", fontWeight: 700 },    // 30px
    h5: { fontSize: "1.5625rem", fontWeight: 600 },   // 25px
    body1: { fontSize: "1.25rem", fontWeight: 400 },  // 20px
    body2: { fontSize: "0.9375rem", fontWeight: 400 },// 15px
    caption: { fontSize: "0.9375rem", fontWeight: 400 }, // 15px
    button: { fontSize: "0.9375rem", fontWeight: 600, textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: GRAY_50 },
        a: { color: BANORTE_RED, textDecorationColor: BANORTE_RED },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingBlock: 14, // altura múltiplo de 5
          fontSize: "0.9375rem", // 15px
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: BANORTE_RED,
          "&:hover": { backgroundColor: BANORTE_RED_HOVER },
        },
        outlinedPrimary: {
          borderColor: BANORTE_RED,
          color: BANORTE_RED,
          "&:hover": { borderColor: BANORTE_RED_HOVER, color: BANORTE_RED_HOVER },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": { fontSize: "0.9375rem" }, // 15px
          "& .MuiInputLabel-root": { fontSize: "0.9375rem" }, // 15px
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderTop: `6px solid ${BANORTE_RED}`,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          borderRadius: 15,
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: GRAY_300 } } },
    MuiLink: {
      styleOverrides: {
        root: {
          color: BANORTE_RED,
          "&:hover": { color: BANORTE_RED_HOVER },
        },
      },
    },
  },
});

export default theme;
