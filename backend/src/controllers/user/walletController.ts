import { type Request, type Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { UserModel } from "../../models/User.js";
import { WalletTransactionModel } from "../../models/WalletTransaction.js";

export const getWalletHistory = asyncHandler(async (req: any, res: Response) => {
  const userCode = req.user.code;
  const transactions = await WalletTransactionModel.find({ userCode }).sort({ createdAt: -1 });
  res.json(transactions);
});

export const createWalletTransaction = asyncHandler(async (req: any, res: Response) => {
  const userCode = req.user.code;
  const { type, amount, bankName, bankAccount, accountHolder } = req.body;

  if (!type || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user = await UserModel.findOne({ code: userCode });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let newBalance = user.walletBalance || 0;

  if (type === "deposit") {
    newBalance += amount;
  } else if (type === "withdraw") {
    if (newBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    newBalance -= amount;
  }

  const transaction = await WalletTransactionModel.create({
    userCode,
    type,
    amount,
    description: type === "deposit" ? "Nạp tiền" : "Rút tiền",
    balanceBefore: user.walletBalance || 0,
    balanceAfter: newBalance,
    bankName,
    bankAccount,
    accountHolder,
    status: type === "deposit" ? "completed" : "pending"
  });

  await UserModel.findOneAndUpdate({ code: userCode }, { walletBalance: newBalance });

  res.json({ ...user.toObject(), walletBalance: newBalance });
});