import { Router, type RequestHandler } from "express";
import type { PostHandlerContract } from "../handlers/post/post.types.js";

export function createPostRouter(postHandler: PostHandlerContract, requireAuth: RequestHandler) {
    const postRouter = Router();

    postRouter.get("/", postHandler.getAll);
    postRouter.post("/", requireAuth, postHandler.createPost);

    return postRouter;
}
