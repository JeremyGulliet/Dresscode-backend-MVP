var express = require("express");
var router = express.Router();

const Description = require("../models/descriptions");
const Article = require("../models/articles");

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

/* GET articles */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

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

/* POST description saisie par l'utilisateur (+url récupérée de cloudinary) */
router.post("/descriptions", (req, res) => {
  const { type, category, size, color, event } = req.body;
  const newDescription = new Description({
    type,
    category,
    size,
    color,
    event,
  });
  newDescription
    .save()
    .then((savedDescription) => {
      res.json({ result: true, newDescription: savedDescription });
    })
    .catch((error) => console.error(error));
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

module.exports = router;
