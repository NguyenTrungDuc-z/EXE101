import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { OrderModel } from "../../models/Order.js";
import { ReviewModel } from "../../models/Review.js";
import { MaterialListModel } from "../../models/MaterialList.js";
import { UserModel } from "../../models/User.js";
import { CandidateProfileModel } from "../../models/CandidateProfile.js";
import { generateCode } from "../../utils/generateCode.js";
import { WalletTransactionModel } from "../../models/WalletTransaction.js";

export const featureController = {
  // === REVIEW ===
  createReview: asyncHandler(async (req: any, res: Response) => {
    const { orderCode, rating, comment } = req.body;
    const employerCode = req.user.code;

    if (!orderCode || !rating) {
      res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      return;
    }

    const order = await OrderModel.findOne({ code: orderCode });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (order.employerCode !== employerCode) {
      res.status(403).json({ message: "Không có quyền đánh giá đơn hàng này" });
      return;
    }

    if (order.status !== "SUCCESS") {
      res.status(400).json({ message: "Chỉ được đánh giá khi đã hoàn thành" });
      return;
    }

    if (order.isReviewed) {
      res.status(400).json({ message: "Đơn hàng này đã được đánh giá" });
      return;
    }

    const review = await ReviewModel.create({
      code: generateCode("REV"),
      orderCode,
      employerCode,
      candidateCode: order.candidateCode,
      rating,
      comment: comment ?? "",
      createdAt: new Date(),
    });

    order.isReviewed = true;
    await order.save();

    // Update candidate profile rating
    const candidateProfile = await CandidateProfileModel.findOne({ userCode: order.candidateCode });
    if (candidateProfile) {
      const allReviews = await ReviewModel.find({ candidateCode: order.candidateCode });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      candidateProfile.rating = Math.round(avgRating * 10) / 10;
      await candidateProfile.save();
    }

    res.status(201).json(review);
  }),

  // === MATERIAL LIST ===
  createMaterialList: asyncHandler(async (req: any, res: Response) => {
    const { orderCode, items, note } = req.body;
    const candidateCode = req.user.code;

    if (!orderCode || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Thiếu thông tin vật tư" });
      return;
    }

    const order = await OrderModel.findOne({ code: orderCode });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (order.candidateCode !== candidateCode) {
      res.status(403).json({ message: "Không có quyền tạo vật tư cho đơn hàng này" });
      return;
    }

    // Check if a material list already exists and is pending
    const existingList = await MaterialListModel.findOne({ orderCode, status: "pending" });
    if (existingList) {
      res.status(400).json({ message: "Đã có danh sách vật tư chờ duyệt" });
      return;
    }

    let totalAmount = 0;
    const processedItems = items.map(item => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const totalPrice = quantity * unitPrice;
      totalAmount += totalPrice;
      return {
        name: String(item.name),
        quantity,
        unitPrice,
        totalPrice,
      };
    });

    const materialList = await MaterialListModel.create({
      code: generateCode("MAT"),
      orderCode,
      candidateCode,
      employerCode: order.employerCode,
      items: processedItems,
      totalAmount,
      note: note ?? "",
      createdAt: new Date(),
    });

    order.materialStatus = "pending";
    order.materialTotal = totalAmount;
    await order.save();

    res.status(201).json(materialList);
  }),

  getMaterialList: asyncHandler(async (req: any, res: Response) => {
    const { orderCode } = req.params;
    const userCode = req.user.code;
    const userRole = req.user.role;

    const order = await OrderModel.findOne({ code: orderCode });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (userRole !== "admin" && order.employerCode !== userCode && order.candidateCode !== userCode) {
      res.status(403).json({ message: "Không có quyền xem danh sách vật tư của đơn hàng này" });
      return;
    }

    const lists = await MaterialListModel.find({ orderCode }).sort({ createdAt: -1 });
    res.json(lists);
  }),

  confirmMaterialList: asyncHandler(async (req: any, res: Response) => {
    const { orderCode, status } = req.body; // status: "confirmed" or "rejected"
    const employerCode = req.user.code;

    if (!["confirmed", "rejected"].includes(status)) {
      res.status(400).json({ message: "Trạng thái không hợp lệ" });
      return;
    }

    const order = await OrderModel.findOne({ code: orderCode });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (order.employerCode !== employerCode) {
      res.status(403).json({ message: "Không có quyền duyệt vật tư cho đơn hàng này" });
      return;
    }

    const list = await MaterialListModel.findOne({ orderCode, status: "pending" });
    if (!list) {
      res.status(404).json({ message: "Không tìm thấy danh sách vật tư chờ duyệt" });
      return;
    }

    list.status = status;
    await list.save();

    order.materialStatus = status;
    
    // Deduct money from employer if confirmed (Optional: can be handled in payment)
    if (status === "confirmed") {
      // Logic to add to total amount or deduct from wallet right away
      order.totalAmount += list.totalAmount;
      // Note: We might need to handle additional payment if wallet balance is used
    }
    
    await order.save();

    res.json(list);
  }),

  // === WALLET TRANSACTIONS ===
  getWalletTransactions: asyncHandler(async (req: any, res: Response) => {
    const userCode = req.user.code;

    const transactions = await WalletTransactionModel.find({ userCode })
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  })
};