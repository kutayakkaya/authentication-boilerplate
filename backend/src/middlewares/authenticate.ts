import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token-service";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authorization required." });
        return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (token.length === 0) {
        res.status(401).json({ message: "Invalid authorization token." });
        return;
    }

    try {
        const payload = verifyAccessToken(token);
        req.authenticatedUser = {
            id: payload.userId,
            email: payload.email,
            tokenId: payload.tokenId
        };
        next();
    } catch (error) {
        res.status(401).json({ message: "Token verification failed." });
    }
};

export default authenticate;
