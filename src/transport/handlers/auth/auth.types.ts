import type { Request, Response } from "express";
import type { LoginBody, RegisterBody } from "../../dto/requests.js";

export interface AuthHandlerContract {
    register: (req: Request<{}, {}, RegisterBody>, res: Response) => Promise<void>;
    login: (req: Request<{}, {}, LoginBody>, res: Response) => Promise<void>;
    refresh: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
    me: (req: Request, res: Response) => Promise<void>;
}
