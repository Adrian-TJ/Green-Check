"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  TextField,
  Alert,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Slider,
} from "@mui/material";
import Image from "next/image";
import SendIcon from "@mui/icons-material/Send";
import PeopleIcon from "@mui/icons-material/People";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function SocialRegister() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    men: "",
    women: "",
    menLeadership: "",
    womenLeadership: "",
    trainingHours: "",
    satisfactionRate: 50,
    communityPrograms: "",
    employeesWithInsurance: "",
    employeesWithoutInsurance: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.pyme?.id) {
      setMessage("Debes iniciar sesión para registrar métricas sociales");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "men",
      "women",
      "menLeadership",
      "womenLeadership",
      "trainingHours",
      "communityPrograms",
      "employeesWithInsurance",
      "employeesWithoutInsurance",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      setMessage("Por favor completa todos los campos obligatorios");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

      const response = await fetch(`${API_URL}/api/save-social-metrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pymeId: user.pyme.id,
          men: parseInt(formData.men),
          women: parseInt(formData.women),
          menLeadership: parseInt(formData.menLeadership),
          womenLeadership: parseInt(formData.womenLeadership),
          trainingHours: parseFloat(formData.trainingHours),
          satisfactionRate: formData.satisfactionRate,
          communityPrograms: formData.communityPrograms === "yes",
          employeesWithInsurance: parseInt(formData.employeesWithInsurance),
          employeesWithoutInsurance: parseInt(
            formData.employeesWithoutInsurance
          ),
          date: formData.date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al registrar métricas sociales"
        );
      }

      const result = await response.json();
      console.log("Social metrics saved:", result);

      setMessage("Métricas sociales registradas exitosamente");
      setFormData({
        men: "",
        women: "",
        menLeadership: "",
        womenLeadership: "",
        trainingHours: "",
        satisfactionRate: 50,
        communityPrograms: "",
        employeesWithInsurance: "",
        employeesWithoutInsurance: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Save social metrics error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al registrar las métricas. Por favor intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
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
        sx={{ width: "100%", maxWidth: 800, p: 5, borderRadius: 3 }}
      >
        <Box display="flex" justifyContent="center" mb={4}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={180}
            height={40}
          />
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          mb={1}
        >
          <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" color="primary" textAlign="center">
            Registro de Métricas Sociales
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Completa la información sobre las métricas sociales de tu PyME
        </Typography>

        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Debes iniciar sesión para registrar métricas sociales
          </Alert>
        )}

        {message && (
          <Alert
            severity={message.includes("Error") ? "error" : "success"}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Gender Distribution Section */}
            <Box>
              <Typography variant="h6" color="primary" mb={2}>
                Distribución de Género
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Número de Hombres"
                  type="number"
                  required
                  fullWidth
                  value={formData.men}
                  onChange={(e) => handleFormChange("men", e.target.value)}
                  inputProps={{ min: "0", step: "1" }}
                />
                <TextField
                  label="Número de Mujeres"
                  type="number"
                  required
                  fullWidth
                  value={formData.women}
                  onChange={(e) => handleFormChange("women", e.target.value)}
                />
              </Stack>
            </Box>

            {/* Leadership Section */}
            <Box>
              <Typography variant="h6" color="primary" mb={2}>
                Roles de Liderazgo
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Hombres en Roles de Liderazgo"
                  type="number"
                  required
                  fullWidth
                  value={formData.menLeadership}
                  onChange={(e) =>
                    handleFormChange("menLeadership", e.target.value)
                  }
                />
                <TextField
                  label="Mujeres en Roles de Liderazgo"
                  type="number"
                  required
                  fullWidth
                  value={formData.womenLeadership}
                  onChange={(e) =>
                    handleFormChange("womenLeadership", e.target.value)
                  }
                />
              </Stack>
            </Box>

            {/* Training and Satisfaction Section */}
            <Box>
              <Typography variant="h6" color="primary" mb={2}>
                Capacitación y Satisfacción
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Horas de Capacitación Este Mes"
                  type="number"
                  required
                  fullWidth
                  value={formData.trainingHours}
                  onChange={(e) =>
                    handleFormChange("trainingHours", e.target.value)
                  }
                  helperText="Total de horas de capacitación proporcionadas"
                />

                <Box>
                  <Typography id="satisfaction-slider" gutterBottom>
                    Tasa de Satisfacción de Empleados:{" "}
                    {formData.satisfactionRate}%
                  </Typography>
                  <Slider
                    value={formData.satisfactionRate}
                    onChange={(_, value) =>
                      handleFormChange("satisfactionRate", value as number)
                    }
                    aria-labelledby="satisfaction-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Community Programs Section */}
            <Box>
              <Typography variant="h6" color="primary" mb={2}>
                Programas Comunitarios
              </Typography>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">
                  ¿Ha habido programas comunitarios este mes?
                </FormLabel>
                <RadioGroup
                  value={formData.communityPrograms}
                  onChange={(e) =>
                    handleFormChange("communityPrograms", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Sí"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Insurance Section */}
            <Box>
              <Typography variant="h6" color="primary" mb={2}>
                Cobertura de Seguro
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Empleados con Seguro"
                  type="number"
                  required
                  fullWidth
                  value={formData.employeesWithInsurance}
                  onChange={(e) =>
                    handleFormChange("employeesWithInsurance", e.target.value)
                  }
                />
                <TextField
                  label="Empleados sin Seguro"
                  type="number"
                  required
                  fullWidth
                  value={formData.employeesWithoutInsurance}
                  onChange={(e) =>
                    handleFormChange(
                      "employeesWithoutInsurance",
                      e.target.value
                    )
                  }
                />
              </Stack>
            </Box>

            {/* Date Section */}
            <TextField
              label="Fecha del Registro"
              type="date"
              required
              fullWidth
              value={formData.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="large"
              disabled={!isAuthenticated || submitting}
              startIcon={<SendIcon />}
            >
              {submitting ? "Enviando..." : "Registrar Métricas Sociales"}
            </Button>
          </Stack>
        </Box>

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
