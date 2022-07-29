const mongoose = require("mongoose");
const Jobs = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  company_logo: String,
  company_name: String,
  job: String,
  domain: String,
  email: String,
  opening_site: String,
  type: String,
  tags: mongoose.Schema.Types.Mixed,
});
module.exports = mongoose.model("Jobscollections", Jobs);
