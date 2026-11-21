import "dotenv/config";
import type { Response } from "express";
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from "../../../lib/constants.js";
import type { AuthServiceContract, AuthTokens } from "../../../services/auth/auth.types.js";
import type { AuthHandlerContract } from "./auth.types.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
};

function setAuthCookies(res: Response, tokens: AuthTokens) {
    res.cookie("accessToken", tokens.accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL_MS });
    res.cookie("refreshToken", tokens.refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_TTL_MS });
}

function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
}

export function createAuthHandler(service: AuthServiceContract): AuthHandlerContract {
    return {
        async register(req, res) {
            try {
                const { username, email, password } = req.body ?? {};

                if (!username || !email || !password) {
                    res.status(422).json({ message: "Validation Error!" });
                    return;
                }

                const user = await service.register({ username, email, password });
                res.status(201).json(user);
            } catch (error) {
                if (error instanceof Error && error.message === "EMAIL_ALREADY_USED") {
                    res.status(409).json({ message: "Email is already used!" });
                    return;
                }
                res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        async login(req, res) {
            try {
                const { email, password } = req.body ?? {};

                if (!email || !password) {
                    res.status(422).json({ message: "Validation Error!" });
                    return;
                }

                const result = await service.login({ email, password });

                setAuthCookies(res, result);
                res.status(200).json(result.user);
            } catch (error) {
                if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
                    res.status(401).json({ message: "Invalid email or password" });
                    return;
                }
                res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        async refresh(req, res) {
            const refreshToken = req.cookies?.refreshToken;

            if (typeof refreshToken !== "string") {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            try {
                const tokens = await service.refresh(refreshToken);

                setAuthCookies(res, tokens);
                res.status(200).json({ message: "Tokens updated" });
            } catch (error) {
                if (error instanceof Error && error.message === "INVALID_REFRESH_TOKEN") {
                    clearAuthCookies(res);
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        async logout(req, res) {
            try {
                const refreshToken = req.cookies?.refreshToken;

                if (typeof refreshToken === "string") {
                    await service.logout(refreshToken);
                }

                clearAuthCookies(res);
                res.status(200).json({ message: "Logged out" });
            } catch (error) {
                res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        async me(req, res) {
            try {
                const user = await service.me(res.locals.userId);
                res.status(200).json(user);
            } catch (error) {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
    };
}
