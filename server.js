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
app.use(bot.webhookCallback(`/bot${process.env.TELEGRAM_BOT_API}`));
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
    // if (ctx.session.company_name) {
    ctx.reply("1) Type of message:\n1. Tech\n2. Non-Tech");
    ctx.session.command = ctx.message.text;
    return ctx.wizard.next();
    // } else {
    //   ctx.reply("1)Company Name:");
    //   ctx.session.company_name = ctx.message.text;
    //   console.log(ctx.chat, ctx.session, ctx.message.text);

    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    ctx.session.type = ctx.message.text === "1" ? "Tech" : "Non-Tech";
    ctx.session.groups = { Tech: -1001727141534, "Non-Tech": -1001727141534 };
    ctx.session.community =
      ctx.session.type === "Tech"
        ? "https://t.me/kodeverse/"
        : "https://t.me/kodeverseNT/";
    ctx.reply("2)Company Name: ");
    return ctx.wizard.next();
  },
  (ctx) => {
    // if (ctx.session.type) {
    ctx.session.company_name = ctx.message.text;
    ctx.reply("3) Job: Check Linkedin Page Job Posts | Thier  Career Site");
    ctx.reply("4) Domain: IT, Software, Product, Engineering, Management");
    ctx.session.job = "Check Linkedin Page Job Posts | Thier  Career Site";
    ctx.session.domain =
      ctx.session.type === "Tech"
        ? "IT, Software, Product, Engineering, Management"
        : "HR, Marketing, Operations, Finance, Sales";
    ctx.reply("5) Email:");
    return ctx.wizard.next();
    // } else {
    //   ctx.reply("2) Type:");

    //   ctx.session.type = ctx.message.text;
    //   console.log(ctx.chat, ctx.session, ctx.message.text);
    //   return ctx.wizard.next();
    // }
  },
  (ctx) => {
    ctx.session.email = ctx.message.text;
    ctx.reply(
      "6) Do you want message for:\n1. Telegram\n2.Twitter\n3.Linkedin"
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.message_for =
      ctx.message.text === "1"
        ? "Telegram"
        : ctx.message.text === "2"
        ? "Twitter"
        : "Linkedin";
    ctx.session.twitter_hashtags =
      "#portfolio #job #kodeverse #jobs #resume #hiring #share #cv #recruiting #career #" +
      ctx.session.company_name;
    if (ctx.session.message_for === "Telegram") {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Confirm & Send!", callback_data: "confirm" },
                { text: "Delete!", callback_data: "delete" },
              ],
            ],
          },
        }
      );
    } else if (ctx.session.message_for === "Twitter") {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
      );
      ctx.scene.leave();
    } else {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
      );
      ctx.scene.leave();
    }
    return ctx.wizard.next();
  }
);
superWizard.command("cancel", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Cancelled!!!");
});
superWizard.action("confirm", (ctx) => {
  bot.telegram.sendMessage(
    ctx.session.groups[ctx.session.type],
    `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`
  );
  ctx.reply("Message Send 👍");
  ctx.scene.leave();
});
superWizard.action("delete", (ctx) => {
  ctx.session = {};
  ctx.reply("Session Deleted!");
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
bot.launch();
