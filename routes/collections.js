const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const collectionsController = require("../controllers/collectionsController");

router.post("/addCollection", collectionsController.addCollection);
router.post("/getCollections", collectionsController.getCollections);

// Exporter le router
module.exports = router;
