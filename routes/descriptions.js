var express = require("express");
var router = express.Router();

const Description = require("../models/descriptions");

/* POST description saisie par l'utilisateur (+url récupérée de cloudinary) */

router.post("/", (req, res) => {
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

// Route GET pour cherche une description

router.get("/", async (req, res) => {
    const { type, color, event, size, category } = req.query; // Utilisation de req.query pour récupérer les paramètres de recherche

    const filter = {};
    if (type) filter.type = type;
    if (color) filter.color = color;
    if (event) filter.event = event;
    if (size) filter.size = size;
    if (category) filter.category = category

    try {
        const description = await Description.find(filter);
        res.json(description);
    } catch (error) {
        console.error('Erreur lors de la récupération des articles :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;