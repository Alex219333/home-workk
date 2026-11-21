import type { PostServiceContract } from "../../../services/post/post.types.js";
import type { PostHandlerContract } from "./post.types.js";

export function createPostHandler(service: PostServiceContract): PostHandlerContract {
    return {
        async getAll(req, res) {
            try {
                const posts = await service.getAll();
                res.status(200).json(posts);
            } catch (error) {
                res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        async createPost(req, res) {
            try {
                const { title, content } = req.body ?? {};

                if (!title || !content) {
                    res.status(422).json({ message: "Validation Error!" });
                    return;
                }

                const post = await service.createPost({ title, content });
                res.status(201).json(post);
            } catch (error) {
                res.status(500).json({ message: "Internal Server Error!" });
            }
        }
    };
}
