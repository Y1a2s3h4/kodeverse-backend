require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const {
  Scenes,
  Composer,
  Stage,
  session,
  Markup,
  Telegraf,
} = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_API);
app.use(express.json());
app.use(cors());

let dirdata = fs.readdirSync(__dirname);
console.log(dirdata);
// const itemSelector = new Composer();
// itemSelector.action("redo", async (ctx) => {
//   await ctx.reply("Restarting Session!");
//   ctx.session = {};
//   console.log("Redo", ctx.wizard.selectStep(0));
//   await ctx.answerCbQuery();
//   return ctx.wizard.next();
// });
const superWizard = new Scenes.WizardScene(
  "super-wizard",
  (ctx) => {
    console.log(ctx.message, ctx?.callbackQuery?.message);
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
      for (let index in ctx.session.company_details) {
        setTimeout(() => {
          ctx.reply(
            `Company Name: ${ctx.session.company_details[index].name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.company_details[index].email}\n\nJoin Community: ${ctx.session.community}`
          );
        }, 1000 * index);
      }
      // for (let detail of ctx.session.company_details) {
      //   ctx.reply(
      //     `Company Name: ${detail.name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${detail.email}\n\nJoin Community: ${ctx.session.community}`
      //   );
      // }
      setTimeout(() => {
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
      }, 1000 * ctx.session.company_details.length);
    }
    return ctx.wizard.next();
  }
);
superWizard.command("/restart", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Cancelled!!!");
});
superWizard.action("confirm", (ctx) => {
  console.log("session: ", ctx.session);
  if (ctx.session.update === "one") {
    bot.telegram.sendMessage(
      ctx.session.groups[ctx.session.type],
      `Company Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\n\nJoin Community: ${ctx.session.community}`
    );
    console.log();
    fs.writeFile(
      "file.json",
      JSON.stringify(ctx.session, null, 2),
      {
        encoding: "utf-8",
      },
      function (err) {
        if (err) {
          console.log("Error occurred", err);
        } else {
          console.log("File write successfull");
        }
      }
    );
    ctx.reply("Message Send 👍");
    ctx.reply("Generating JSON File ⚙");
    setTimeout(() => {
      ctx
        .replyWithDocument({ source: "file.json" })
        .then((data) => {
          console.log(data);
          console.log("Before Unlink: ", dirdata);
          fs.unlink("file.json", (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("\nDeleted file: " + "file.json");
            }
          });
          console.log("After Unlink: ", dirdata);
        })
        .catch((err) => {
          console.log(err);
        });
    }, 2000);

    // ctx.scene.leave();
  } else {
    for (let index in ctx.session.company_details) {
      setTimeout(() => {
        console.log(
          "index: " + index + " " + ctx.session.company_details[index].name
        );
        bot.telegram.sendMessage(
          ctx.session.groups[ctx.session.type],
          `Company Name: ${ctx.session.company_details[index].name}\nType: ${ctx.session.type}\n\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.company_details[index].email}\n\nJoin Community: ${ctx.session.community}`
        );
      }, 10000 * index);
    }
    let lengthOfAllMessages = ctx.session.company_details.length - 1;
    setTimeout(() => {
      ctx.reply("All Message Send 👍");
      ctx.reply("Generating JSON File ⚙");
      fs.writeFile(
        "file.json",
        JSON.stringify(ctx.session, null, 2),
        {
          encoding: "utf-8",
        },
        function (err) {
          if (err) {
            console.log("Error occurred", err);
          } else {
            console.log("File write successfull");
          }
        }
      );
      ctx
        .replyWithDocument({ source: "file.json" })
        .then((data) => {
          console.log(data);
          console.log("Before Unlink: ", dirdata);
          fs.unlink("file.json", (err) => {
            if (err) {
              console.log("Error occurred", err);
            } else {
              console.log("File Deleted successfull");
            }
          });
          console.log("After Unlink: ", dirdata);
        })
        .catch((err) => {
          console.log(err);
        });
    }, lengthOfAllMessages * 10000);

    // ctx.scene.leave();
  }
});

// superWizard

superWizard.action("redo", (ctx) => {
  ctx.reply("Restarting Session!");
  ctx.session = {};
  ctx.reply("Please Click Here To Redo The Sesssion /start");

  // ctx.wizard.selectStep(0);
  // return ctx.wizard.step(ctx);
});
superWizard.action("stop", (ctx) => {
  ctx.session = {};
  ctx.reply("Session Stopped & Deleted!");
  ctx.scene.leave();
});
const stage = new Scenes.Stage([superWizard]);
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});
bot.use(session());
bot.use(stage.middleware());
bot.command("start", async (ctx) => {
  const chatMember = await bot.telegram.getChatMember(-514549590, 951422798);
  if (chatMember === "administrator" || "creator") {
    ctx.scene.enter("super-wizard");
  } else {
    ctx.reply("You are Not Admin ");
  }
  console.log(chatMember);
});

bot.hears("/show_message", (ctx) => {
  ctx.reply(
    `Your Message Looks Like This:-\n\nCompany Name: ${ctx.session.company_name}\nType: ${ctx.session.type}\nJob: ${ctx.session.job}\nDomain: ${ctx.session.domain}\nEmail: ${ctx.session.email}\nJoin Community: ${ctx.session.community}`
  );
});
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
