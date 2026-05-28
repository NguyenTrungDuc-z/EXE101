import type { Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { generateCode } from "../../utils/generateCode.js";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").replace(/^84/, "0");
}

export async function loginWithPhone(request: Request, response: Response) {
  const phone = normalizePhone(String(request.body.phone ?? request.body.identifier ?? ""));

  if (!phone || phone.length < 9) {
    response.status(400).json({ message: "Vui lòng nhập số điện thoại hợp lệ." });
    return;
  }

  let user = await UserModel.findOne({ phone });

  if (!user) {
    const code = generateCode("USR-CAN");
    user = await UserModel.create({
      code,
      name: `Khách hàng ${phone.slice(-4)}`,
      email: `${code.toLowerCase()}@homeswift.local`,
      phone,
      role: "candidate",
      status: "active",
      city: "Ho Chi Minh City",
      avatar: `https://i.pravatar.cc/120?u=${code}`,
      createdAt: new Date()
    });
  }

  if (!user) {
    response.status(500).json({ message: "Không thể đăng nhập vào lúc này." });
    return;
  }

  if (user.status === "locked") {
    response.status(403).json({ message: "Tài khoản đang bị khóa." });
    return;
  }

  response.json({
    token: `demo-${user.code}-${Date.now()}`,
    user: {
      code: user.code,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      city: user.city,
      avatar: user.avatar
    }
  });
}
