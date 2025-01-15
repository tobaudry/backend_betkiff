// controllers/CardController.js
const admin = require("../Config/Firebase");
const db = admin.database();
const { get } = require("firebase/database");

// Probabilités globales
const PROBA_GOLD = 0.01;
const PROBA_OBJECT = 0.1;
const PROBA_PREZ = 0.3;

const openPack = async (req, res) => {
  const { idUser, cardsData, idOrganisation } = req.body;
  try {
    const randomNumber = Math.random(); // Génère un nombre entre 0 et 1

    let drawnCard;
    if (randomNumber < PROBA_GOLD) {
      drawnCard = cardsData.goldCard[0]; // Une seule carte Gold
    } else if (randomNumber < PROBA_OBJECT) {
      drawnCard =
        cardsData.objectCards[
          Math.floor(Math.random() * cardsData.objectCards.length)
        ];
    } else if (randomNumber < PROBA_PREZ) {
      drawnCard =
        cardsData.prezCards[
          Math.floor(Math.random() * cardsData.prezCards.length)
        ];
    } else {
      drawnCard =
        cardsData.possibleCards[
          Math.floor(Math.random() * cardsData.possibleCards.length)
        ];
    }

    // Ajoute ou met à jour la carte dans la collection
    const userRef = db.ref(
      `organisations/${idOrganisation}/users/${idUser}/collection`,
    );
    const cardRef = db.ref(
      `organisations/${idOrganisation}/users/${idUser}/collection/${drawnCard.title}`,
    );

    const snapshot = await get(cardRef);

    if (snapshot.exists()) {
      const currentDoublon = snapshot.val().doublon || 1;
      await cardRef.update({ doublon: currentDoublon + 1 });
    } else {
      await userRef.update({
        [drawnCard.title]: { doublon: 1 },
      });
    }

    res.status(200).json({ success: true, card: drawnCard });
  } catch (error) {
    console.error("Erreur lors de l'ouverture du pack :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  openPack,
};
