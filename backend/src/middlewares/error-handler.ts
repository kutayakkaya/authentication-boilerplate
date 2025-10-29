import { NextFunction, Request, Response } from "express";

type KnownError = Error & {
    statusCode?: number;
    status?: number;
};

const errorHandler = (error: KnownError, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.statusCode ?? error.status ?? 500;
    const message = status === 500 ? "Server error" : error.message;
    res.status(status).json({ message });
};

export default errorHandler;