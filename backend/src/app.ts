import express from "express";
import config from "./config/env";
import errorHandler from "./middlewares/error-handler";

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        environment: config.nodeEnv
    });
});

app.use(errorHandler);

export default app;