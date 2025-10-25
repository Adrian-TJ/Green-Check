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
        bgcolor: "background.default",
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
          backgroundColor: "background.paper",
        }}
      >
        {/* Logo */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={180}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </Box>

        {/* Título */}
        <Typography variant="h5" color="primary" textAlign="center" mb={1}>
          GreenCheck
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          Bienvenido al portal de empresas sostenibles
        </Typography>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField label="Usuario" fullWidth />
            <TextField label="Contraseña" type="password" fullWidth />
            <Button type="submit" variant="contained" fullWidth>
              Ingresar
            </Button>
          </Stack>
        </form>

        {/* Opciones adicionales */}
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          mt={5}
          color="text.disabled"
        >
          © Banorte. Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}
