const admin = require("firebase-admin");

const db = admin.database();

// Ajouter un pari
const addCollection = (req, res) => {
  const { path, data } = req.body;
  if (!path || !data) {
    return res
      .status(400)
      .send("Le corps de la requête doit contenir path et data");
  }

  const newCollectionRef = db.ref(path).push();

  // Ajout de l'ID généré dans les données
  const collectionWithId = {
    ...data,
    idCollection: newCollectionRef.key,
  };

  newCollectionRef
    .set(collectionWithId)
    .then(() =>
      res
        .status(200)
        .send(`${path} ajouté avec succès avec ID ${newCollectionRef.key}!`)
    )
    .catch((error) => {
      console.error("Erreur Firebase :", error);
      res.status(500).send(error.message);
    });
};
