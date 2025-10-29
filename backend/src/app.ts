import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import config from "./config/env";
import errorHandler from "./middlewares/error-handler";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
        ],
    })
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        environment: config.nodeEnv
    });
});

app.use((_req, res) => {
    res.status(404).json({ message: "Resource not found." });
});

app.use(errorHandler);

export default app;