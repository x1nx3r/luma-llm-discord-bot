// src/bot.js
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("../config/config");
const MessageHandler = require("./handlers/messageHandler");
const LLMService = require("./services/llmService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize services
const llmService = new LLMService();
const messageHandler = new MessageHandler(llmService);

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}!`);
});

// Use bind to ensure 'this' context is preserved
client.on("messageCreate", messageHandler.handleMessage.bind(messageHandler));

client.login(config.DISCORD_BOT_TOKEN);
