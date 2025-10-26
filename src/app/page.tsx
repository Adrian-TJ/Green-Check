"use client";

import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NatureIcon from "@mui/icons-material/Nature";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BusinessIcon from "@mui/icons-material/Business";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <NatureIcon sx={{ fontSize: 48 }} />,
      title: "Sostenibilidad Medible",
      description:
        "Rastrea tu impacto ambiental, social y de gobernanza con métricas claras y accionables.",
      color: "#6CC04A",
    },
    {
      icon: <TrendingDownIcon sx={{ fontSize: 48 }} />,
      title: "Tasas Preferenciales",
      description:
        "Obtén mejores tasas de interés basadas en tu desempeño ESG. Mientras más verde, mejores beneficios.",
      color: "#EB0029",
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 48 }} />,
      title: "Crecimiento Inteligente",
      description:
        "Accede a financiamiento preferencial y programas de apoyo exclusivos para empresas sostenibles.",
      color: "#5B6670",
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
      title: "Análisis con IA",
      description:
        "Recibe recomendaciones inteligentes para mejorar tu puntuación ESG y optimizar recursos.",
      color: "#9C27B0",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Registra tus Datos",
      description:
        "Ingresa información sobre consumo de recursos, prácticas sociales y gobernanza.",
    },
    {
      step: "2",
      title: "Obtén tu Puntuación ESG",
      description:
        "Nuestro sistema calcula tu desempeño en las tres dimensiones de sostenibilidad.",
    },
    {
      step: "3",
      title: "Mejora Continuamente",
      description:
        "Implementa las recomendaciones de IA para optimizar tu impacto ambiental y social.",
    },
    {
      step: "4",
      title: "Accede a Beneficios",
      description:
        "Disfruta de tasas preferenciales y apoyo financiero basado en tu puntuación verde.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #EB0029 0%, #DB0026 50%, #6CC04A 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
                  alt="Banorte logo"
                  width={140}
                  height={32}
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 2, bgcolor: "white", opacity: 0.5 }}
                />
                <Typography variant="h5" fontWeight={700}>
                  GreenCheck
                </Typography>
              </Box>

              <Typography variant="h3" fontWeight={700} gutterBottom>
                Crece Verde, Crece Mejor
              </Typography>

              <Typography
                variant="h5"
                sx={{ mb: 4, opacity: 0.95, fontWeight: 400 }}
              >
                La plataforma que impulsa PyMEs sostenibles con mejores tasas de
                interés y apoyo financiero preferencial.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{
                    bgcolor: "white",
                    color: "#EB0029",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#F9F9F9" },
                  }}
                >
                  Comenzar Ahora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Ver Demo
                </Button>
              </Stack>

              {/* Stats */}
              <Grid container spacing={3} sx={{ mt: 4 }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="h4" fontWeight={700}>
                    3%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Reducción en tasas
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="h4" fontWeight={700}>
                    25%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ahorro promedio
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  position: "relative",
                  height: 400,
                }}
              >
                {/* Placeholder for illustration */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <NatureIcon sx={{ fontSize: 120, opacity: 0.3 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            ¿Por qué elegir GreenCheck?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            maxWidth="md"
            mx="auto"
          >
            Transformamos tu compromiso ambiental en ventajas competitivas
            reales
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Value Proposition Section */}
      <Box sx={{ bgcolor: "#F9F9F9", py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Ser verde te hace crecer más
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                En Banorte creemos que las empresas sostenibles merecen mejores
                condiciones. Por eso, desarrollamos GreenCheck: una plataforma
                que premia tu compromiso ambiental con beneficios financieros
                tangibles.
              </Typography>

              <Stack spacing={2} mt={3}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <VerifiedIcon
                    sx={{ color: "#6CC04A", fontSize: 28, mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Tasas de interés reducidas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hasta 3% menos en créditos según tu puntuación ESG
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2} alignItems="flex-start">
                  <VerifiedIcon
                    sx={{ color: "#6CC04A", fontSize: 28, mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Acceso preferencial a programas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Líneas de crédito exclusivas para empresas verdes
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2} alignItems="flex-start">
                  <VerifiedIcon
                    sx={{ color: "#6CC04A", fontSize: 28, mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Asesoría especializada
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apoyo continuo para mejorar tu desempeño sostenible
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 4,
                  background:
                    "linear-gradient(135deg, #6CC04A 0%, #4CAF50 100%)",
                  color: "white",
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Tu puntuación ESG = Mejores beneficios
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                  Mientras más alta sea tu puntuación en Environment, Social y
                  Governance, mejores tasas y condiciones obtendrás.
                </Typography>

                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Ejemplo: Puntuación 80+
                  </Typography>
                  <Typography variant="h4" fontWeight={700} mt={1}>
                    13% - 16%
                  </Typography>
                  <Typography variant="body2">
                    Tasa anual vs. 16% estándar
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            ¿Cómo funciona?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            4 pasos simples para comenzar a obtener beneficios
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {howItWorks.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#EB0029",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                    fontWeight: 700,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "#EB0029",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Comienza tu transformación verde hoy
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
            Únete a cientos de PyMEs que ya están creciendo de manera sostenible
            y obteniendo mejores condiciones financieras.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/login")}
            sx={{
              bgcolor: "white",
              color: "#EB0029",
              px: 5,
              py: 2,
              fontSize: "1.125rem",
              fontWeight: 700,
              "&:hover": { bgcolor: "#F9F9F9" },
            }}
          >
            Registrarme Ahora
          </Button>

          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 3, opacity: 0.8 }}
          >
            Sin costos ocultos. Sin compromisos a largo plazo.
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#111111", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
                  alt="Banorte logo"
                  width={120}
                  height={28}
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                GreenCheck es una iniciativa de Banorte para impulsar el
                crecimiento sostenible de las PyMEs mexicanas.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Producto
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Características
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Precios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Demo
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Soporte
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Ayuda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contacto
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FAQ
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Privacidad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Términos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seguridad
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
          >
            © 2025 Banorte. Todos los derechos reservados. GreenCheck™
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
