import { type Request, type Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OrderModel } from "../../models/Order.js";
import { UserModel } from "../../models/User.js";
import { ReviewModel } from "../../models/Review.js";
import TransactionModel from "../../models/Transaction.js";
import { WalletTransactionModel } from "../../models/WalletTransaction.js";

// API 1: Thợ nhận việc
export const acceptOrder = asyncHandler(async (req: any, res: Response) => {
  const { orderId } = req.body;
  const candidateCode = req.user.code;

  if (!orderId) {
    return res.status(400).json({ error: "Thiếu thông tin orderId hoặc candidateCode" });
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  if (order.status !== "PENDING_ASSIGN" && order.status !== "payment_pending") {
    return res.status(400).json({ error: "Đơn hàng này đã có người nhận hoặc không ở trạng thái chờ" });
  }

  // Chặn Thợ tự nhận việc của chính mình (nếu thợ cũng là người đăng)
  // if (candidateCode === order.employerCode) {
  //   return res.status(400).json({ error: "Bạn không thể tự nhận việc của chính mình" });
  // }

  // Update order with candidate and change status to accepted
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      candidateCode,
      technicianId: req.user._id,
      status: "IN_PROGRESS"
    },
    { new: true }
  );

  res.json({
    message: "Nhận việc thành công",
    order: updatedOrder
  });
});

// API 2: Thợ tạo hóa đơn phát sinh vật tư
export const createInvoice = asyncHandler(async (req: any, res: Response) => {
  const { orderId, invoiceItems, materialTotal } = req.body;
  const candidateCode = req.user.code;

  if (!orderId || !invoiceItems || materialTotal === undefined) {
    return res.status(400).json({ error: "Thiếu thông tin hóa đơn" });
  }

  if (!Array.isArray(invoiceItems) || invoiceItems.length === 0) {
    return res.status(400).json({ error: "invoiceItems must be a non-empty array" });
  }

  // Validate invoice items structure
  for (const item of invoiceItems) {
    if (!item.name || typeof item.price !== "number") {
      return res.status(400).json({ error: "Each invoice item must have name (string) and price (number)" });
    }
  }

  // Kiểm tra chính xác cặp orderId và candidateCode
  const order = await OrderModel.findOne({ _id: orderId, candidateCode });
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng hoặc bạn không phải là thợ của đơn này" });
  }

  // Update order with invoice items and material total
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      invoiceItems,
      materialTotal,
      materialStatus: "pending"
    },
    { new: true }
  );

  res.json({
    message: "Invoice created successfully, waiting for customer approval",
    order: updatedOrder
  });
});

// API 3: Khách hàng duyệt hóa đơn phát sinh
export const approveInvoice = asyncHandler(async (req: any, res: Response) => {
  const { orderId } = req.body;
  const employerCode = req.user.code;

  if (!orderId) {
    return res.status(400).json({ error: "Thiếu orderId" });
  }

  const order = await OrderModel.findOne({ _id: orderId, employerCode });
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.materialStatus !== "pending") {
    return res.status(400).json({ error: "Invoice is not in pending status" });
  }

  // Calculate new total amount
  const newTotalAmount = order.totalAmount + order.materialTotal;

  // Update order status and total amount
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      materialStatus: "confirmed",
      totalAmount: newTotalAmount
    },
    { new: true }
  );

  res.json({
    message: "Invoice approved successfully",
    order: updatedOrder
  });
});

// API 4: Khách hàng Nghiệm thu & Thanh toán tự động
export const completeAndPayOrder = asyncHandler(async (req: any, res: Response) => {
  const { orderId } = req.body;
  const employerCode = req.user.code;

  if (!orderId) {
    return res.status(400).json({ error: "Thiếu orderId" });
  }

  const order = await OrderModel.findOne({ _id: orderId, employerCode });
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Get customer and worker info
  const customer = await UserModel.findOne({ code: order.employerCode });
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const worker = await UserModel.findOne({ code: order.candidateCode });
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  // Check customer wallet balance
  const customerBalance = customer.walletBalance || 0;
  if (customerBalance < order.totalAmount) {
    return res.status(400).json({ error: "Insufficient wallet balance. Please top up your wallet." });
  }

  // Commission rate (default 20%)
  const commissionRate = order.commissionRate || 0.2;
  const commissionAmount = order.totalAmount * commissionRate;
  const workerEarning = order.totalAmount - commissionAmount;

  try {
    // 1. Deduct from customer wallet
    const newCustomerBalance = customerBalance - order.totalAmount;
    await UserModel.findOneAndUpdate(
      { code: order.employerCode },
      { walletBalance: newCustomerBalance }
    );

    // 2. Create payment transaction for customer
    await TransactionModel.create({
      user: customer._id,
      type: "payment",
      amount: order.totalAmount,
      description: `Payment for order ${order.code}`,
      relatedBooking: order._id,
      status: "completed"
    });

    // 3. Create commission transaction for platform
    await TransactionModel.create({
      user: customer._id,
      type: "commission",
      amount: commissionAmount,
      description: `Platform commission for order ${order.code}`,
      relatedBooking: order._id,
      status: "completed"
    });

    // 4. Add earning to worker wallet
    const newWorkerBalance = (worker.walletBalance || 0) + workerEarning;
    await UserModel.findOneAndUpdate(
      { code: order.candidateCode },
      { walletBalance: newWorkerBalance }
    );

    // 5. Create earning transaction for worker
    await TransactionModel.create({
      user: worker._id,
      type: "earning",
      amount: workerEarning,
      description: `Earning from order ${order.code}`,
      relatedBooking: order._id,
      status: "completed"
    });

    // 6. Update order status to completed
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "SUCCESS",
        paymentStatus: "paid",
        commissionAmount,
        earningAmount: workerEarning,
        workerPayout: workerEarning
      },
      { new: true }
    );

    res.json({
      message: "Order completed and payment processed successfully",
      order: updatedOrder,
      paymentDetails: {
        totalAmount: order.totalAmount,
        commissionAmount,
        workerEarning,
        customerNewBalance: newCustomerBalance,
        workerNewBalance: newWorkerBalance
      }
    });
  } catch (error) {
    // Rollback: restore customer balance if transaction creation fails
    await UserModel.findOneAndUpdate(
      { code: order.employerCode },
      { walletBalance: customerBalance }
    );
    throw error;
  }
});

