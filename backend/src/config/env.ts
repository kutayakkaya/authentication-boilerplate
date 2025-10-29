import dotenv from "dotenv";

dotenv.config();

const required = [
    "NODE_ENV",
    "PORT",
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CLIENT_ORIGIN"
];

required.forEach((key) => {
    if (!process.env[key]) {
        throw new Error("Missing .env variable: " + key);
    }
});

const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5001", 10),
    mongoUri: process.env.MONGO_URI || "",
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "strong-access-secret",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "strong-refresh-secret",
    corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
};

export default config;