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

module.exports = router;