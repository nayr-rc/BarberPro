import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../utils/auth";
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map