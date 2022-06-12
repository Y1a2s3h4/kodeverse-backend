const mongoose = require("mongoose");

const Jobs = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  company_logo: String,
  company_name: String,
  opening_site: String,
  type: String,
  email: String,
});
module.exports = mongoose.model("Jobscollections", Jobs);
