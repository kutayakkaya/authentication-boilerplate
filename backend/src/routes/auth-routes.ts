import { Router } from "express";
import validateBody from "../middlewares/validate";
import { registerRateLimiter, loginRateLimiter } from "../middlewares/rate-limiters";
import { loginSchema, registerSchema } from "../validations/auth-schemas";
import { register, login, logout, refresh } from "../controllers/auth-controller";

const router = Router();

router.post("/register", registerRateLimiter, validateBody(registerSchema), register);
router.post("/login", loginRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
