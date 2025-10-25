"use client";

import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuth, type LoginFormData } from "../hooks/useAuth";
import type { GeneralResponse } from "@/models/generalResponse";
import type { UserWithPyme } from "../models/User";

export function LoginForm() {
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
      onSuccess: (data) => {
        setResponse(data);
      },
      onError: () => {
        setResponse({
          status: "error",
          message: "An unexpected error occurred",
        });
      },
    });
  };

  if (isAuthenticated && user) {
    return (
      <Box>
        <Typography variant="h6">Welcome, {user.first_name}!</Typography>
        <Typography variant="body2">Email: {user.email}</Typography>
        {user.pyme && (
          <Typography variant="body2">Company: {user.pyme.name}</Typography>
        )}
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      {response?.status === "error" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {response.message}
        </Alert>
      )}

      {response?.status === "success" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {response.message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        error={!!validationErrors.email}
        helperText={validationErrors.email}
        margin="normal"
        disabled={login.isPending}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        error={!!validationErrors.password}
        helperText={validationErrors.password}
        margin="normal"
        disabled={login.isPending}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={login.isPending}
      >
        {login.isPending ? "Logging in..." : "Login"}
      </Button>
    </Box>
  );
}
