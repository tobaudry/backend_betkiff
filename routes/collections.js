const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const collectionsController = require("../controllers/collectionsController");

router.post("/addCollection", collectionsController.addCollection);
router.post("/getCollections", collectionsController.getCollections);
router.post("/addUrl", collectionsController.addUrl);
router.post("/getCollectionsWithConditionOnCard",collectionsController.getCollectionsWithConditionOnCard)

// Exporter le router
module.exports = router;
