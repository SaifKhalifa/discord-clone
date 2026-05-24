const express = require("express");
const {
	register,
	login,
	confirmLogin,
	listSessions,
	revokeSession,
	me,
	getSession,
	logout
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login/confirm", confirmLogin);
router.get("/me", authMiddleware, me);
router.get("/session", authMiddleware, getSession);
router.get("/sessions", authMiddleware, listSessions);
router.post("/sessions/revoke", authMiddleware, revokeSession);
router.post("/logout", authMiddleware, logout);

module.exports = router;
