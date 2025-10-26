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
}

export interface SocialScore {
  date: string;
  score: number;
}
