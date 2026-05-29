import type { Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { generateCode } from "../../utils/generateCode.js";

const pendingRegistrations = new Map<
  string,
  {
    name: string;
    email: string;
    city: string;
    otp: string;
    expiresAt: number;
  }
>();

const allowedCities = new Set([
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa"
]);

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").replace(/^84/, "0");
}

function isValidVietnamPhone(phone: string) {
  return /^0(3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-46-9])\d{7}$/.test(phone);
}

function isValidRegistrationEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }

  const domain = email.split("@")[1];
  if (!domain || domain === "gamil.com") {
    return false;
  }

  return domain === "gmail.com" || /\.(com|com\.vn|vn|edu|edu\.vn|ac\.vn|org|org\.vn)$/i.test(domain);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function toAuthPayload(user: {
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  city: string;
  avatar: string;
  address?: string;
  savedAddresses?: string[];
  walletBalance?: number;
}) {
  return {
    token: `demo-${user.code}-${Date.now()}`,
    user: {
      code: user.code,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      city: user.city,
      avatar: user.avatar,
      address: user.address ?? "",
      savedAddresses: user.savedAddresses ?? [],
      walletBalance: user.walletBalance ?? 0
    }
  };
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

  response.json(toAuthPayload(user));
}

export async function registerWithPhone(request: Request, response: Response) {
  const phone = normalizePhone(String(request.body.phone ?? ""));
  const name = String(request.body.name ?? "").trim();
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const city = String(request.body.city ?? "").trim();

  if (!name) {
    response.status(400).json({ message: "Vui lòng nhập họ và tên." });
    return;
  }

  if (!isValidVietnamPhone(phone)) {
    response.status(400).json({ message: "Số điện thoại phải gồm 10 số, bắt đầu bằng 0 và thuộc đầu số Việt Nam." });
    return;
  }

  if (!email) {
    response.status(400).json({ message: "Vui lòng nhập email." });
    return;
  }

  if (!isValidRegistrationEmail(email)) {
    response.status(400).json({ message: "Email phải đúng định dạng, dùng gmail.com hoặc email công ty/trường học hợp lệ." });
    return;
  }

  if (!city || !allowedCities.has(city)) {
    response.status(400).json({ message: "Vui lòng chọn thành phố/khu vực hợp lệ." });
    return;
  }

  const existingByPhone = await UserModel.findOne({ phone }).lean();
  if (existingByPhone) {
    response.status(409).json({ message: "Số điện thoại đã được đăng ký." });
    return;
  }

  const existingByEmail = await UserModel.findOne({ email }).lean();
  if (existingByEmail) {
    response.status(409).json({ message: "Email đã được đăng ký." });
    return;
  }

  const otp = generateOtp();
  pendingRegistrations.set(phone, {
    name,
    email,
    city,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  response.status(202).json({
    message: "Mã OTP đã được gửi về số điện thoại.",
    phone,
    expiresInSeconds: 300,
    devOtp: otp
  });
}

export async function verifyRegisterOtp(request: Request, response: Response) {
  const phone = normalizePhone(String(request.body.phone ?? ""));
  const otp = String(request.body.otp ?? "").trim();
  const pending = pendingRegistrations.get(phone);

  if (!isValidVietnamPhone(phone)) {
    response.status(400).json({ message: "Số điện thoại không hợp lệ." });
    return;
  }

  if (!pending) {
    response.status(404).json({ message: "Không tìm thấy yêu cầu đăng ký. Vui lòng gửi lại OTP." });
    return;
  }

  if (pending.expiresAt < Date.now()) {
    pendingRegistrations.delete(phone);
    response.status(410).json({ message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
    return;
  }

  if (pending.otp !== otp) {
    response.status(400).json({ message: "Mã OTP không đúng." });
    return;
  }

  const existingByPhone = await UserModel.findOne({ phone }).lean();
  if (existingByPhone) {
    pendingRegistrations.delete(phone);
    response.status(409).json({ message: "Số điện thoại đã được đăng ký." });
    return;
  }

  const code = generateCode("USR-CAN");
  const user = await UserModel.create({
    code,
    name: pending.name,
    email: pending.email,
    phone,
    role: "candidate",
    status: "active",
    city: pending.city,
    avatar: `https://i.pravatar.cc/120?u=${code}`,
    createdAt: new Date()
  });

  pendingRegistrations.delete(phone);
  response.status(201).json(toAuthPayload(user));
}
