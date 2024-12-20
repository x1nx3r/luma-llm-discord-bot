const { REST, Routes } = require("discord.js");
const config = require("./config/config");

const commands = [
  {
    name: "ask",
    description: "Ask a question or provide a topic",
    options: [
      {
        name: "question",
        type: 3, // Correct type for STRING
        description: "The question or topic you want to ask about",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(config.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands("1089415753998028901"), // Register globally
      { body: commands },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
