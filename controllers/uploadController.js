const bucket = require("../Config/Storage"); // Importer la config Firebase Storage
const { v4: uuidv4 } = require("uuid");

// Fonction pour uploader une image dans Firebase Storage
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image reçue." });
    }

    const file = req.file;
    const fileName = `uploads/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Configurer l'upload vers Firebase Storage
    const stream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    stream.on("error", (err) => {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'upload de l'image." });
    });

    stream.on("finish", async () => {
      // Rendre l'image publique
      await fileUpload.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      return res.status(200).json({
        message: "Image uploadée avec succès.",
        imageUrl: fileUrl,
      });
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'upload de l'image.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};
