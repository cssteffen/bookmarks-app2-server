module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_KEY: process.env.API_KEY || "default-api",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/bookmarks"
};
