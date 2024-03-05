var express = require("express");
var router = express.Router();

const Brand = require("../models/brands");

/* GET brands */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* POST ajout brand par l'utilisateur  */
router.post("/", (req, res) => {
  // console.log('req.body');
  const { name } = req.body;

  const newBrand = new Brand({
    name,
  });
  newBrand
    .save()
    .then((savedBrand) => {
      res.json({ result: true, newBrand: savedBrand });
    })
    .catch((error) => console.error(error));
});

module.exports = router;
