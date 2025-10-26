export interface Social {
  id: string;
  men: number;
  women: number;
  men_in_leadership: number;
  women_in_leadership: number;
  training_hours: number;
  satisfaction_rate: number;
  community_programs: boolean;
  insured_employees: number;
  uninsured_employees: number;
  date: Date;
  pymeId: string;
  created_at: Date;
  updated_at: Date;
}
export interface SocialChartData {
  date: string;
  men: number;
  women: number;
  satisfaction_rate: number;
  training_hours: number;
  men_in_leadership: number;
  women_in_leadership: number;
  insured_employees: number;
  uninsured_employees: number;
}
export interface SocialDataResponse {
  social: SocialChartData[];
}
