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
    const code = generateCode("USR-EMP");
    const newUser = await UserModel.create({
      code,
      name: `Khách hàng ${phone.slice(-4)}`,
      email: `${code.toLowerCase()}@homeswift.local`,
      phone,
      role: "employer",
      status: "active",
      city: "Ho Chi Minh City",
      avatar: `https://i.pravatar.cc/120?u=${code}`,
      createdAt: new Date()
    });
    user = newUser.toObject() as any;
  } else {
    user = user.toObject() as any;
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

   const code = generateCode("USR-EMP");
   const newUser = await UserModel.create({
     code,
     name: pending.name,
     email: pending.email,
     phone,
     role: "employer",
     status: "active",
     city: pending.city,
     avatar: `https://i.pravatar.cc/120?u=${code}`,
     createdAt: new Date()
   });

   pendingRegistrations.delete(phone);
   response.status(201).json(toAuthPayload(newUser.toObject() as any));
}

export async function loginWithGoogle(request: Request, response: Response) {
  const { credential } = request.body;

  if (!credential) {
    response.status(400).json({ message: "Vui lòng cung cấp Google credential." });
    return;
  }

  try {
    // Decode JWT credential to get user info
    const parts = credential.split('.');
    if (parts.length !== 3) {
      response.status(400).json({ message: "Credential không hợp lệ." });
      return;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

    const { email, name, sub: googleId } = jsonPayload;

    if (!email) {
      response.status(400).json({ message: "Không thể lấy email từ Google." });
      return;
    }

    if (!googleId) {
      response.status(400).json({ message: "Không thể lấy Google ID." });
      return;
    }

    try {
      let user = await UserModel.findOne({ email }).lean();

      if (!user) {
        const code = generateCode("USR-EMP");
        const googleIdStr = String(googleId);
        try {
          const newUser = await UserModel.create({
            code,
            name: name || `Google User ${googleIdStr.slice(-4)}`,
            email,
            phone: `google-${googleIdStr}`,
            role: "employer",
            status: "active",
            city: "Ho Chi Minh City",
            avatar: `https://i.pravatar.cc/120?u=${code}`,
            createdAt: new Date()
          });
          user = newUser.toObject() as any;
        } catch (createError: any) {
          console.error("Error creating Google user:", createError.message);
          if (createError.code === 11000) {
            response.status(409).json({ message: "Email hoặc mã người dùng đã tồn tại." });
            return;
          }
          throw createError;
        }
      }

      if (user && user.status === "locked") {
        response.status(403).json({ message: "Tài khoản đang bị khóa." });
        return;
      }

      if (!user) {
        response.status(500).json({ message: "Lỗi tạo tài khoản." });
        return;
      }

      response.json(toAuthPayload(user));
    } catch (dbError: any) {
      console.error("Database error in Google login:", dbError.message);
      response.status(500).json({ message: "Lỗi cơ sở dữ liệu." });
    }
  } catch (error: any) {
    console.error("Google login error:", error.message);
    response.status(500).json({ message: "Lỗi xác thực Google." });
  }
}

export async function loginWithFacebook(request: Request, response: Response) {
  const { accessToken, userID, name, email } = request.body;

  if (!accessToken || !userID) {
    response.status(400).json({ message: "Vui lòng cung cấp Facebook credentials." });
    return;
  }

  try {
    const fbEmail = email || `facebook-${userID}@homeswift.local`;
    let user = await UserModel.findOne({ email: fbEmail }).lean();

    if (!user) {
      const code = generateCode("USR-EMP");
      const newUser = await UserModel.create({
        code,
        name: name || `Facebook User ${userID.slice(-4)}`,
        email: fbEmail,
        phone: `facebook-${userID}`,
        role: "employer",
        status: "active",
        city: "Ho Chi Minh City",
        avatar: `https://i.pravatar.cc/120?u=${code}`,
        createdAt: new Date()
      });
      user = newUser.toObject() as any;
    }

    if (user && user.status === "locked") {
      response.status(403).json({ message: "Tài khoản đang bị khóa." });
      return;
    }

    if (!user) {
      response.status(500).json({ message: "Lỗi tạo tài khoản." });
      return;
    }

    response.json(toAuthPayload(user));
  } catch (error) {
    console.error("Facebook login error:", error);
    response.status(500).json({ message: "Lỗi xác thực Facebook." });
  }
}
