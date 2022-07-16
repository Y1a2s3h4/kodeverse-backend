require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const Jobs = require("./models/jobs.models");
const cors = require("cors");
const rwClient = require("./tweetClient/tweetClient.js");
const bot = require("./telegramBot/telegramBotTest.js");
const axios = require("axios");
const { Scenes, Stage, session, Markup } = require("telegraf");
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.post("/tweet", async (req, res) => {
  const { tweet_body } = req.body;
  try {
    const data = await rwClient.v1.tweet(tweet_body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

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
    const {
      company_logo,
      company_name,
      opening_site,
      type,
      email,
      tags,
      job,
      domain,
    } = req.body;
    const Job = await Jobs.create({
      company_logo,
      company_name,
      opening_site,
      type,
      email,
      tags,
      job,
      domain,
    });
    Job.save();
    res.json(Job).status(200);
  } catch (error) {
    res.json({ error }).status(400);
  }
});
app.patch("/update/job", async (req, res) => {
  try {
    const {
      _id,
      company_logo,
      company_name,
      opening_site,
      type,
      email,
      tags,
      job,
      domain,
    } = req.body;
    await Jobs.updateOne(
      { _id },
      {
        company_logo,
        company_name,
        opening_site,
        type,
        email,
        tags,
        job,
        domain,
      }
    );
    const jobsData = await Jobs.find({});
    res.json(jobsData).status(200);
  } catch (error) {
    res.json({ error }).status(400);
  }
});
app.delete("/delete/job", async (req, res) => {
  try {
    const { jobId } = req.query;
    await Jobs.deleteOne({ _id: jobId });
    const jobsData = await Jobs.find({});
    res.json(jobsData).status(200);
  } catch (error) {
    res.json({ error }).status(400);
  }
});

app.listen(PORT, () =>
  console.log("🔥 Server Running on http://localhost:" + PORT)
);

// bot.action("message_func", (ctx) => {
//   ctx.reply("Enter Your Message In The Given Format");
// });

const superWizard = new Scenes.WizardScene(
  "super-wizard",
  (ctx) => {
    if (+ctx.chat.id < 0) {
      return;
    }
    ctx.reply("Start\n1)Company Name");
    ctx.session.command = ctx.message.text;
    console.log(ctx.chat, ctx.session, ctx.message.text);

    return ctx.wizard.next();
  },
  (ctx) => {
    // if (ctx.session.company_name) {
    ctx.reply("2) Type:");

    ctx.session.company_name = ctx.message.text;
    console.log(ctx.chat, ctx.session, ctx.message.text);
    return ctx.wizard.next();
    // } else {
    //   ctx.reply("1)Company Name:");
    //   ctx.session.company_name = ctx.message.text;
    //   console.log(ctx.chat, ctx.session, ctx.message.text);

    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    // if (ctx.session.type) {
    ctx.reply("3) Job:");
    ctx.session.type = ctx.message.text;
    console.log(ctx.chat, ctx.session);
    return ctx.wizard.next();
    // } else {
    //   ctx.reply("2) Type:");

    //   ctx.session.type = ctx.message.text;
    //   console.log(ctx.chat, ctx.session, ctx.message.text);
    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    // if (ctx.session.job) {

    ctx.reply("4) Domain:");
    ctx.session.job = ctx.message.text;
    console.log(ctx.chat, ctx.session);
    return ctx.wizard.next();
    // } else {
    //   console.log(ctx.chat, ctx.session);
    //   ctx.reply("3) Job:");
    //   ctx.session.job = ctx.message.text;
    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    // if (ctx.session.domain) {

    ctx.reply("5) Email:");
    ctx.session.domain = ctx.message.text;
    console.log(ctx.chat, ctx.session);
    return ctx.wizard.next();
    // } else {
    //   console.log(ctx.chat, ctx.session);

    //   ctx.reply("4) Domain:");
    //   ctx.session.domain = ctx.message.text;
    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    // if (ctx.session.community) {
    ctx.session.email = ctx.message.text;

    ctx.session.groups = { 1: -1001727141534 };
    console.log(ctx.chat, ctx.session);
    ctx.reply(
      "In which group this message you want to share: \n1) testing group"
    );
    return ctx.wizard.next();
    // } else {
    //   console.log(ctx.chat, ctx.session);

    //   ctx.reply("7) Join community:");
    //   ctx.session.community = ctx.message.text;
    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    ctx.session.group_no = ctx.message.text;
    console.log(ctx.chat, ctx.session);
    ctx.reply("Now run command '/send' to share this message in group.");
    return ctx.wizard.next();
  }
);
superWizard.command("cancel", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Cancelled!!!");
});
superWizard.command("send", (ctx) => {
  bot.telegram.sendMessage(
    ctx.session.groups[ctx.session.group_no],
    `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community:`
  );
  ctx.scene.leave();
});
const stage = new Scenes.Stage([superWizard]);
bot.use(session());
bot.use(stage.middleware());
bot.command("start", (ctx) => {
  ctx.scene.enter("super-wizard");
});

bot.hears("/show_message", (ctx) => {
  ctx.reply(
    `Your Message Looks Like This:-\n\nCompany Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nHashtags: ${ctx.session.hashtags}\nJoin Community: ${ctx.session.community}`
  );
});
bot.command("send", (ctx) => {
  bot.telegram.sendMessage(
    ctx.session.groups[ctx.session.group_no],
    `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}`
  );
});
bot.launch();
