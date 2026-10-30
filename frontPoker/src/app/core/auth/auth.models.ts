export interface AuthTokens {
  token: string;
  refresh_token: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  pseudo: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  consentVersion: string;
  premium: boolean;
  premiumUntil: string | null;
}

export interface RegisterPayload {
  pseudo: string;
  email: string;
  password: string;
  acceptCgu: boolean;
}

export interface MessageResponse {
  message: string;
  code?: string;
}
