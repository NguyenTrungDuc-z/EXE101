import { Request, Response } from "express";
import { ReviewModel } from "../models/Review.js";

// Tạo đánh giá cho thợ sau khi hoàn thành công việc
export const createReview = async (req: any, res: Response) => {
  try {
    const { orderCode, rating, comment } = req.body;
    const employerCode = req.user.code;

    if (!orderCode || !rating) {
      return res.status(400).json({ message: "Thiếu thông tin đánh giá" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1-5 sao" });
    }

    // Kiểm tra đã review chưa
    const existingReview = await ReviewModel.findOne({ orderCode });
    if (existingReview) {
      return res.status(400).json({ message: "Bạn đã đánh giá đơn hàng này rồi" });
    }

    const review = await ReviewModel.create({
      code: `REV-${Date.now()}`,
      orderCode,
      employerCode,
      rating,
      comment: comment || "",
      createdAt: new Date()
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo đánh giá", error: err });
  }
};

// Lấy danh sách đánh giá của thợ
export const getWorkerReviews = async (req: Request, res: Response) => {
  try {
    const { candidateCode } = req.params;
    const reviews = await ReviewModel.find({ candidateCode });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
