const express = require("express");
const {
	register,
	login,
	me,
	getSession,
	logout
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.get("/session", authMiddleware, getSession);
router.post("/logout", authMiddleware, logout);

module.exports = router;
