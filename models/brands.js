const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
  name: null || String,
});

const Brand = mongoose.model("brands", brandSchema);

module.exports = Brand;
