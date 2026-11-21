import "dotenv/config";
import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from "./constants.js";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

if (!accessTokenSecret) throw new Error("JWT_ACCESS_SECRET is not defined");
if (!refreshTokenSecret) throw new Error("JWT_REFRESH_SECRET is not defined");

export function signAccessToken(userId: number): string {
    return jwt.sign({}, accessTokenSecret!, {
        algorithm: "HS256",
        subject: String(userId),
        expiresIn: ACCESS_TOKEN_TTL_MS / 1000
    });
}

export function signRefreshToken(userId: number): string {
    return jwt.sign({ type: "refresh" }, refreshTokenSecret!, {
        algorithm: "HS256",
        subject: String(userId),
        expiresIn: REFRESH_TOKEN_TTL_MS / 1000,
        jwtid: randomUUID()
    });
}

export function verifyAccessToken(token: string): number {
    try {
        const payload = jwt.verify(token, accessTokenSecret!, {
            algorithms: ["HS256"]
        });
        if (typeof payload === "string" || typeof payload.sub !== "string") {
            throw new Error();
        }
        return Number(payload.sub);
    } catch {
        throw new Error("INVALID_ACCESS_TOKEN");
    }
}

export function verifyRefreshToken(token: string): number {
    try {
        const payload = jwt.verify(token, refreshTokenSecret!, {
            algorithms: ["HS256"]
        });
        if (typeof payload === "string" || typeof payload.sub !== "string" || payload.type !== "refresh") {
            throw new Error();
        }
        return Number(payload.sub);
    } catch {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
}

export function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
