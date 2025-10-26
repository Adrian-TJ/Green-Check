export interface Governance {
  id: string;
  codigo_etica: boolean;
  anti_corrupcion: boolean;
  risk_file_url: string;
  date: Date;
  pymeId: string;
}

export interface GovernanceScore {
  date: string;
  score: number;
}

export interface GovernanceDocument {
  id: string;
  codigo_etica_url: string | null;
  anti_corrupcion_url: string | null;
  risk_file_url: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  pymeId: string | null;
}

export interface DocumentAnalysis {
  score: number;
  recommendations: {
    recommendation1: string;
    recommendation2: string;
    recommendation3: string;
    recommendation4: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  data: {
    documentType: string;
    s3Url: string;
    fileSize: number;
    pageCount?: number;
    textLength?: number;
    analysis: DocumentAnalysis;
    analyzedAt: string;
  };
}

export interface GovernanceWithAnalysis {
  documentType: "codigo_etica" | "anti_corrupcion" | "gestion_riesgos";
  documentName: string;
  s3Url: string | null;
  analysis: DocumentAnalysis | null;
  isLoading: boolean;
  error: string | null;
}
