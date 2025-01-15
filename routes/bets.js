const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const betsController = require("../controllers/betsController");

// Routes d'authentification
router.post("/addBets", betsController.addBets);
router.post("/getBets", betsController.getBets);
router.post("/getMiniBets", betsController.getMiniBets);
router.post("/getFlash", betsController.getFlash);
router.post("/viewFlashOrNot", betsController.checkUserViewedFlash);
router.post("/placerBets", betsController.placeBet);
router.post("/calculateWinningBet", betsController.calculateWinningsBets);
router.post(
  "/calculateWinningMiniBet",
  betsController.calculateWinningsMiniBets,
);
// router.get("/", BetsController.);

router.post("/getBetByID/:idBet", betsController.getBetById);
router.post("/toggleBettingStatus/:idBet", betsController.toggleBettingStatus);
router.post("/markAsViewFlash", betsController.markFlashAsViewed);
router.put("/updateBets/:id", betsController.updateBets);
router.put("/updateMiniBets/:idBet", betsController.updateMiniBets);
router.delete("/deleteFlash", betsController.deleteFlash);

// Exporter le router
module.exports = router;
