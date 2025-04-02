import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkAuth, signup, login, logout } from "../controllers/auth.js";

const router = express.Router();
router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
