"use client";

import React from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import Image from "next/image";

export default function LoginPage(): React.JSX.Element {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Intento de inicio de sesión");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 5,
          borderRadius: 3,
          background: "white",
          borderTop: "6px solid #E60026",
        }}
      >
        {/* Logo Banorte */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={180}
            height={40}
            style={{
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Título */}
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#E60026"
          textAlign="center"
          mb={1}
        >
          GreenCheck
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Bienvenido al portal de empresas sostenibles 
        </Typography>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Usuario"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#E60026",
                "&:hover": { bgcolor: "#B5001C" },
                textTransform: "none",
                py: 1.4,
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Ingresar
            </Button>
          </Stack>
        </form>

        {/* Opciones adicionales */}
        <Box mt={3}>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ cursor: "pointer", "&:hover": { color: "#E60026" } }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          mt={4}
          color="text.disabled"
        >
          © Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}
