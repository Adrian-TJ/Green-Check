"use client";

import { createTheme } from "@mui/material/styles";

// 🎨 Paleta Banorte Verde
const BANORTE_RED = "#EB0029";
const BANORTE_RED_HOVER = "#DB0026";
const BANORTE_GRAY = "#5B6670";
const WHITE = "#FFFFFF";

// adicionales de la guía
const POSITIVE_GREEN = "#6CC04A"; // success
const ALERT_ORANGE = "#FF671B";   // alertas -> lo usamos como error
const NOTICE_AMBER = "#FFA400";   // avisos -> warning

// Grises UI
const GRAY_900 = "#111111";
const GRAY_700 = "#555555";
const GRAY_500 = "#777777";
const GRAY_300 = "#D0D5DD";
const GRAY_50  = "#F9F9F9";

// Específicos de botones del mock
const OUTLINE_GRAY = "#323E48";   // secundario (outlined)
const DISABLED_BG  = "#CFD2D3";
const DISABLED_TXT = "#A2A9AD";

// 🧱 Tema base
const theme = createTheme({
  palette: {
    primary:   { main: BANORTE_RED, contrastText: WHITE },
    secondary: { main: BANORTE_GRAY, contrastText: WHITE },
    background:{ default: GRAY_50, paper: WHITE },
    text:      { primary: GRAY_900, secondary: GRAY_700, disabled: GRAY_500 },
    divider:   GRAY_300,

    success: { main: POSITIVE_GREEN, contrastText: WHITE },
    error:   { main: ALERT_ORANGE,  contrastText: WHITE },
    warning: { main: NOTICE_AMBER,  contrastText: GRAY_900 },
    info:    { main: BANORTE_GRAY,  contrastText: WHITE },
  },

  shape: { borderRadius: 10 }, // por defecto; botones se ajustan abajo

  typography: {
    // Usa Montserrat globalmente (cargada en layout.tsx con next/font)
    fontFamily: "'Montserrat','Roboto','Helvetica','Arial',sans-serif",

    // Escala 15/20/25/30/40 px
    h3:     { fontSize: "2.5rem",   fontWeight: 700 }, // 40px
    h4:     { fontSize: "1.875rem", fontWeight: 700 }, // 30px
    h5:     { fontSize: "1.5625rem",fontWeight: 600 }, // 25px
    body1:  { fontSize: "1.25rem",  fontWeight: 400 }, // 20px
    body2:  { fontSize: "0.9375rem",fontWeight: 400 }, // 15px
    caption:{ fontSize: "0.9375rem",fontWeight: 400 }, // 15px
    button: { fontSize: "0.9375rem",fontWeight: 600, textTransform: "none" }, // 15px
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: GRAY_50 },
        a: { color: BANORTE_RED, textDecorationColor: BANORTE_RED },
      },
    },

    // ⚡️ Botones con variantes de marca (primary, secondary, tertiary)
    MuiButton: {
      styleOverrides: {
        root: {
          // medidas de la guía
          borderRadius: 4,        // radios 4px (mock)
          minHeight: 45,
          paddingInline: 30,
          fontSize: "0.9375rem",  // 15px
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "&:active": { boxShadow: "none" },
        },
      },
      variants: [
        // PRIMARIO (contenedor rojo)
        {
          props: { variant: "primary" as any },
          style: {
            color: WHITE,
            backgroundColor: BANORTE_RED,
            border: "1px solid transparent",
            "&:hover": { backgroundColor: BANORTE_RED_HOVER },
            "&.Mui-disabled": {
              backgroundColor: DISABLED_BG,
              color: DISABLED_TXT,
            },
          },
        },
        // SECUNDARIO (outlined gris → hover rojo)
        {
          props: { variant: "secondary" as any },
          style: {
            color: OUTLINE_GRAY,
            backgroundColor: "transparent",
            border: `1px solid ${OUTLINE_GRAY}`,
            "&:hover": {
              color: BANORTE_RED_HOVER,
              borderColor: BANORTE_RED_HOVER,
              backgroundColor: "transparent",
            },
            "&.Mui-disabled": {
              color: DISABLED_TXT,
              borderColor: DISABLED_BG,
            },
          },
        },
        // TERCIARIO (texto rojo → hover con borde rojo)
        {
          props: { variant: "tertiary" as any },
          style: {
            color: BANORTE_RED_HOVER,
            backgroundColor: "transparent",
            border: "1px solid transparent",
            "&:hover": {
              borderColor: BANORTE_RED_HOVER,
              backgroundColor: "transparent",
            },
            "&.Mui-disabled": {
              color: DISABLED_TXT,
              borderColor: "transparent",
            },
          },
        },
      ],
    },

    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiInputBase-input":  { fontSize: "0.9375rem" }, // 15px
          "& .MuiInputLabel-root":  { fontSize: "0.9375rem" }, // 15px
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
        root: { color: BANORTE_RED, "&:hover": { color: BANORTE_RED_HOVER } },
      },
    },

     // Label (12 px) y colores por estado
  MuiInputLabel: {
  styleOverrides: {
    root: {
      fontSize: "12px",
      color: "#5B6670", // gris Banorte
      transform: "translate(12px, 16px) scale(1)", // posición inicial
      transition: "all 0.2s ease",
      "&.MuiInputLabel-shrink": {
        transform: "translate(12px, 4px) scale(0.85)", // posición flotante
        color: "#5B6670",
      },
      "&.Mui-disabled": {
        color: "#C1C5C8", // label deshabilitado
      },
      "&.Mui-error": {
        color: "#EB0029", // label rojo si hay error
      },
    },
  },
},

MuiFilledInput: {
  styleOverrides: {
    root: {
      backgroundColor: "#F6F6F6", // fondo del campo
      borderRadius: 10,
      transition: "all 0.2s ease",
      "&:hover": { backgroundColor: "#F6F6F6" },
      "&.Mui-focused": {
        backgroundColor: "#F6F6F6", // sin cambio al enfocar
      },
      "&.Mui-disabled": {
        backgroundColor: "#F6F6F6",
        color: "#C1C5C8",
      },

      // Línea inferior
      "&:before": {
        borderBottom: "1px solid #D0D5DD", // línea base gris claro
      },
      "&:hover:before": {
        borderBottom: "1px solid #5B6670", // hover gris Banorte
      },
      "&.Mui-focused:after": {
        borderBottom: "2px solid #5B6670", // foco gris Banorte (no negro)
      },
      "&.Mui-error:after": {
        borderBottom: "2px solid #EB0029", // error rojo Banorte
      },
    },

    input: {
      fontSize: "15px",
      fontWeight: 500,
      color: "#323E48", // texto principal
      lineHeight: 1.4,
      padding: "18px 12px 6px 12px", // centra el texto verticalmente
      "&::placeholder": {
        color: "#5B6670",
        opacity: 1,
      },
    },
  },
},

MuiFormHelperText: {
  styleOverrides: {
    root: {
      marginTop: 4,
      fontSize: "12px",
      lineHeight: 1.4,
      color: "#5B6670",
      "&.Mui-error": {
        "color": "#EB0029"
      },
      "&.Mui-disabled": {
        color: "#C1C5C8",
      },
    },
  },
},

  
  },
});

export default theme;
