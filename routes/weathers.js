var express = require("express");
var router = express.Router();

const Weather = require("../models/weathers");

/* GET weathers */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* POST ajout weather par l'utilisateur  */
router.post("/", (req, res) => {
  // console.log('req.body');
  const { type, temp_min, temp_max } = req.body;

  const newWeather = new Weather({
    type,
    temp_min,
    temp_max,
  });
  newWeather
    .save()
    .then((savedWeather) => {
      res.json({ result: true, newWeather: savedWeather });
    })
    .catch((error) => console.error(error));
});

module.exports = router;
