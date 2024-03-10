require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if the username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    // Send the token in the response
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }).status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addTransaction = async (req, res) => {
  try {
    // Extract transaction data and user ID from request
    const userId = req.user.userId;
    const { amount, transactionType, description, transactionDate } = req.body;

    // Validate transaction data and user ID
    if (!transactionType || !amount) {
      return res.status(400).json({ message: "Transaction type and amount are required" });
    }

    const actualTransactionDate = transactionDate || new Date();
    // Create a new transaction object with user ID
    const newTransaction = await Transaction.create({
      userId,
      amount,
      transactionType,
      description,
      transactionDate: actualTransactionDate // Use current date if not provided
    });

    // Send a success response
    res.status(201).json({
      message: "Transaction added successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Check if both start date and end date are provided
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate are required query parameters",
      });
    }

    // Parse start and end dates as Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Retrieve transactions within the specified period
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.userId, // Assuming the user ID is stored in the JWT payload
        transactionDate: {
          [Op.gte]: start, // Greater than or equal to start date
          [Op.lte]: end,   // Less than or equal to end date
        },
      },
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Check if both start date and end date are provided
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate are required query parameters",
      });
    }

    // Parse start and end dates as Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Retrieve transactions within the specified period
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.userId, // Assuming the user ID is stored in the JWT payload
        transactionDate: {
          [Op.gte]: start, // Greater than or equal to start date
          [Op.lte]: end,   // Less than or equal to end date
        },
      },
    });

    // Calculate total income, total expenses, and savings
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach((transaction) => {
      if (transaction.transactionType === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.transactionType === "expense") {
        totalExpenses += transaction.amount;
      }
    });
    const savings = totalIncome - totalExpenses;

    // Determine message based on savings
    let message;
    if (savings > 0) {
      message = "You have savings.";
    } else if (savings === 0) {
      message = "Your savings are 0";
    } else {
      message = "Your expenses exceed your income.";
    }

    // Return summary and message in the response
    res.status(200).json({
      totalIncome,
      totalExpenses,
      savings: Math.max(savings, 0), // Ensure savings is non-negative
      message,
    });
  } catch (error) {
    console.error("Error retrieving transaction summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    // Delete the transaction based on ID and user ID
    const deletedTransaction = await Transaction.destroy({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (deletedTransaction === 0) {
      // If no transaction was deleted, return 404
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      deletedTransaction: id,
    });
  } catch (error) {
    console.error("Error deleting transaction :", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  register,
  login,
  addTransaction,
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
};
