import { Router } from "express";
import validateBody from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth-schemas";
import { register, login, logout, refresh } from "../controllers/auth-controller";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