// API 5: Lấy danh sách công việc đang chờ thợ (Pending Orders)
export const getPendingOrders = asyncHandler(async (req: any, res: Response) => {
  const workerCode = req.user.code;
  
  // Get orders assigned to this worker with status PENDING_ACCEPT
  // or all PENDING_ASSIGN orders if worker is not assigned yet
  const orders = await OrderModel.find({
    $or: [
      { status: "PENDING_ACCEPT", candidateCode: workerCode },
      { status: "PENDING_ASSIGN" }
    ]
  }).sort({ scheduledAt: 1 }).lean();
  
  // Map with job titles for display
  const jobCodes = orders.map(o => o.jobCode);
  const jobs = await JobPostModel.find({ code: { $in: jobCodes } }).lean();
  const jobMap = new Map(jobs.map(j => [j.code, j]));

  const result = orders.map(order => ({
    ...order,
    jobTitle: jobMap.get(order.jobCode)?.title || "Dịch vụ tận nơi",
    categoryName: jobMap.get(order.jobCode)?.categoryCode || "General"
  }));

  res.json(result);
});

// API 6: Lấy chi tiết đơn hàng
export const getOrderDetail = asyncHandler(async (req: any, res: Response) => {
  const { orderCode } = req.params;

  if (!orderCode) {
    return res.status(400).json({ error: "Thiếu orderCode" });
  }

  const order = await OrderModel.findOne({ code: orderCode });
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  res.json(order);
});


export const workerResponse = asyncHandler(async (req: any, res: Response) => {
  const { orderCode } = req.params;
  const { response } = req.body; // 'accepted' or 'rejected'
  const workerCode = req.user.code;

  const order = await OrderModel.findOne({ code: orderCode });
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  if (order.candidateCode !== workerCode) {
    return res.status(403).json({ error: "Bạn không phải là thợ được gán cho đơn này" });
  }

  if (order.status !== "PENDING_ACCEPT") {
    return res.status(400).json({ error: "Đơn hàng không ở trạng thái chờ thợ xác nhận" });
  }

  if (response === "accepted") {
    order.status = "IN_PROGRESS";
    order.technicianId = req.user._id;
  } else if (response === "rejected") {
    order.status = "PENDING_ASSIGN";
    order.technicianId = undefined;
    order.technicianPayout = 0;
    order.candidateCode = "";
  } else {
    return res.status(400).json({ error: "Phản hồi không hợp lệ" });
  }

  await order.save();
  res.json({ message: `Đã ${response === "accepted" ? "chấp nhận" : "từ chối"} đơn hàng`, order });
});

export const completeOrder = asyncHandler(async (req: any, res: Response) => {
  const { orderCode } = req.params;
  const userCode = req.user.code;

  const order = await OrderModel.findOne({ code: orderCode });
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  // Check if this worker is assigned to the order
  if (order.candidateCode !== userCode) {
    return res.status(403).json({ error: "Bạn không phải là thợ của đơn này" });
  }

  // Sử dụng (order.status as any) để bỏ qua bộ kiểm tra kiểu dữ liệu nghiêm ngặt của TypeScript cho chuỗi 'accepted_by_technician'
  if (order.status !== "IN_PROGRESS" && (order.status as any) !== "accepted_by_technician") {
    return res.status(400).json({ error: "Trạng thái đơn hàng không hợp lệ để hoàn thành" });
  }

  order.status = "COMPLETED_BY_TECHNICIAN";
  order.completedAt = new Date();
  await order.save();

  res.json({
    message: "Đã xác nhận hoàn thành đơn hàng. Vui lòng chờ khách hàng nghiệm thu.",
    order
  });
});

