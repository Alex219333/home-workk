import type { PublicUser } from "../../domain/user/entity.js";

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface PasswordHasherContract {
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (hash: string, password: string) => Promise<boolean>;
}

export interface TokenSignerContract {
    signAccessToken: (userId: number) => string;
    signRefreshToken: (userId: number) => string;
}

export interface TokenVerifierContract {
    verifyRefreshToken: (token: string) => number;
}

export interface RefreshTokenHasherContract {
    hashRefreshToken: (token: string) => string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthServiceContract {
    register: (data: RegisterInput) => Promise<PublicUser>;
    login: (data: LoginInput) => Promise<{ user: PublicUser } & AuthTokens>;
    refresh: (refreshToken: string) => Promise<AuthTokens>;
    logout: (refreshToken: string) => Promise<void>;
    me: (id: number) => Promise<PublicUser>;
}
