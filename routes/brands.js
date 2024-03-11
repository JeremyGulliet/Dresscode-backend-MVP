var express = require("express");
var router = express.Router();

const Brand = require("../models/brands");

// Route GET pour cherche une marque

router.get("/", async (req, res) => {
  const { name } = req.query; // Utilisation de req.query pour récupérer les paramètres de recherche

  const filter = {};
  if (name) filter.name = name;


  try {
    const brand = await Brand.find(filter);
    res.json(brand);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
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