/**
 * Hàm giải ngân tiền cho thợ (Dùng cho cả Customer API và Cron Job)
 */
export const releaseOrderFunds = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);
  if (!order || order.isReleased || (order.status !== "COMPLETED_BY_TECHNICIAN" && order.status !== "COMPLETED_PENDING_REVIEW")) {
    return null;
  }

  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    let technician = await UserModel.findById(order.technicianId).session(session);
    
    if (!technician && order.candidateCode) {
      technician = await UserModel.findOne({ code: order.candidateCode }).session(session);
    }

    if (!technician) {
      throw new Error("Không tìm thấy thợ để giải ngân");
    }

    // Calculate payout if not set
    let payoutAmount = order.technicianPayout || 0;
    if (payoutAmount === 0) {
      const commissionRate = order.commissionRate || 0.2;
      const commissionAmount = order.totalAmount * commissionRate;
      payoutAmount = order.totalAmount - commissionAmount;
      
      order.commissionAmount = commissionAmount;
      order.earningAmount = payoutAmount;
      order.workerPayout = payoutAmount;
    }
    technician.walletBalance = (technician.walletBalance || 0) + payoutAmount;
    await technician.save({ session });

    await WalletTransactionModel.create(
      [
        {
          code: `TX-RELEASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userCode: technician.code,
          type: "earning",
          amount: payoutAmount,
          description: `Giải ngân tiền đơn hàng ${order.code}`,
          relatedOrderCode: order.code,
          balanceAfter: technician.walletBalance,
          createdAt: new Date()
        }
      ],
      { session }
    );

    order.status = "COMPLETED";
    order.isReleased = true;
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const reviewAndReleaseOrder = asyncHandler(async (req: any, res: Response) => {
  const { orderCode, rating, comment } = req.body;
  const employerCode = req.user.code;

  const order = await OrderModel.findOne({ code: orderCode, employerCode });
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng hoặc bạn không có quyền" });
  }

  if (order.status !== "COMPLETED_PENDING_REVIEW" && order.status !== "COMPLETED_BY_TECHNICIAN") {
    return res.status(400).json({ error: "Đơn hàng chưa được thợ xác nhận hoàn thành" });
  }

  // 1. Giải ngân tiền
  await releaseOrderFunds(order._id.toString());

  // 2. Lưu đánh giá
  const customer = await UserModel.findOne({ code: order.employerCode });
  const worker = await UserModel.findOne({ code: order.candidateCode });

  if (customer && worker) {
    await ReviewModel.create({
      code: `REV-${Date.now()}`,
      orderId: order._id,
      customerId: customer._id,
      technicianId: worker._id,
      orderCode: order.code,
      employerCode: order.employerCode,
      candidateCode: order.candidateCode,
      rating: rating || 5,
      comment: comment || "",
      createdAt: new Date()
    });
  }

  order.isReviewed = true;
  await order.save();

  res.json({
    message: "Nghiệm thu và giải ngân thành công",
    order
  });
});


// API: Thợ phát sinh vật tư
export const addMaterialRequest = asyncHandler(async (req: any, res: Response) => {
  const { orderId, name, quantity, price } = req.body;
  const technicianId = req.user._id;

  if (!orderId || !name || !quantity || !price) {
    return res.status(400).json({ error: "Thiếu thông tin vật tư" });
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  if (order.technicianId?.toString() !== technicianId.toString()) {
    return res.status(403).json({ error: "Bạn không phải là thợ của đơn này" });
  }

  if (order.status !== "PENDING_ACCEPT" && order.status !== "IN_PROGRESS") {
    return res.status(400).json({ error: "Chỉ có thể phát sinh vật tư khi đang thực hiện công việc" });
  }

  // Add material request to array
  order.materialRequests.push({
    name: String(name),
    quantity: Number(quantity),
    price: Number(price),
    isApprovedByCustomer: false
  });

  await order.save();
  res.status(201).json({ message: "Đã gửi yêu cầu phát sinh vật tư", order });
});

// API: Khách hàng duyệt vật tư phát sinh
export const approveMaterialRequest = asyncHandler(async (req: any, res: Response) => {
  const { orderId, materialIndex } = req.body;
  const employerCode = req.user.code;

  if (orderId === undefined || materialIndex === undefined) {
    return res.status(400).json({ error: "Thiếu thông tin" });
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
  }

  if (order.employerCode !== employerCode) {
    return res.status(403).json({ error: "Bạn không phải là khách hàng của đơn này" });
  }

  if (materialIndex < 0 || materialIndex >= order.materialRequests.length) {
    return res.status(400).json({ error: "Chỉ số vật tư không hợp lệ" });
  }

  // Approve the material request
  order.materialRequests[materialIndex].isApprovedByCustomer = true;

  await order.save();
});
