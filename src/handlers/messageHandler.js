class MessageHandler {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async handleMessage(message) {
    if (message.author.bot || !message.content.startsWith("!ask")) return;

    const userMessage = message.content.slice(4).trim();

    if (!userMessage) {
      await message.reply("Please provide a question or topic after `!ask`.");
      return;
    }

    await message.channel.sendTyping();
    const response = await this.llmService.generateResponse(
      message.author.id,
      userMessage,
    );

    // Split response into chunks only if it exceeds 2000 characters
    const chunks = this.splitMessage(response, 2000);

    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  }

  splitMessage(text, maxLength) {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + maxLength;
      if (end > text.length) {
        end = text.length;
      } else {
        // Ensure we don't split in the middle of a word
        while (end > start && !/\s/.test(text[end])) {
          end--;
        }
        if (end === start) {
          end = start + maxLength; // If no space found, split at maxLength
        }
      }
      chunks.push(text.slice(start, end));
      start = end;
    }

    return chunks;
  }
}

module.exports = MessageHandler;
