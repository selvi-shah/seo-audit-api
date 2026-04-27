
export interface User {
  id: string;
  firebase_uid: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: Date;
  last_login_at: Date | null;
}

export interface PublicUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface JwtPayload {
  userId: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Extends Express Request so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        role: 'user' | 'admin';
      };
    }
  }
}