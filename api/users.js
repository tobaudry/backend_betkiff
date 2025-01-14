const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/", usersController.getUsers);
router.post("/ById/:uid", usersController.getUserById);
router.post("/updateMonnaie", usersController.updateUserMoney);
router.delete("/deleteUsers/:userId", usersController.deleteUser);
router.put("/updateStatus", usersController.updateStatut);
router.put("/updateUserLastOpening", usersController.updateUserLastOpening);
router.get("/getIdOrgaByIdUser/:idUser", usersController.getIdOrgaByIdUser);

module.exports = (req, res) => router(req, res);
