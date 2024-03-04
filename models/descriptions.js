const descriptionSchema = mongoose.Schema({
  type: String,
  category: String,
  size: String || Number,
  color: String,
  event: String,
});

const Description = mongoose.model("descriptions", descriptionSchema);
