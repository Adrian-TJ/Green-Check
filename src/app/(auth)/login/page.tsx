"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { useAuth, type LoginFormData } from "@/modules/auth/hooks/useAuth";
import type { GeneralResponse } from "@/models/generalResponse";
import type { UserWithPyme } from "@/modules/auth/models/User";
import { useRouter } from "next/navigation";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const { login, loginSchema, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [response, setResponse] = useState<GeneralResponse<UserWithPyme> | null>(null);

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
        errors[field] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});
    setResponse(null);

    // Submit to server
    login.mutate(formData, {
      onSuccess: (data: GeneralResponse<UserWithPyme>) => {
        setResponse(data);
        if (data.status === "success") {
          // Redirect to dashboard after successful login
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      },
      onError: () => {
        setResponse({
          status: "error",
          message: "An unexpected error occurred",
        });
      },
    });
  };

  // If already authenticated, show welcome message
  if (isAuthenticated && user) {
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
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="primary" gutterBottom>
            ¡Bienvenido, {user.first_name}!
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ya has iniciado sesión
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push("/dashboard")}
          >
            Ir al Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

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

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Bienvenido al portal de empresas sostenibles
        </Typography>

        {/* Alert Messages */}
        {response?.status === "error" && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {response.message}
          </Alert>
        )}

        {response?.status === "success" && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {response.message}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange("email")}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={login.isPending}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange("password")}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={login.isPending}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={login.isPending}
            >
              {login.isPending ? "Ingresando..." : "Ingresar"}
            </Button>
          </Stack>
        </form>

        {/* Opciones adicionales */}
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="center">
            <Button variant="tertiary" disableRipple>
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>
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
