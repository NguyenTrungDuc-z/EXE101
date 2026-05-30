import { Request, Response } from "express";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

// Lấy hoặc tạo ví cho user
export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    }

    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy thông tin ví", error: err });
  }
};

// Nạp tiền vào ví
export const deposit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    // Tạo giao dịch nạp tiền
    await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: "deposit",
      amount,
      description: `Nạp tiền vào ví: ${amount.toLocaleString()}đ`,
      status: "completed",
    });

    res.json({ message: "Nạp tiền thành công", wallet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi nạp tiền", error: err });
  }
};

// Rút tiền từ ví
export const withdraw = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Ví không tồn tại" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Số dư không đủ" });
    }

    wallet.balance -= amount;
    await wallet.save();

    // Tạo giao dịch rút tiền
    await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: "withdraw",
      amount,
      description: `Rút tiền từ ví: ${amount.toLocaleString()}đ`,
      status: "completed",
    });

    res.json({ message: "Rút tiền thành công", wallet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi rút tiền", error: err });
  }
};

// Lấy lịch sử giao dịch
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate("relatedBooking")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy lịch sử giao dịch", error: err });
  }
};