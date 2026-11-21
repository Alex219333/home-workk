import type { PostRepositoryContract } from "../../domain/post/repository.js";
import type { PostServiceContract } from "./post.types.js";

export function createPostService(repository: PostRepositoryContract): PostServiceContract {
    return {
        async getAll() {
            return repository.getAll();
        },

        async createPost(data) {
            return repository.createPost({
                title: data.title.trim(),
                content: data.content.trim()
            });
        }
    };
}
