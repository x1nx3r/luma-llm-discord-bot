// src/services/memoryService.js
const fs = require("fs");
const config = require("../../config/config");

class MemoryService {
  constructor() {
    this.memory = {};
    this.loadMemory();
    this.setupPeriodicSave();
  }

  loadMemory() {
    if (fs.existsSync(config.MEMORY_FILE)) {
      try {
        this.memory = JSON.parse(fs.readFileSync(config.MEMORY_FILE, "utf8"));
      } catch (error) {
        console.error("Error loading memory:", error);
        this.memory = {};
      }
    }
  }

  setupPeriodicSave() {
    // Save memory every 5 minutes
    setInterval(() => this.saveMemory(), 5 * 60 * 1000);
  }

  saveMemory() {
    try {
      fs.writeFileSync(
        config.MEMORY_FILE,
        JSON.stringify(this.memory, null, 2),
      );
      console.log("Memory saved successfully");
    } catch (error) {
      console.error("Error saving memory:", error);
    }
  }

  getUserMemory(userId) {
    return this.memory[userId] || [];
  }

  updateUserMemory(userId, messages) {
    this.memory[userId] = messages;
    this.saveMemory(); // Save immediately for debugging purposes
  }
}

module.exports = new MemoryService();
