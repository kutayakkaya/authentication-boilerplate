import { Request, Response } from "express";

const getCurrentUser = async (req: Request, res: Response) => {
    if (!req.authenticatedUser) {
        res.status(401).json({ message: "Session not found." });
        return;
    }

    res.json({
        user: {
            id: req.authenticatedUser.id,
            email: req.authenticatedUser.email
        },
    });
};

export { getCurrentUser };
