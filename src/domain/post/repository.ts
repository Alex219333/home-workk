import type { Post } from "./entity.js";

export type NewPost = Omit<Post, "id">;

export interface PostRepositoryContract {
    getAll: () => Promise<Post[]>;
    createPost: (data: NewPost) => Promise<Post>;
}
