"use server";

import { GeneralResponse } from "@/models/generalResponse";
import { AIInsight } from "../models/AIInsight";
import { ESGScore } from "@/modules/esg/hooks/useESG";

export async function getESGInsightsService(
  esgData: ESGScore[]
): Promise<GeneralResponse<AIInsight>> {
  try {
    if (!esgData || esgData.length === 0) {
      return {
        status: "error",
        message: "No ESG data available for analysis",
      };
    }

    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return {
        status: "error",
        message: "Google Gemini API key not configured",
      };
    }

    // Get latest scores
    const latestScore = esgData[esgData.length - 1];
    const previousScore =
      esgData.length > 1 ? esgData[esgData.length - 2] : null;

    // Calculate trends
    const environmentTrend = previousScore
      ? latestScore.environmentScore - previousScore.environmentScore
      : 0;
    const socialTrend = previousScore
      ? latestScore.socialScore - previousScore.socialScore
      : 0;
    const governanceTrend = previousScore
      ? latestScore.governanceScore - previousScore.governanceScore
      : 0;

    // Prepare context for AI
    const prompt = `Eres un experto en sostenibilidad y métricas ESG (Environmental, Social, Governance) que ayuda a PYMEs a mejorar su impacto.

Analiza los siguientes datos ESG de una PYME y proporciona un resumen breve y recomendaciones:

Puntuaciones Actuales (escala 0-100):
- Ambiental (Environment): ${latestScore.environmentScore} ${
      environmentTrend !== 0
        ? `(${environmentTrend > 0 ? "+" : ""}${environmentTrend.toFixed(
            1
          )} vs mes anterior)`
        : ""
    }
- Social: ${latestScore.socialScore} ${
      socialTrend !== 0
        ? `(${socialTrend > 0 ? "+" : ""}${socialTrend.toFixed(
            1
          )} vs mes anterior)`
        : ""
    }
- Gobernanza (Governance): ${latestScore.governanceScore} ${
      governanceTrend !== 0
        ? `(${governanceTrend > 0 ? "+" : ""}${governanceTrend.toFixed(
            1
          )} vs mes anterior)`
        : ""
    }
- ESG Total: ${latestScore.esgScore}

Datos Históricos (últimos ${Math.min(3, esgData.length)} períodos):
${esgData
  .slice(-3)
  .map(
    (score) =>
      `- ${score.date}: ESG ${score.esgScore} (E:${score.environmentScore}, S:${score.socialScore}, G:${score.governanceScore})`
  )
  .join("\n")}

Proporciona tu respuesta ÚNICAMENTE en formato JSON válido (sin markdown, sin bloques de código) con la siguiente estructura:
{
  "summary": "Un resumen breve de 2-3 oraciones sobre el desempeño ESG actual",
  "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
  "recommendations": ["recomendación específica 1", "recomendación específica 2", "recomendación específica 3"]
}`;

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 10000, // Increased to accommodate thinking tokens in Gemini 2.5 Flash
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "Google Gemini API error:",
        response.status,
        response.statusText
      );
      return {
        status: "error",
        message: "Failed to generate AI insights",
      };
    }

    const data = await response.json();

    console.log("[AI Insights] Gemini API response received");

    // Validate response structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error(
        "[AI Insights] No candidates in Gemini response:",
        JSON.stringify(data, null, 2)
      );
      return {
        status: "error",
        message: "No response from AI",
      };
    }

    // Extract text content
    const textContent = data.candidates[0].content.parts[0].text;

    // Clean text - remove markdown code blocks if present
    let cleanedText = textContent.trim();

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "");
    }

    // Parse JSON
    let aiResponse;
    try {
      // Remove any potential BOM or hidden characters
      const jsonText = cleanedText
        .replace(/^\uFEFF/, "") // Remove BOM
        .replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove zero-width characters

      aiResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("[AI Insights] JSON parse error:", parseError);
      return {
        status: "error",
        message: "Failed to parse AI response",
      };
    }

    // Validate response structure
    if (
      !aiResponse.summary ||
      !aiResponse.keyPoints ||
      !aiResponse.recommendations
    ) {
      console.error("[AI Insights] Invalid response structure:", aiResponse);
      return {
        status: "error",
        message: "Invalid AI response format",
      };
    }

    const insight: AIInsight = {
      summary: aiResponse.summary || "Análisis no disponible",
      keyPoints: Array.isArray(aiResponse.keyPoints)
        ? aiResponse.keyPoints
        : [],
      recommendations: Array.isArray(aiResponse.recommendations)
        ? aiResponse.recommendations
        : [],
      generatedAt: new Date(),
    };

    return {
      status: "success",
      message: "AI insights generated successfully",
      data: insight,
    };
  } catch (error) {
    console.error("[AI Insights] Error generating insights:", error);
    return {
      status: "error",
      message: "An error occurred while generating AI insights",
    };
  }
}
