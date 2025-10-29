import { Schema, InferSchemaType, model } from "mongoose";

const refreshTokenSchema = new Schema({
    tokenId: { type: String, required: true },
    hashedToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: () => new Date(), required: true },
}, { _id: false });

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
}, { timestamps: true });

type User = InferSchemaType<typeof userSchema>;

const UserModel = model("User", userSchema);

export type UserDocument = User & { _id: string };

export default UserModel;