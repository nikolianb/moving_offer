try { require("dotenv").config(); } catch (_) {}

module.exports = {
  PORT: process.env.PORT || 3001,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
};
