const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const usersController = require("../controllers/usersController");

// Routes utilisateurs
router.get("/", usersController.getUsers);
router.get("/ById/:uid", usersController.getUserById);
router.post("/updateMonnaie", usersController.updateUserMoney);
router.delete("/deleteUsers/:userId", usersController.deleteUser);
router.put("/updateStatus", usersController.updateStatut);
router.put("/updateUserLastOpening", usersController.updateUserLastOpening);
router.get("/getIdOrgaByIdUser/:idUser", usersController.getIdOrgaByIdUser);

module.exports = router;
