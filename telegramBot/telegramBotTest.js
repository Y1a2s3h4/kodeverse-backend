const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_API);
bot.telegram.setWebhook(
  `${process.env.APP_URL}/bot${process.env.TELEGRAM_BOT_API}`
);
module.exports = bot;
