module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_KEY: process.env.API_KEY || "default-api",
  DB_URL:
    process.env.DB_URL || "postgresql://dunder_mifflin@localhost/bookmarks"
};
