const weatherSchema = mongoose.Schema({
  type: String,
  temp_min: Number,
  temp_max: Number,
});

const weather = mongoose.model("weathers", weatherSchema);
