"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useUserSession } from "@/contexts/userSessionContext";
import { useGovernanceAnalysis } from "@/modules/governance/hooks/useGovernanceAnalysis";

export default function GovernancePage() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  const { documentsWithAnalysis, isLoading } = useGovernanceAnalysis(pymeId);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" color="primary">
            Gobernanza
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Esta sección muestra las prácticas de gobernanza corporativa de tu
          empresa.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Incluye código de ética, políticas anticorrupción, gestión de riesgos
          y transparencia organizacional.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {documentsWithAnalysis.map((doc) => (
          <Grid size={{ xs: 12, md: 4 }} key={doc.documentType}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" component="div">
                    {doc.documentName}
                  </Typography>
                  {doc.isLoading ? (
                    <CircularProgress size={24} />
                  ) : doc.error ? (
                    <ErrorIcon color="error" />
                  ) : doc.analysis ? (
                    <CheckCircleIcon color="success" />
                  ) : null}
                </Box>

                {doc.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {doc.error}
                  </Alert>
                )}

                {doc.isLoading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Analizando documento...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}

                {doc.analysis && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Puntuación
                        </Typography>
                        <Chip
                          label={`${doc.analysis.score}/100`}
                          color={
                            doc.analysis.score >= 80
                              ? "success"
                              : doc.analysis.score >= 60
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={doc.analysis.score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              doc.analysis.score >= 80
                                ? "success.main"
                                : doc.analysis.score >= 60
                                ? "warning.main"
                                : "error.main",
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LightbulbIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" color="primary">
                          Recomendaciones
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={
                              doc.analysis.recommendations.recommendation1
                            }
                            primaryTypographyProps={{
                              variant: "body2",
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={
                              doc.analysis.recommendations.recommendation2
                            }
                            primaryTypographyProps={{
                              variant: "body2",
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={
                              doc.analysis.recommendations.recommendation3
                            }
                            primaryTypographyProps={{
                              variant: "body2",
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={
                              doc.analysis.recommendations.recommendation4
                            }
                            primaryTypographyProps={{
                              variant: "body2",
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </>
                )}

                {!doc.isLoading && !doc.error && !doc.analysis && (
                  <Alert severity="info">
                    No hay documento disponible para analizar
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
