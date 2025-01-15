const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const authController = require("../controllers/authController");

// Routes d'authentification
router.post("/register", authController.registerAndAddUser);
router.post("/login", authController.loginUser);
router.get("/protected-route", authController.verifyToken, (req, res) => {
  res.status(200).json({ message: "Accès autorisé", user: req.user });
});

module.exports = router;
