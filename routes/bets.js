const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const betsController = require("../controllers/betsController");

// Routes commune
router.post("/getBets", betsController.getBets);
router.post("/getBetByID/:idBet", betsController.getBetById);
router.post("/toggleBettingStatus/:idBet", betsController.toggleBettingStatus);

// Routes Bets 
router.post("/addBets", betsController.addBets);
router.post("/placerBets", betsController.placeBet);
router.post("/calculateWinningBet", betsController.calculateWinningsBets);
router.put("/updateBets/:id", betsController.updateBets);

// Routes MiniBets
router.post("/getMiniBets", betsController.getMiniBets);
router.post("/getFlash", betsController.getFlash);
router.post("/viewFlashOrNot", betsController.checkUserViewedFlash);
router.post(
  "/calculateWinningMiniBet",
  betsController.calculateWinningsMiniBets,
);
router.put("/updateMiniBets/:idBet", betsController.updateMiniBets);

// Routes Flash 
router.post("/markAsViewFlash", betsController.markFlashAsViewed);
router.delete("/deleteFlash", betsController.deleteFlash);
router.post("/pushUserInListAgreeFlash", betsController.pushUserInListAgreeFlash)


// Exporter le router
module.exports = router;
