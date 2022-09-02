require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { Scenes, Stage, session, Markup, Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_API);
app.use(express.json());
app.use(cors());

const superWizard = new Scenes.WizardScene(
  "super-wizard",
  (ctx) => {
    ctx.reply("1) Type of message:\n1. Tech\n2. Non-Tech");
    ctx.session.command = ctx.message.text;
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.type = ctx.message.text === "1" ? "Tech" : "Non-Tech";
    ctx.session.groups = { Tech: -514549590, "Non-Tech": -514549590 };
    ctx.session.community =
      ctx.session.type === "Tech"
        ? "https://t.me/kodeverse/"
        : "https://t.me/kodeverseNT/";
    ctx.reply("1) One Update\n2) Many Update");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.update = ctx.message.text === "1" ? "one" : "many";
    ctx.session.job = "Check Linkedin Page Job Posts | Thier  Career Site";
    ctx.session.domain =
      ctx.session.type === "Tech"
        ? "IT, Software, Product, Engineering, Management"
        : "HR, Marketing, Operations, Finance, Sales";
    // ctx.session.groups = { Tech: -1001727141534, "Non-Tech": -1001727141534 };
    // change community from string to array when type is both, Add both url as array elements

    ctx.reply("2) Company Name: \n3) Email: ");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.session.update === "one") {
      ctx.session.company_name = ctx.message.text.split("\n")[0];
      ctx.session.email = ctx.message.text.split("\n")[1];
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Confirm & Send!", callback_data: "confirm" },
                { text: "Redo!", callback_data: "redo" },
                { text: "Delete!", callback_data: "delete" },
              ],
            ],
          },
        }
      );
    } else {
      ctx.session.company_details = ctx.message.text.split("\n\n").map((e) => {
        return { name: e.split("\n")[0], email: e.split("\n")[1] };
      });
      for (let detail of ctx.session.company_details) {
        ctx.reply(
          `Company Name: ${detail.name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${detail.email}\n\nJoin Community: ${ctx.session.community}`
        );
      }
      bot.telegram.sendMessage(ctx.chat.id, `Perform Action`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Confirm & Send!", callback_data: "confirm" },
              { text: "Redo!", callback_data: "redo" },
              { text: "Stop!", callback_data: "stop" },
            ],
          ],
        },
      });
    }
    return ctx.wizard.next();
  }
);
superWizard.command("/restart", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Cancelled!!!");
});
superWizard.action("confirm", (ctx) => {
  if (ctx.session.update === "one") {
    bot.telegram.sendMessage(
      ctx.session.groups[ctx.session.type],
      `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`
    );
    ctx.reply("Message Send 👍");
    // ctx.scene.leave();
  } else {
    for (let index in ctx.session.company_details) {
      setTimeout(() => {
        bot.telegram.sendMessage(
          ctx.session.groups[ctx.session.type],
          `Company Name: ${ctx.session.company_details[index].name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.company_details[index].email}\n\nJoin Community: ${ctx.session.community}`
        );
      }, 10000 * index);
    }
    ctx.reply("All Message Send 👍");
    // ctx.scene.leave();
  }
});
superWizard.action("redo", (ctx) => {
  ctx.reply("Restarting Session!");
  ctx.session = {};
  ctx.scene.leave();
  ctx.scene.enter("super-wizard");
});
superWizard.action("stop", (ctx) => {
  ctx.session = {};
  ctx.reply("Session Stopped!");
  ctx.scene.leave();
});
const stage = new Scenes.Stage([superWizard]);
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});
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
