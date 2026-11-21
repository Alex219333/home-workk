import type { RefreshSessionRepositoryContract } from "../../domain/refresh-session/repository.js";
import type { UserRepositoryContract } from "../../domain/user/repository.js";
import { REFRESH_TOKEN_TTL_MS } from "../../lib/constants.js";
import type {
    AuthServiceContract,
    PasswordHasherContract,
    RefreshTokenHasherContract,
    TokenSignerContract,
    TokenVerifierContract
} from "./auth.types.js";

export function createAuthService(
    userRepository: UserRepositoryContract,
    refreshSessionRepository: RefreshSessionRepositoryContract,
    passwordHasher: PasswordHasherContract,
    tokenSigner: TokenSignerContract,
    tokenVerifier: TokenVerifierContract,
    refreshTokenHasher: RefreshTokenHasherContract
): AuthServiceContract {
    return {
        async register(data) {
            const passwordHash = await passwordHasher.hashPassword(data.password);

            const user = await userRepository.createUser({
                username: data.username.trim(),
                email: data.email.trim(),
                passwordHash
            });

            return { id: user.id, username: user.username, email: user.email };
        },

        async login(data) {
            const user = await userRepository.getUserByEmail(data.email.trim());

            if (!user || !await passwordHasher.verifyPassword(user.passwordHash, data.password)) {
                throw new Error("INVALID_CREDENTIALS");
            }

            const refreshToken = tokenSigner.signRefreshToken(user.id);

            await refreshSessionRepository.create({
                userId: user.id,
                tokenHash: refreshTokenHasher.hashRefreshToken(refreshToken),
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
            });

            return {
                user: { id: user.id, username: user.username, email: user.email },
                accessToken: tokenSigner.signAccessToken(user.id),
                refreshToken
            };
        },

        async refresh(refreshToken) {
            const userId = tokenVerifier.verifyRefreshToken(refreshToken);
            const oldHash = refreshTokenHasher.hashRefreshToken(refreshToken);

            const session = await refreshSessionRepository.getByHash(oldHash);

            if (!session || session.userId !== userId) {
                throw new Error("INVALID_REFRESH_TOKEN");
            }

            if (session.expiresAt.getTime() <= Date.now()) {
                await refreshSessionRepository.delete(oldHash);
                throw new Error("INVALID_REFRESH_TOKEN");
            }

            const newRefreshToken = tokenSigner.signRefreshToken(userId);

            const updated = await refreshSessionRepository.update(
                oldHash,
                refreshTokenHasher.hashRefreshToken(newRefreshToken),
                new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
            );

            if (!updated) {
                throw new Error("INVALID_REFRESH_TOKEN");
            }

            return {
                accessToken: tokenSigner.signAccessToken(userId),
                refreshToken: newRefreshToken
            };
        },

        async logout(refreshToken) {
            await refreshSessionRepository.delete(refreshTokenHasher.hashRefreshToken(refreshToken));
        },

        async me(id) {
            const user = await userRepository.getUserById(id);

            if (!user) {
                throw new Error("UNAUTHORIZED");
            }

            return { id: user.id, username: user.username, email: user.email };
        }
    };
}
