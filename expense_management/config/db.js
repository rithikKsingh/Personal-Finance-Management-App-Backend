const { Sequelize } = require('sequelize');
require("dotenv").config();
// Initialize Sequelize with your database connection details
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'satao.db.elephantsql.com',
  port: 5432,
  username: process.env.username,
  password: process.env.password,
  database: process.env.database,
});

module.exports = sequelize;