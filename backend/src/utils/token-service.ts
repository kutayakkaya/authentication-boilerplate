import crypto from "crypto";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config/env";

type CommonPayload = {
    userId: string;
    email: string;
    tokenId: string;
};

type AccessTokenPayload = CommonPayload & {
    type: "access";
};

type RefreshTokenPayload = CommonPayload & {
    type: "refresh";
};

const createAccessToken = (payload: CommonPayload) => {
    const accessPayload: AccessTokenPayload = {
        ...payload,
        type: "access",
    };

    const secret: Secret = config.accessTokenSecret;
    return jwt.sign(accessPayload, secret, {
        expiresIn: '15m',
    });
};

const createRefreshToken = (payload: CommonPayload) => {
    const refreshPayload: RefreshTokenPayload = {
        ...payload,
        type: "refresh",
    };

    const secret: Secret = config.refreshTokenSecret;
    return jwt.sign(refreshPayload, secret, {
        expiresIn: '7d',
    });
};

const verifyAccessToken = (token: string) => {
    const secret: Secret = config.accessTokenSecret;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    if (decoded.type !== "access") {
        throw new Error("Invalid access token");
    }
    return decoded as AccessTokenPayload;
};

const verifyRefreshToken = (token: string) => {
    const secret: Secret = config.refreshTokenSecret;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
    }
    return decoded as RefreshTokenPayload;
};

const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const generateTokenId = () => crypto.randomUUID();

export {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
    generateTokenId
};
