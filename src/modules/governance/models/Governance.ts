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
