// transaction.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  transactionType: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = Transaction;
