const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middleware/authenticate");
const {
  register,
  login,
  addTransaction,
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);

router.use(authenticateMiddleware);

router.post("/transaction", addTransaction);
router.get("/transaction", getTransactions);
router.get("/transaction/summary", getTransactionSummary);
router.delete("/transaction/:id", deleteTransaction);

module.exports = router;
