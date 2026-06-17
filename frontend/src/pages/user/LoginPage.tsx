import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, LockKeyhole, MapPin, ShieldCheck, Smartphone, Sparkles, UserPlus } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import FacebookLogin from "../../auth/FacebookLogin";
import GoogleLogin from "../../auth/GoogleLogin";

const AUTH_STORAGE_KEY = "homeswift_user";
const FB_APP_ID = "1969315983727979";
const GOOGLE_CLIENT_ID = "221668802735-ps1j4hoftkj11obo4g4d0eod36ljc39h.apps.googleusercontent.com";
const PROVINCES_API = "https://provinces.open-api.vn/api";

type ProvinceOption = { code: number; name: string };
type DistrictOption = { code: number; name: string };
type WardOption = { code: number; name: string };
type RegisterField = "name" | "phone" | "email" | "city";

async function fetchAddressJson<T>(path: string): Promise<T> {
  const res = await fetch(`${PROVINCES_API}${path}`);
  if (!res.ok) throw new Error("Không tải được dữ liệu địa chỉ.");
  return res.json() as Promise<T>;
}

const loginHighlights = [
  "Đặt lịch và theo dõi đơn dịch vụ trong một nơi",
  "Thông tin tài khoản được bảo vệ bằng xác thực OTP",
  "Dễ dàng quản lý lịch sử dịch vụ và hỗ trợ"
];

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isValidVietnamPhone(value: string) {
  return /^0(3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-46-9])\d{7}$/.test(value);
}

function isValidRegistrationEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const domain = email.split("@")[1];
  if (!domain || domain === "gamil.com") return false;
  return domain === "gmail.com" || /\.(com|com\.vn|vn|edu|edu\.vn|ac\.vn|org|org\.vn)$/i.test(domain);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerProvince, setRegisterProvince] = useState("");
  const [registerDistrict, setRegisterDistrict] = useState("");
  const [registerWard, setRegisterWard] = useState("");
  const [registerTouched, setRegisterTouched] = useState<Record<RegisterField, boolean>>({
    name: false, phone: false, email: false, city: false
  });
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([]);
  const [wardOptions, setWardOptions] = useState<WardOption[]>([]);
  const [addressFeedback, setAddressFeedback] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [pendingLogin, setPendingLogin] = useState<any | null>(null);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbLogin, setFbLogin] = useState<FacebookLogin | null>(null);
  const [googleLogin, setGoogleLogin] = useState<GoogleLogin | null>(null);

  const normalizedRegisterPhone = normalizePhone(registerPhone);
  const registerFieldErrors = {
    name: registerName.trim() ? "" : "Họ và tên không được bỏ trống.",
    phone: !normalizedRegisterPhone
      ? "Số điện thoại không được bỏ trống."
      : isValidVietnamPhone(normalizedRegisterPhone)
        ? ""
        : "Số điện thoại phải gồm 10 số, bắt đầu bằng 0 và đúng đầu số Việt Nam.",
    email: !registerEmail.trim()
      ? "Email không được bỏ trống."
      : isValidRegistrationEmail(registerEmail)
        ? ""
        : "Email phải là gmail.com hoặc email công ty/trường học hợp lệ.",
    city: registerProvince && registerDistrict && registerWard
      ? ""
      : "Vui lòng chọn đầy đủ tỉnh/thành, quận/huyện và phường/xã."
  };
  const canSubmitRegister =
    !registerFieldErrors.name && !registerFieldErrors.phone &&
    !registerFieldErrors.email && !registerFieldErrors.city;
  const showRegisterError = (field: RegisterField) =>
    registerTouched[field] && Boolean(registerFieldErrors[field]);
  const touchRegisterField = (field: RegisterField) =>
    setRegisterTouched((cur) => ({ ...cur, [field]: true }));

  // Facebook SDK init
  useEffect(() => {
    const instance = new FacebookLogin(FB_APP_ID);
    setFbLogin(instance);
  }, []);

  // Load provinces
  useEffect(() => {
    fetchAddressJson<ProvinceOption[]>("/p/")
      .then(setProvinceOptions)
      .catch((err: Error) => setAddressFeedback(err.message));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    setRegisterDistrict("");
    setRegisterWard("");
    setDistrictOptions([]);
    setWardOptions([]);
    setRegisterTouched((cur) => ({ ...cur, city: false }));
    if (!registerProvince) return;
    fetchAddressJson<{ districts: DistrictOption[] }>(`/p/${registerProvince}?depth=2`)
      .then((data) => setDistrictOptions(data.districts ?? []))
      .catch((err: Error) => setAddressFeedback(err.message));
  }, [registerProvince]);

  // Load wards when district changes
  useEffect(() => {
    setRegisterWard("");
    setWardOptions([]);
    setRegisterTouched((cur) => ({ ...cur, city: false }));
    if (!registerDistrict) return;
    fetchAddressJson<{ wards: WardOption[] }>(`/d/${registerDistrict}?depth=2`)
      .then((data) => setWardOptions(data.wards ?? []))
      .catch((err: Error) => setAddressFeedback(err.message));
  }, [registerDistrict]);

  // Google login init
  useEffect(() => {
    const googleInstance = new GoogleLogin(GOOGLE_CLIENT_ID);
    googleInstance.setOnLoginSuccess(async (authResponse) => {
      try {
        const result = await platformApi.loginWithGoogle({ credential: authResponse.credential });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
        window.dispatchEvent(new Event("homeswift-auth"));
        setFeedbackType("success");
        setFeedback("Đăng nhập Google thành công!");
        setTimeout(() => navigate("/"), 500);
      } catch (error) {
        setFeedbackType("error");
        setFeedback((error as Error).message);
      }
    });
    googleInstance.setOnLoginError((error) => {
      setFeedbackType("error");
      setFeedback(error.message);
    });
    setGoogleLogin(googleInstance);
    setTimeout(() => googleInstance.renderButton("google-signin-button"), 500);
  }, []);

  // Show/hide Google button based on mode
  useEffect(() => {
    const btn = document.getElementById("google-signin-button");
    if (btn) {
      btn.style.display = mode === "login" ? "flex" : "none";
      if (mode === "login" && googleLogin && !btn.childElementCount) {
        setTimeout(() => googleLogin.renderButton("google-signin-button"), 50);
      }
    }
  }, [mode, googleLogin]);

  const handleFacebookLogin = async () => {
    if (!fbLogin) {
      setFeedbackType("error");
      setFeedback("Facebook SDK đang khởi tạo, vui lòng thử lại sau giây lát.");
      return;
    }
    setFeedback("");
    setIsSubmitting(true);
    try {
      const authResponse = await fbLogin.login();
      const result = await platformApi.loginWithFacebook({
        accessToken: authResponse.accessToken,
        userID: authResponse.userID
      });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setFeedbackType("success");
      setFeedback("Đăng nhập Facebook thành công!");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      setFeedbackType("error");
      setFeedback((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    if (!identifier.trim()) {
      setFeedbackType("error");
      setFeedback("Vui lòng nhập số điện thoại.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await platformApi.login({ phone: identifier.trim() });
      const authUser = (result as any).user ?? result;
      const authToken = (result as any).token;
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      setPendingLogin({ user: authUser, token: authToken });
      setLoginOtp(otp);
      setOtpPhone(authUser?.phone || identifier.trim());
      setOtpCode("");
      setOtpHint(`Mã OTP demo: ${otp}`);
      setFeedbackType("success");
      setFeedback("Mã OTP đã được gửi. Nhập OTP để đăng nhập.");
      setIsOtpOpen(true);
    } catch (reason) {
      setFeedbackType("error");
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProvinceName = provinceOptions.find((p) => String(p.code) === registerProvince)?.name ?? "";
  const selectedDistrictName = districtOptions.find((d) => String(d.code) === registerDistrict)?.name ?? "";
  const selectedWardName = wardOptions.find((w) => String(w.code) === registerWard)?.name ?? "";
  const registerAddress = [selectedWardName, selectedDistrictName, selectedProvinceName].filter(Boolean).join(", ");

  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    if (!canSubmitRegister) {
      setRegisterTouched({ name: true, phone: true, email: true, city: true });
      setFeedbackType("error");
      setFeedback("Vui lòng kiểm tra lại thông tin đăng ký.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await platformApi.register({
        name: registerName.trim(),
        phone: normalizedRegisterPhone,
        email: registerEmail.trim(),
        city: registerAddress,
        province: selectedProvinceName,
        district: selectedDistrictName,
        ward: selectedWardName
      });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setFeedbackType("success");
      setFeedback("Đăng ký thành công. Đang chuyển trang...");
      setTimeout(() => navigate("/"), 500);
    } catch (reason) {
      setFeedbackType("error");
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFeedbackType("error");
      setFeedback("Vui lòng nhập mã OTP gồm 6 số.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (otpCode.trim() !== loginOtp || !pendingLogin) {
        setFeedbackType("error");
        setFeedback("Mã OTP không đúng.");
        return;
      }
      const result = pendingLogin;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setFeedbackType("success");
      setFeedback("Xác thực thành công. Đang chuyển trang...");
      setIsOtpOpen(false);
      setTimeout(() => navigate("/"), 500);
    } catch (reason) {
      setFeedbackType("error");
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <div className="login-layout">
        <aside className="login-visual-panel">
          <span className="eyebrow">Tài khoản ViecNhanh</span>
          <h1>{mode === "login" ? "Chào mừng bạn quay lại." : "Bắt đầu quản lý dịch vụ dễ dàng hơn."}</h1>
          <p>Đăng nhập để đặt lịch, theo dõi tiến độ và nhận hỗ trợ nhanh cho mọi nhu cầu dịch vụ tại nhà.</p>
          <div className="login-highlight-list">
            {loginHighlights.map((item) => (
              <span key={item}>
                <CheckCircle2 size={18} />
                {item}
              </span>
            ))}
          </div>
          <div className="login-trust-strip" aria-label="Cam kết tài khoản">
            <span><ShieldCheck size={18} /> Bảo mật</span>
            <span><Smartphone size={18} /> OTP nhanh</span>
            <span><MapPin size={18} /> Khu vực rõ ràng</span>
          </div>
        </aside>

        <div className="login-card">
          <Link to="/" className="login-logo">
            <span className="brand-icon" aria-hidden="true" />
            <strong>Viec<span>Nhanh</span></strong>
          </Link>

          <div className="login-card-head">
            <span className="login-card-icon">
              {mode === "login" ? <LockKeyhole size={22} /> : <UserPlus size={22} />}
            </span>
            <div>
              <h2>{mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}</h2>
              <p>{mode === "login" ? "Nhập số điện thoại hoặc dùng tài khoản xã hội." : "Hoàn tất thông tin để nhận mã xác thực OTP."}</p>
            </div>
          </div>

          <div className="auth-mode-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => { setMode("login"); setFeedback(""); }}
            >
              Đăng nhập
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => { setMode("register"); setFeedback(""); }}
            >
              Đăng ký
            </button>
          </div>

          {mode === "login" ? (
            <>
              <div
                id="google-signin-button"
                style={{ width: "100%", minHeight: "40px", display: "flex", justifyContent: "center" }}
              />

              <button
                className="social-button facebook-button"
                type="button"
                onClick={handleFacebookLogin}
                disabled={isSubmitting}
              >
                <span aria-hidden="true">f</span>
                Tiếp tục với Facebook
              </button>

              <div className="login-divider">hoặc dùng số điện thoại</div>

              <form onSubmit={submitLogin} className="login-form">
                <label className="phone-field">
                  <span className="country-code">+84</span>
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Nhập số điện thoại"
                    autoComplete="username"
                  />
                </label>
                <button className="button primary login-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={submitRegister} className="login-form register-form">
              <label>
                Họ và tên
                <input
                  value={registerName}
                  onChange={(event) => { setRegisterName(event.target.value); setFeedback(""); }}
                  onBlur={() => touchRegisterField("name")}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  aria-invalid={showRegisterError("name")}
                />
                {showRegisterError("name") ? <small className="field-error">{registerFieldErrors.name}</small> : null}
              </label>

              <label>
                Số điện thoại
                <input
                  value={registerPhone}
                  onChange={(event) => { setRegisterPhone(normalizePhone(event.target.value).slice(0, 10)); setFeedback(""); }}
                  onBlur={() => touchRegisterField("phone")}
                  placeholder="0901 234 567"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  aria-invalid={showRegisterError("phone")}
                />
                {showRegisterError("phone") ? <small className="field-error">{registerFieldErrors.phone}</small> : null}
              </label>

              <label>
                Email
                <input
                  value={registerEmail}
                  onChange={(event) => { setRegisterEmail(event.target.value); setFeedback(""); }}
                  onBlur={() => touchRegisterField("email")}
                  placeholder="email@viecnhanh.vn"
                  autoComplete="email"
                  aria-invalid={showRegisterError("email")}
                />
                {showRegisterError("email") ? <small className="field-error">{registerFieldErrors.email}</small> : null}
              </label>

              <label>
                Khu vực
                <select
                  value={registerProvince}
                  onChange={(event) => { setRegisterProvince(event.target.value); setFeedback(""); }}
                  onBlur={() => touchRegisterField("city")}
                  required
                  aria-invalid={showRegisterError("city")}
                >
                  <option value="" disabled>Chọn tỉnh/thành phố</option>
                  {provinceOptions.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                <select
                  value={registerDistrict}
                  onChange={(event) => { setRegisterDistrict(event.target.value); setFeedback(""); }}
                  onBlur={() => touchRegisterField("city")}
                  required
                  disabled={!registerProvince}
                  aria-invalid={showRegisterError("city")}
                >
                  <option value="" disabled>Chọn quận/huyện</option>
                  {districtOptions.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                <select
                  value={registerWard}
                  onChange={(event) => { setRegisterWard(event.target.value); setFeedback(""); }}
                  onBlur={() => touchRegisterField("city")}
                  required
                  disabled={!registerDistrict}
                  aria-invalid={showRegisterError("city")}
                >
                  <option value="" disabled>Chọn phường/xã</option>
                  {wardOptions.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {showRegisterError("city") ? <small className="field-error">{registerFieldErrors.city}</small> : null}
                {addressFeedback ? <small className="field-error">{addressFeedback}</small> : null}
              </label>

              <button className="button primary login-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>
          )}

          {feedback ? (
            <p className={`feedback login-feedback ${feedbackType === "error" ? "error" : ""}`}>
              {feedback}
            </p>
          ) : null}
        </div>
      </div>

      {isOtpOpen ? (
        <div className="otp-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="otp-title">
          <form className="otp-modal" onSubmit={submitOtp}>
            <span className="login-card-icon"><Sparkles size={22} /></span>
            <h2 id="otp-title">Xác thực số điện thoại</h2>
            <p>Mã OTP đã được gửi tới số {otpPhone}. Vui lòng nhập mã để tiếp tục.</p>
            {otpHint ? <strong>{otpHint}</strong> : null}
            <input
              value={otpCode}
              onChange={(event) => setOtpCode(normalizePhone(event.target.value).slice(0, 6))}
              placeholder="Nhập mã OTP"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
            <div>
              <button className="button secondary" type="button" onClick={() => setIsOtpOpen(false)} disabled={isSubmitting}>
                Hủy
              </button>
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
