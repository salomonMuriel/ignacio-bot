export interface User {
  id: string;
  phone_number: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}