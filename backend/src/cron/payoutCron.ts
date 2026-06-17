import cron from "node-cron";
import { OrderModel } from "../models/Order.js";
import { releaseOrderFunds } from "../controllers/user/orderController.js";

/**
 * Cron job chạy mỗi giờ để tự động giải ngân tiền cho thợ
 * sau 24h kể từ khi thợ xác nhận hoàn thành mà khách hàng không có khiếu nại/nghiệm thu.
 */
export const initPayoutCron = () => {
  // Chạy vào phút thứ 0 của mỗi giờ
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Checking for orders to auto-release funds...");
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
      const ordersToRelease = await OrderModel.find({
        status: "COMPLETED_BY_TECHNICIAN",
        isReleased: false,
        completedAt: { $lte: twentyFourHoursAgo }
      });
      
      console.log(`[Cron] Found ${ordersToRelease.length} orders to release.`);
      
      for (const order of ordersToRelease) {
        try {
          await releaseOrderFunds(order._id.toString());
          console.log(`[Cron] Auto-released funds for order: ${order.code}`);
        } catch (error) {
          console.error(`[Cron] Failed to release funds for order ${order.code}:`, error);
        }
      }
    } catch (error) {
      console.error("[Cron] Error in payout cron job:", error);
    }
  });
};