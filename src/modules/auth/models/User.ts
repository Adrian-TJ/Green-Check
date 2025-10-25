export interface User {
  id: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPyme extends User {
  pyme?: {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    email: string;
  } | null;
}
