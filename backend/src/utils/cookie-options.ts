import config from "../config/env";

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});

export default getRefreshCookieOptions;
