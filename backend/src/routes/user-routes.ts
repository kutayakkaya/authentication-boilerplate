import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import requireAuth from "../middlewares/require-auth";
import { getCurrentUser } from "../controllers/user-controller";

const router = Router();

router.get("/me", authenticate, requireAuth, getCurrentUser);

export default router;
