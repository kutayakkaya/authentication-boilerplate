import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/User";
import { createAccessToken, createRefreshToken, generateTokenId, hashToken, verifyRefreshToken } from "../utils/token-service";
import getRefreshCookieOptions from "../utils/cookie-options";

const refreshTokenLifetimeMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const buildAuthResponse = (userId: string, email: string, tokenId: string) => {
    const accessToken = createAccessToken({
        userId,
        email,
        tokenId
    });
    const refreshToken = createRefreshToken({
        userId,
        email,
        tokenId
    });
    return { accessToken, refreshToken };
};

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const existing = await UserModel.findOne({ email });

        if (existing) {
            res.status(409).json({ message: "Email is already in use." });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = new UserModel({
            email,
            passwordHash,
            refreshTokens: []
        });

        const tokenId = generateTokenId();
        const tokens = buildAuthResponse(user._id.toString(), email, tokenId);

        user.refreshTokens.push({
            tokenId,
            hashedToken: hashToken(tokens.refreshToken),
            expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
            createdAt: new Date()
        });
        await user.save();

        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        res.status(201).json({
            user: {
                id: user._id.toString(),
                email: user.email,
            },
            accessToken: tokens.accessToken,
            expiresIn: 15 * 60 // Seconds
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        const tokenId = generateTokenId();
        const tokens = buildAuthResponse(user._id.toString(), email, tokenId);

        user.refreshTokens.splice(0, user.refreshTokens.length);
        user.refreshTokens.push({
            tokenId,
            hashedToken: hashToken(tokens.refreshToken),
            expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
            createdAt: new Date()
        });
        await user.save();

        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        res.json({
            user: {
                id: user._id.toString(),
                email: user.email
            },
            accessToken: tokens.accessToken,
            expiresIn: 15 * 60 // Seconds
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            try {
                const payload = verifyRefreshToken(token);
                const user = await UserModel.findById(payload.userId);
                if (user) {
                    const filtered = user.refreshTokens.filter((stored) => stored.tokenId !== payload.tokenId);
                    user.refreshTokens.splice(0, user.refreshTokens.length, ...filtered);
                    await user.save();
                }
            } catch (error) {
                // Ignore verification errors
            }
        }

        res.clearCookie("refreshToken", getRefreshCookieOptions());
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401).json({ message: "Unable to refresh session." });
            return;
        }

        const payload = verifyRefreshToken(token);
        const user = await UserModel.findById(payload.userId);
        if (!user) {
            res.status(401).json({ message: "Unable to refresh session." });
            return;
        }

        // If no matching refresh token is found, clear all tokens for security
        const hashed = hashToken(token);
        const existingToken = user.refreshTokens.find((stored) => stored.tokenId === payload.tokenId && stored.hashedToken === hashed);
        if (!existingToken) {
            user.refreshTokens.splice(0, user.refreshTokens.length);
            await user.save();
            res.status(401).json({ message: "Unable to refresh session." });
            return;
        }

        // Check if the refresh token is expired
        if (existingToken.expiresAt.getTime() < Date.now()) {
            const remaining = user.refreshTokens.filter((stored) => stored.tokenId !== payload.tokenId);
            user.refreshTokens.splice(0, user.refreshTokens.length, ...remaining);
            await user.save();
            res.status(401).json({ message: "Session has expired." });
            return;
        }

        // Clean up expired refresh tokens
        const validTokens = user.refreshTokens.filter((stored) => stored.expiresAt.getTime() > Date.now());

        if (validTokens.length !== user.refreshTokens.length) {
            user.refreshTokens.splice(0, user.refreshTokens.length, ...validTokens);
        }

        // Refresh logic
        const withoutCurrent = user.refreshTokens.filter((stored) => stored.tokenId !== payload.tokenId);
        user.refreshTokens.splice(0, user.refreshTokens.length, ...withoutCurrent);

        const newTokenId = generateTokenId();
        const tokens = buildAuthResponse(user._id.toString(), user.email, newTokenId);

        user.refreshTokens.push({
            tokenId: newTokenId,
            hashedToken: hashToken(tokens.refreshToken),
            expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
            createdAt: new Date()
        });

        await user.save();

        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        res.json({
            accessToken: tokens.accessToken,
            expiresIn: 900
        });
    } catch (error) {
        res.clearCookie("refreshToken", getRefreshCookieOptions());
        next(error);
    }
};

export { register, login, logout, refresh };
