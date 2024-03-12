var express = require("express");
var router = express.Router();

const Description = require("../models/descriptions");
const Article = require("../models/articles");
const Weather = require("../models/weathers");

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

/* POST upload photo prise par l'utilisateur  */
router.post("/upload", async (req, res) => {
  // console.log(req.files.photoFromFront);

  const photoPath = `./tmp/${uniqid()}.jpg`;
  console.log(photoPath);
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
    res
      .status(500)
      .json({ error: "Erreur lors du téléchargement de l'image." });
  }
});

// Route DELETE pour suppression Cloudinary

router.delete("/deleteImage", async (req, res) => {
  const { imageUrl } = req.body;

  // Supprimer l'image de Cloudinary en utilisant l'URL imageUrl
  cloudinary.uploader.destroy(imageUrl, (error, result) => {
    if (error) {
      console.error(
        "Erreur lors de la suppression de l'image de Cloudinary:",
        error
      );
      res.sendStatus(500); // Envoyer une réponse d'erreur au frontend
    } else {
      console.log("Image supprimée de Cloudinary avec succès:", result);
      res.sendStatus(200); // Envoyer une réponse OK au frontend
    }
  });
});

// Route GET pour afficher les articles dans le dressing
router.get("/dressing", (req, res) => {
  Article.find({})
    .populate("description")
    .then((articles) => {
      res.json(articles);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/:favorite", async (req, res) => {
  const { favorite } = req.params; // Utilisez req.params pour obtenir les paramètres de l'URL

  // Récupération des articles selon la requête spécifiée
  Article.find({ favorite: true })
    .then((articles) => res.json(articles))
    .catch((error) => {
      console.error("Erreur lors de la récupération des articles :", error);
      res.status(500).json({ message: "Erreur serveur" });
    });
});

// Route GET pour afficher les articles selon la météo et la description
router.get("/dressing/homeArticle", async (req, res) => {
  const { type, temp_min, temp_max, category } = req.query;

  const articleFilter = {};

  // Filtrer par météo si des paramètres de météo sont fournis
  if (type || temp_min || temp_max) {
    const weatherFilter = {};
    if (type) weatherFilter.type = type;
    if (temp_min) weatherFilter.temp_min = temp_min;
    if (temp_max) weatherFilter.temp_max = temp_max;

    const weather = await Weather.find(weatherFilter);
    if (weather && weather.length > 0) {
      // Récupérer les IDs des météos correspondantes
      const weatherIds = weather.map((w) => w._id);
      // Ajouter les IDs dans le filtre des articles
      articleFilter.weather = { $in: weatherIds };
    }
  }

  // Filtrer par description si la catégorie est fournie
  if (category) {
    const descriptionFilter = { category: category };
    const descriptions = await Description.find(descriptionFilter);
    if (descriptions && descriptions.length > 0) {
      // Récupérer les IDs des descriptions correspondantes
      const descriptionIds = descriptions.map((d) => d._id);
      // Ajouter les IDs dans le filtre des articles
      articleFilter.description = { $in: descriptionIds };
    }
  }

  try {
    // Effectuer la requête pour les articles en utilisant le filtre combiné
    const articles = await Article.find(articleFilter);

    if (articles.length === 0) {
      return res.status(404).json({
        message: "Aucun article trouvé avec ces critères de recherche",
      });
    }

    res.json(articles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
module.exports = router;
