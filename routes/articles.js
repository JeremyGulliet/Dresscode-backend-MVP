var express = require("express");
var router = express.Router();

const Description = require("../models/descriptions");
const Article = require("../models/articles");

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

/* POST upload photo prise par l'utilisateur  */
router.post("/upload", async (req, res) => {
  // console.log(req.files.photoFromFront);

  const photoPath = `./tmp/${uniqid()}.jpg`;
  console.log(photoPath)
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);

    fs.unlinkSync(photoPath);

    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

});

/* POST article complet (photo > url) */

router.post("/", (req, res) => {
  const { weather, useDate, favorite, url_image, description, brand } =
    req.body;
  const newArticle = new Article({
    weather,
    useDate,
    favorite,
    url_image,
    description,
    brand,
  });
  newArticle
    .save()
    .then((savedArticle) => {
      res.json({ result: true, newArticle: savedArticle });
    })
    .catch((error) => console.error(error));
});

// Route pour récupérer un haut aléatoire
router.get("/random/tops", (req, res) => {
  Article.findOne({ favorite: 'false' })
    .then(top => {
      res.json({ imageUrl: top.url_image });
    })
    .catch(error => console.error(error));
});

// Route pour récupérer un bas aléatoire
router.get("/random/bottoms", (req, res) => {
  Article.findOne({ favorite: 'true' })
    .then(bottom => {
      //console.log(bottom)
      res.json({ imageUrl: bottom.url_image });
    })
    .catch(error => console.error(error));
});

// Route POST pour envoyer les photos importées de la photothèque vers Cloudinary

router.post("/import", async (req, res) => {
  const file = req.files.photoFromFront; // Obtenir le fichier envoyé dans la requête
  if (!file) {
    return res.status(400).json({ error: "Aucun fichier n'a été envoyé." });
  }

  const photoPath = `./tmp/${uniqid()}.jpg`;

  try {
    await file.mv(photoPath); // Déplacer le fichier vers un emplacement temporaire
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);

    // Supprimer le fichier temporaire
    fs.unlinkSync(photoPath);

    // Envoyer l'URL de l'image téléchargée comme réponse
    res.status(200).json({ result: true, url: resultCloudinary.secure_url });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image :", error);
    res.status(500).json({ error: "Erreur lors du téléchargement de l'image." });
  }
});

// Route DELETE pour suppression Cloudinary

router.delete('/deleteImage', async (req, res) => {
  const { imageUrl } = req.body;

  // Supprimer l'image de Cloudinary en utilisant l'URL imageUrl
  cloudinary.uploader.destroy(imageUrl, (error, result) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'image de Cloudinary:', error);
      res.sendStatus(500); // Envoyer une réponse d'erreur au frontend
    } else {
      console.log('Image supprimée de Cloudinary avec succès:', result);
      res.sendStatus(200); // Envoyer une réponse OK au frontend
    }
  });
});

module.exports = router;
