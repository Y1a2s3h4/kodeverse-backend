require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const Jobs = require("./models/jobs.models");
const cors = require("cors");

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.get("/get/jobs", async (req, res) => {
  try {
    const jobsData = await Jobs.find({});
    res.json(jobsData).status(200);
  } catch (error) {
    res.json({ error }).status(400);
  }
});
app.post("/create/job", async (req, res) => {
  try {
    const { company_logo, company_name, opening_site, type, email, tags } =
      req.body;
    const Job = await Jobs.create({
      company_logo,
      company_name,
      opening_site,
      type,
      email,
      tags,
    });
    console.log(Job);
    Job.save();
    res.json(Job).status(200);
  } catch (error) {
    res.json({ error }).status(400);
  }
});

app.listen(PORT, () =>
  console.log(
    String.fromCharCode(55357) + " Server Running on http://localhost:" + PORT
  )
);
