const { Client, GatewayIntentBits, Intents } = require("discord.js");
const config = require("../config/config");
const MessageHandler = require("./handlers/messageHandler");
const LLMService = require("./services/llmService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages, // Add DirectMessages intent
  ],
  partials: ["CHANNEL"], // Required to receive DMs
});

const llmService = new LLMService();
const messageHandler = new MessageHandler(llmService);

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ask") {
    const userMessage = options.getString("question");

    if (!userMessage) {
      await interaction.reply("Please provide a question or topic.");
      return;
    }

    await interaction.deferReply(); // Acknowledge the command to avoid timeout
    const response = await messageHandler.handleInteraction(
      interaction,
      userMessage,
    );
    for (const chunk of response) {
      await interaction.followUp(chunk);
    }
  }
});

client.on("messageCreate", async (message) => {
  // Check if the message is a DM and not from a bot
  if (message.channel.type === "DM" && !message.author.bot) {
    await message.channel.sendTyping();
    const response = await messageHandler.handleDM(message);
    for (const chunk of response) {
      await message.channel.send(chunk);
    }
  }
});

client.login(config.DISCORD_BOT_TOKEN);
