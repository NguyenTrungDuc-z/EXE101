import { type Request, type Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OrderModel } from "../../models/Order.js";
import { UserModel } from "../../models/User.js";
import TransactionModel from "../../models/Transaction.js";

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

  if (order.status !== "finding_worker" && order.status !== "pending") {
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
      status: "confirmed"
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
        status: "completed",
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
export const getPendingOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ status: "finding_worker" }).sort({ scheduledAt: 1 }).lean();
  
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

// API 6: Lấy chi tiết đơn hàng theo mã
export const getOrderDetail = asyncHandler(async (req: any, res: Response) => {
  const { orderCode } = req.params;
  const userCode = req.user.code;
  const userRole = req.user.role;

  const order = await OrderModel.findOne({ code: orderCode }).lean();
  
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Kiểm tra quyền truy cập: chỉ employer, candidate của đơn hàng hoặc admin mới được xem
  if (userRole !== "admin" && order.employerCode !== userCode && order.candidateCode !== userCode) {
    return res.status(403).json({ error: "Bạn không có quyền truy cập thông tin đơn hàng này" });
  }

  const job = await JobPostModel.findOne({ code: order.jobCode }).lean();
  
  res.json({
    ...order,
    jobTitle: job?.title || "Dịch vụ tận nơi",
    categoryName: job?.categoryCode || "General"
  });
});
