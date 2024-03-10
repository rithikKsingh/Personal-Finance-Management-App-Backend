const express = require("express");
const helmet = require('helmet');
const sequelize = require("./config/db"); // Import Sequelize instance
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const limiter=require("./middleware/rateLimit");

const app = express();
const PORT = 3200;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(limiter);

// Sync Sequelize models with the database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');
    await sequelize.sync(); // Sync all defined models with the database
    console.log('All models synced successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

app.get("/", (req, res) => {
  res.send("Hello");
});

// Use user routes
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
