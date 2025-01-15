const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const organisationsController = require("../controllers/organisationController");

// Route pour ajouter une organisation
router.post("/addOrganisation", organisationsController.addOrganisation);
router.get(
  "/getOrganisationIdFromToken/:token",
  organisationsController.getOrganisationIdFromToken,
);
router.post(
  "/getOrganisationDomain",
  organisationsController.getOrganisationDomain,
);

// Exporter le router
module.exports = router;
