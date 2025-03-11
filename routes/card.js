const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const cardController = require("../controllers/cardController");

// Routes cartes
router.post("/openPack", cardController.openPack);
router.post("/openPackNew", cardController.openPackNew);
router.post("/getCards", cardController.getCards);
router.post("/migrateCard", cardController.migrateCard);

module.exports = router;
