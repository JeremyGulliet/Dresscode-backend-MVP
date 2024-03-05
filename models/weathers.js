const mongoose = require("mongoose");

const weatherSchema = mongoose.Schema({
  type: String,
  temp_min: Number,
  temp_max: Number,
});

const Weather = mongoose.model("weathers", weatherSchema);

module.exports = Weather;
