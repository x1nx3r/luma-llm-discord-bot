class MessageHandler {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async handleInteraction(interaction, userMessage) {
    await interaction.channel.sendTyping();
    const response = await this.llmService.generateResponse(
      interaction.user.id,
      userMessage,
    );

    // Split response into chunks only if it exceeds 2000 characters
    return this.splitMessage(response, 2000);
  }

  async handleDM(message) {
    const response = await this.llmService.generateResponse(
      message.author.id,
      message.content,
    );

    // Split response into chunks only if it exceeds 2000 characters
    return this.splitMessage(response, 2000);
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
