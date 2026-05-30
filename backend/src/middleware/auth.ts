import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục." });
  }

  const token = authHeader.split(" ")[1];
  
  // Simple demo token parsing: demo-USR-CAN-001-timestamp
  // We extract the user code part
  const parts = token.split("-");
  if (parts[0] !== "demo" || parts.length < 3) {
    return res.status(401).json({ message: "Token không hợp lệ." });
  }

  // Reconstruct user code (e.g., USR-CAN-001)
  // The user code is everything between the first "demo" part and the last "timestamp" part
  const userCode = parts.slice(1, -1).join("-");

  try {
    const user = await UserModel.findOne({ code: userCode }).lean();

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    if (user.status === "locked") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Lỗi xác thực người dùng." });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${roles.join(", ")}`
      });
    }

    next();
  };
};