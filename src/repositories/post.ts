import type { PostRepositoryContract } from "../domain/post/repository.js";

type Database = typeof import("../prisma/db.js").db;

export function createPostRepository(db: Database): PostRepositoryContract {
    return {
        async getAll() {
            return db.orm.public.Post.orderBy((post) => post.id.asc()).all();
        },

        async createPost(data) {
            return db.orm.public.Post.create(data);
        },
    };
}
