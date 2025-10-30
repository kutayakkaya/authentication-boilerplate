import "express-serve-static-core";

type AuthenticatedUser = {
    id: string;
    email: string;
    tokenId: string;
};

declare module "express-serve-static-core" {
    interface Request {
        authenticatedUser?: AuthenticatedUser;
    }
}