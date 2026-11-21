import type { Request, Response } from "express";
import type { CreatePostBody } from "../../dto/requests.js";

export interface PostHandlerContract {
    getAll: (req: Request, res: Response) => Promise<void>;
    createPost: (req: Request<{}, {}, CreatePostBody>, res: Response) => Promise<void>;
}
