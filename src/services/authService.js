// src/services/authService.js
const { GoogleAuth } = require("google-auth-library");
const config = require("../../config/config");

class AuthService {
  constructor() {
    this.auth = new GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }

  async getAccessToken() {
    const authClient = await this.auth.getClient();
    const token = await authClient.getAccessToken();
    return token.token;
  }
}

module.exports = new AuthService();
