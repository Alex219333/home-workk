import type { Post } from "../../domain/post/entity.js";
import type { NewPost } from "../../domain/post/repository.js";

export interface PostServiceContract {
    getAll: () => Promise<Post[]>;
    createPost: (data: NewPost) => Promise<Post>;
}
