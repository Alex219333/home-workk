import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./prisma/db.js";
import { hashPassword, verifyPassword } from "./lib/password.js";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, hashRefreshToken } from "./lib/jwt.js";
import { createUserRepository } from "./repositories/user.js";
import { createRefreshSessionRepository } from "./repositories/refresh-session.js";
import { createPostRepository } from "./repositories/post.js";
import { createAuthService } from "./services/auth/auth.js";
import { createPostService } from "./services/post/post.js";
import { createAuthHandler } from "./transport/handlers/auth/auth.js";
import { createPostHandler } from "./transport/handlers/post/post.js";
import { createRequireAuth } from "./transport/middlewares/require-auth.js";
import { createAuthRouter } from "./transport/routers/auth.js";
import { createPostRouter } from "./transport/routers/post.js";

const PORT = 3000;
const HOST = "localhost";

const app = express();

const userRepository = createUserRepository(db);
const refreshSessionRepository = createRefreshSessionRepository(db);
const authService = createAuthService(
    userRepository,
    refreshSessionRepository,
    { hashPassword, verifyPassword },
    { signAccessToken, signRefreshToken },
    { verifyRefreshToken },
    { hashRefreshToken }
);
const authHandler = createAuthHandler(authService);
const requireAuth = createRequireAuth(verifyAccessToken);
const authRouter = createAuthRouter(authHandler, requireAuth);

const postRepository = createPostRepository(db);
const postService = createPostService(postRepository);
const postHandler = createPostHandler(postService);
const postRouter = createPostRouter(postHandler, requireAuth);

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/posts", postRouter);

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
