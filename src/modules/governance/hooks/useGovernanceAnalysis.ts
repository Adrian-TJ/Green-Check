"use client";

import { useQuery } from "@tanstack/react-query";
import { getLatestGovernanceAdapter } from "../adapters/getGovernance";
import type {
  GovernanceWithAnalysis,
  AnalysisResponse,
} from "../models/Governance";
import { useState, useEffect } from "react";

const OCR_API_URL =
  process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

async function analyzeDocument(
  pymeId: string,
  documentType: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${OCR_API_URL}/api/analyze-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pymeId, documentType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to analyze document");
  }

  return response.json();
}

export function useGovernanceAnalysis(pymeId: string | undefined) {
  const [documentsWithAnalysis, setDocumentsWithAnalysis] = useState<
    GovernanceWithAnalysis[]
  >([]);

  const { data: governanceData, isLoading: isLoadingGovernance } = useQuery({
    queryKey: ["governance-latest", pymeId],
    queryFn: () => getLatestGovernanceAdapter(pymeId!),
    enabled: !!pymeId,
  });

  useEffect(() => {
    if (!pymeId) {
      setDocumentsWithAnalysis([]);
      return;
    }

    const documents: GovernanceWithAnalysis[] = [
      {
        documentType: "codigo_etica",
        documentName: "Código de Ética",
        s3Url: governanceData?.data?.codigo_etica_url || null,
        analysis: null,
        isLoading: false,
        error: null,
      },
      {
        documentType: "anti_corrupcion",
        documentName: "Política Anti-Corrupción",
        s3Url: governanceData?.data?.anti_corrupcion_url || null,
        analysis: null,
        isLoading: false,
        error: null,
      },
      {
        documentType: "gestion_riesgos",
        documentName: "Gestión de Riesgos",
        s3Url: governanceData?.data?.risk_file_url || null,
        analysis: null,
        isLoading: false,
        error: null,
      },
    ];

    setDocumentsWithAnalysis(documents);

    // Fetch analysis for each document type
    documents.forEach(async (doc, index) => {
      setDocumentsWithAnalysis((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isLoading: true };
        return updated;
      });

      try {
        const analysisResult = await analyzeDocument(pymeId, doc.documentType);
        setDocumentsWithAnalysis((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            s3Url: analysisResult.data.s3Url,
            analysis: analysisResult.data.analysis,
            isLoading: false,
          };
          return updated;
        });
      } catch (error) {
        setDocumentsWithAnalysis((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            error:
              error instanceof Error
                ? error.message
                : "Error al analizar documento",
            isLoading: false,
          };
          return updated;
        });
      }
    });
  }, [pymeId, governanceData]);

  return {
    documentsWithAnalysis,
    isLoading: isLoadingGovernance,
  };
}
