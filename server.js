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
    ctx.reply("1) Type of message:\n1. Tech\n2. Non-Tech\n3. Both");
    ctx.session.command = ctx.message.text;
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.type =
      ctx.message.text === "1"
        ? "Tech"
        : ctx.message.text === "2"
        ? "Non-Tech"
        : "Both";
    ctx.session.groups = { Tech: -514549590, "Non-Tech": -514549590 };
    // ctx.session.groups = { Tech: -1001727141534, "Non-Tech": -1001727141534 };
    // change community from string to array when type is both, Add both url as array elements
    ctx.session.community =
      ctx.session.type === "Tech"
        ? "https://t.me/kodeverse/"
        : ctx.session.type === "Non-Tech"
        ? "https://t.me/kodeverseNT/"
        : "https://t.me/kodeverse/,https://t.me/kodeverse/NT";
    ctx.reply("2) Company Name: ");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.company_name = ctx.message.text;
    // think about domain what to do when type is Both.
    ctx.session.domain =
      ctx.session.type === "Tech"
        ? "IT, Software, Product, Engineering, Management"
        : ctx.session.type === "Non-Tech"
        ? "HR, Marketing, Operations, Finance, Sales"
        : "Tech: IT, Software, Product, Engineering, Management, Non-Tech: HR, Marketing, Operations, Finance, Sales.";
    ctx.reply("3) Job: Check Linkedin Page Job Posts | Thier  Career Site");
    ctx.reply("4) Domain: " + ctx.session.domain);
    ctx.session.job = "Check Linkedin Page Job Posts | Thier  Career Site";
    ctx.reply("5) Email:");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.email = ctx.message.text;
    ctx.reply(
      "6) Do you want message for:\n1. Telegram\n2. Twitter\n3. Linkedin\n4. For All 3"
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.message_for =
      ctx.message.text === "1"
        ? "Telegram"
        : ctx.message.text === "2"
        ? "Twitter"
        : ctx.message.text === "3"
        ? "Linkedin"
        : "All";
    ctx.session.twitter_hashtags =
      "#portfolio #job #kodeverse #jobs #resume #hiring #share #cv #recruiting #career #" +
      ctx.session.company_name;
    if (ctx.session.message_for === "Telegram") {
      if (ctx.session.type.toLowerCase() !== "both") {
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
      } else {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: ${"Tech"}\n\nJob: ${
            ctx.session.job
          }\nDomain: ${"IT, Software, Product, Engineering, Management"}\nEmail: ${
            ctx.session.email
          }\n\nJoin Community: ${ctx.session.community.split(",")[0]}`
        );
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${
            ctx.session.company_name
          }\nType: ${"Non-Tech"}\n\nJob: ${
            ctx.session.job
          }\nDomain: ${"HR, Marketing, Operations, Finance, Sales"}\nEmail: ${
            ctx.session.email
          }\n\nJoin Community: ${ctx.session.community.split(",")[1]}`
        );
        setTimeout(() => {
          bot.telegram.sendMessage(ctx.chat.id, `Choose Actions From Below!`, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Confirm & Send!", callback_data: "confirm" },
                  { text: "Delete!", callback_data: "delete" },
                ],
              ],
            },
          });
        }, 1000);
      }
      console.log(ctx.session);
    } else if (ctx.session.message_for === "Twitter") {
      if (ctx.session.type.toLowerCase() !== "both") {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
        );
        ctx.scene.leave();
      } else {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: Tech\nJob: ${ctx.session.job}\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverse/\n${ctx.session.twitter_hashtags}`
        );
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: Non-Tech\nJob: ${ctx.session.job}\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverseNT/\n${ctx.session.twitter_hashtags}`
        );
        ctx.scene.leave();
      }
    } else if (ctx.session.message_for === "Linkedin") {
      if (ctx.session.type.toLowerCase() !== "both") {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
        );
        ctx.scene.leave();
      } else {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: Tech\nJob: ${ctx.session.job}\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverse/\n${ctx.session.twitter_hashtags}`
        );
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Company Name: ${ctx.session.company_name}\nType: Non-Tech\nJob: ${ctx.session.job}\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverseNT/\n${ctx.session.twitter_hashtags}`
        );
      }
    } else {
      if (ctx.session.type.toLowerCase() !== "both") {
        // add here a condition for if type == Both, if true create 6 messages , 3 for tech and 3 for non-tech
        ctx.reply(
          `Telegram\n\nCompany Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`
        );

        ctx.reply(
          `Twitter\n\nCompany: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: Check Linkedin Job Posts | Career Site\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Us: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
        );

        ctx.reply(
          `Linkedin\n\nCompany Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: Check Linkedin Job Posts | Career Site\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}\n${ctx.session.twitter_hashtags}`
        );
      } else {
        ctx.reply(
          `Telegram\n\nCompany Name: ${ctx.session.company_name}\nType: Tech\n\nJob: ${ctx.session.job}\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\n\nJoin Community: https://t.me/kodeverse/`
        );

        ctx.reply(
          `Twitter\n\nCompany: ${ctx.session.company_name}\nType: Tech\nJob: Check Linkedin Job Posts | Career Site\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\nJoin Us: https://t.me/kodeverse/\n${ctx.session.twitter_hashtags}`
        );

        ctx.reply(
          `Linkedin\n\nCompany Name: ${ctx.session.company_name}\nType: Tech\nJob: Check Linkedin Job Posts | Career Site\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverse/\n${ctx.session.twitter_hashtags}`
        );
        ctx.reply(
          `Telegram\n\nCompany Name: ${ctx.session.company_name}\nType: Non-Tech\n\nJob: ${ctx.session.job}\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\n\nJoin Community: https://t.me/kodeverseNT/`
        );

        ctx.reply(
          `Twitter\n\nCompany: ${ctx.session.company_name}\nType: Non-Tech\nJob: Check Linkedin Job Posts | Career Site\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\nJoin Us: https://t.me/kodeverseNT/\n${ctx.session.twitter_hashtags}`
        );

        ctx.reply(
          `Linkedin\n\nCompany Name: ${ctx.session.company_name}\nType: Non-Tech\nJob: Check Linkedin Job Posts | Career Site\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\nJoin Community: https://t.me/kodeverseNT/\n${ctx.session.twitter_hashtags}`
        );
      }
    }
    return ctx.wizard.next();
  }
);
superWizard.command("/restart", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Cancelled!!!");
});
superWizard.action("confirm", (ctx) => {
  if (ctx.session.type.toLowerCase() !== "both") {
    bot.telegram.sendMessage(
      ctx.session.groups[ctx.session.type],
      `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`
    );
    ctx.reply("Message Send 👍");
    ctx.scene.leave();
  } else {
    bot.telegram.sendMessage(
      ctx.session.groups["Tech"],
      `Company Name: ${ctx.session.company_name}\nType: Tech\n\nJob: ${ctx.session.job}\nDomain: IT, Software, Product, Engineering, Management.\nEmail: ${ctx.session.email}\n\nJoin Community: https://t.me/kodeverse/`
    );
    bot.telegram.sendMessage(
      ctx.session.groups["Non-Tech"],
      `Company Name: ${ctx.session.company_name}\nType: Non-Tech\n\nJob: ${ctx.session.job}\nDomain: HR, Marketing, Operations, Finance, Sales.\nEmail: ${ctx.session.email}\n\nJoin Community: https://t.me/kodeverseNT/`
    );
    ctx.reply("Message Send 👍");
    ctx.scene.leave();
  }
});
superWizard.action("delete", (ctx) => {
  ctx.session = {};
  ctx.reply("Session Deleted!");
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
