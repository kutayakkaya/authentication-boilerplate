import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const globalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({ message: "Too many requests. Please try again later." });
    }
});

const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 1,
    keyGenerator: (req) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const ipKey = ipKeyGenerator(ip);
        return `${ipKey}:${req.get("user-agent") || "unknown"}`;
    },
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({ message: "Only one registration per hour is allowed from this device." });
    }
});

const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({ message: "Too many login attempts. Please try again later." });
    }
});

export { globalRateLimiter, registerRateLimiter, loginRateLimiter };
