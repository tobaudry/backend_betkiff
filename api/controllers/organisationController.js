const admin = require("firebase-admin");
const db = admin.database();
const crypto = require("crypto"); // Pour générer un token unique

const addOrganisation = (req, res) => {
  const { domain, admins, organisationName } = req.body;

  if (!domain || !admins || admins.length === 0 || !organisationName) {
    return res.status(400).json({
      error:
        "Le corps de la requête doit contenir un domaine, un nom d'organisation et au moins un administrateur.",
    });
  }

  const newOrganisationRef = db.ref("organisations").push();
  const token = crypto.randomBytes(32).toString("hex"); // Token unique

  const organisationWithId = {
    organisationName,
    domain,
    admins,
    idOrganisation: newOrganisationRef.key,
    token,
  };

  db.ref(`accessToken/${token}`)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        throw new Error("Collision de token détectée. Veuillez réessayer.");
      }
      return newOrganisationRef.set(organisationWithId);
    })
    .then(() => {
      const accesTokenInfo = {
        token,
        idOrganisation: newOrganisationRef.key,
      };
      return db.ref(`accessToken/${token}`).set(accesTokenInfo);
    })
    .then(() => {
      res.status(200).send({
        message: `Organisation ajoutée avec succès avec ID ${newOrganisationRef.key}!`,
        token: token,
        idOrganisation: newOrganisationRef.key,
        lien: `${process.env.BASE_URL || "http://localhost:3000"}/#/inscription/${newOrganisationRef.key}`,
      });
    })
    .catch((error) => {
      console.error("Erreur Firebase :", error);
      res.status(500).send(error.message);
    });
};

const getOrganisationIdFromToken = async (req, res) => {
  try {
    const { token } = req.params; // Récupère le token depuis les paramètres de la requête

    if (!token) {
      return res.status(400).json({ error: "Token manquant" });
    }

    // Référence à l'endroit précis dans Firebase
    const accessTokenRef = db.ref(`accessToken/${token}`);

    // Récupérer les données associées au token
    const snapshot = await accessTokenRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Organisation introuvable" });
    }

    const organisation = snapshot.val();

    // Retourner directement la valeur de l'idOrganisation
    res.status(200).json({ idOrganisation: organisation.idOrganisation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getOrganisationDomain = async (req, res) => {
  try {
    const { idOrganisation } = req.body;

    if (!idOrganisation) {
      return res.status(400).json({ error: "Nom de domaine manquant" });
    }

    // Référence à l'endroit précis dans Firebase
    const accesDomainOrganisation = db.ref(`organisations/${idOrganisation}`);

    // Récupérer les données associées au token
    const snapshot = await accesDomainOrganisation.get();

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Organisation introuvable" });
    }

    const organisation = snapshot.val();

    // Retourner directement la valeur de l'idOrganisation
    res.status(200).json({ domain: organisation.domain });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Exporter le controller
module.exports = {
  addOrganisation,
  getOrganisationIdFromToken,
  getOrganisationDomain,
};
