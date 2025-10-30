import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

const validateBody = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
            message: firstIssue?.message ?? "Invalid request data.",
        });
        return;
    }
    req.body = parseResult.data;
    next();
};

export default validateBody;
