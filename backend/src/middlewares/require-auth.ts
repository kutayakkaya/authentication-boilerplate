import { Request, Response, NextFunction } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.authenticatedUser) {
        res.status(401).json({ message: "Session not found." });
        return;
    }
    next();
};

export default requireAuth;
