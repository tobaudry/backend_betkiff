const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const cardController = require("../controllers/cardController");

// Routes cartes
router.post("/openPack", cardController.openPack);

module.exports = router;
