export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
}

export type PublicUser = Pick<User, "id" | "username" | "email">;
