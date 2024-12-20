const axios = require("axios");
const config = require("../../config/config");
const authService = require("./authService");
const memoryService = require("./memoryService");
const fs = require("fs");

// Load system prompt from JSON file
const systemPrompt = JSON.parse(
  fs.readFileSync("./config/systemPrompt.json", "utf8"),
);

class LLMService {
  constructor() {
    this.systemPrompt = {
      role: "system",
      content: `[System Message]
      Character: ${systemPrompt.character.name}
      Description: ${systemPrompt.character.description}
      Traits: Personality - ${systemPrompt.character.traits.personality}, Tone - ${systemPrompt.character.traits.tone}, Expertise - ${systemPrompt.character.traits.expertise.join(", ")}
      Behavior: Speaking Style - ${systemPrompt.behavior.speakingStyle}, Interactions - ${systemPrompt.behavior.interactions}, Quirks - ${systemPrompt.behavior.quirks.join(", ")}
      Context: Platform - ${systemPrompt.context.platform}, Strengths - ${systemPrompt.context.strengths.join(", ")}, Mission - ${systemPrompt.context.mission}, Limitations - ${systemPrompt.context.limitations}`,
    };
    this.memoryCache = new Map(); // In-memory cache for faster access
  }

  // Get relevant context from memory
  getRelevantContext(userId, limit = 10) {
    if (!this.memoryCache.has(userId)) {
      // Load from persistent storage only if not in cache
      const userMemory = memoryService.getUserMemory(userId);
      this.memoryCache.set(userId, userMemory);
    }

    const userMemory = this.memoryCache.get(userId);
    // Get only the most recent messages
    return userMemory.slice(-limit);
  }

  async generateResponse(userId, userMessage) {
    try {
      const accessToken = await authService.getAccessToken();

      // Construct messages array with efficient memory handling
      const recentContext = this.getRelevantContext(userId);
      const messages = [
        this.systemPrompt,
        ...recentContext,
        { role: "user", content: userMessage },
      ];

      const payload = {
        model: "meta/llama-3.1-405b-instruct-maas",
        stream: false,
        messages: messages,
        max_tokens: 1000, // Add max_tokens parameter
        temperature: 0.4, // Optional: Add other parameters as needed
        top_k: 10,
        top_p: 0.95,
        n: 1,
      };

      const response = await axios.post(config.GCP_ENDPOINT, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const reply =
        response.data.choices[0]?.message?.content || "No response.";

      // Update memory more efficiently
      this.updateMemory(userId, userMessage, reply);

      return reply;
    } catch (error) {
      console.error(
        "Error calling LLM endpoint:",
        error.response?.data || error.message,
      );
      return "Sorry, I encountered an error while processing your request.";
    }
  }

  updateMemory(userId, userMessage, assistantReply) {
    const currentMemory = this.memoryCache.get(userId) || [];

    // Add new messages
    const updatedMemory = [
      ...currentMemory,
      { role: "user", content: userMessage },
      { role: "assistant", content: assistantReply },
    ];

    // Keep only the last N messages
    const trimmedMemory = updatedMemory.slice(-10);

    // Update cache
    this.memoryCache.set(userId, trimmedMemory);

    // Persist to storage asynchronously
    memoryService.updateUserMemory(userId, trimmedMemory);
  }

  // Optional: Method to clear memory for a user
  clearMemory(userId) {
    this.memoryCache.delete(userId);
    memoryService.updateUserMemory(userId, []);
  }
}

module.exports = LLMService;
