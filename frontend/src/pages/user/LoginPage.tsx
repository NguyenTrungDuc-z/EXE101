import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import FacebookLogin from "../../auth/FacebookLogin";
import GoogleLogin from "../../auth/GoogleLogin";

const AUTH_STORAGE_KEY = "homeswift_user";
const FB_APP_ID = "1969315983727979";
const GOOGLE_CLIENT_ID = "221668802735-ps1j4hoftkj11obo4g4d0eod36ljc39h.apps.googleusercontent.com";
const cityOptions = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khánh Hòa"];

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isValidVietnamPhone(value: string) {
  return /^0(3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-46-9])\d{7}$/.test(value);
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

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerCity, setRegisterCity] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbLogin, setFbLogin] = useState<FacebookLogin | null>(null);
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
    city: registerCity ? "" : "Vui lòng chọn thành phố/khu vực."
  };
  const canSubmitRegister =
    !registerFieldErrors.name && !registerFieldErrors.phone && !registerFieldErrors.email && !registerFieldErrors.city;

  useEffect(() => {
    // Initialize Facebook Login
    const fbLoginInstance = new FacebookLogin(FB_APP_ID);
    setFbLogin(fbLoginInstance);

    // Initialize Google Login and render the button
    const googleLoginInstance = new GoogleLogin(GOOGLE_CLIENT_ID);
    const redirectPath = searchParams.get("redirect") || "/user/workspace";

    googleLoginInstance.setOnLoginSuccess((authResponse) => {
      console.log("Google login success:", authResponse);
      const decodedUser = googleLoginInstance.decodeCredential(authResponse.credential);
      const mockUser = {
        id: decodedUser?.sub || "google_user",
        name: decodedUser?.name || "Google User",
        email: decodedUser?.email,
        token: authResponse.credential,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      window.dispatchEvent(new Event("homeswift-auth"));
      setFeedback("Đăng nhập Google thành công!");
      setTimeout(() => navigate(redirectPath), 500);
    });

    googleLoginInstance.setOnLoginError((error) => {
      setFeedback(error.message);
    });

    // Render Google's official button into the div
    setTimeout(() => {
      googleLoginInstance.renderButton("google-signin-button");
    }, 500);
  }, []);

  const handleFacebookLogin = async () => {
    if (!fbLogin) {
      setFeedback("Facebook SDK đang khởi tạo, vui lòng thử lại sau giây lát.");
      return;
    }
    setFeedback("");
    setIsSubmitting(true);
    try {
      const authResponse = await fbLogin.login();
      console.log("Facebook login success:", authResponse);
      const mockUser = {
        id: authResponse.userID,
        name: "Facebook User",
        token: authResponse.accessToken,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      window.dispatchEvent(new Event("homeswift-auth"));
      const redirectPath = searchParams.get("redirect") || "/user/workspace";
      setFeedback("Đăng nhập Facebook thành công!");
      setTimeout(() => navigate(redirectPath), 500);
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");

    if (!identifier.trim()) {
      setFeedback("Vui lòng nhập số điện thoại.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await platformApi.login({ phone: identifier.trim() });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
      window.dispatchEvent(new Event("homeswift-auth"));
      const redirectPath = searchParams.get("redirect") || "/user/workspace";
      setFeedback("Đăng nhập thành công. Đang chuyển trang...");
      setTimeout(() => navigate(redirectPath), 500);
    } catch (reason) {
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    const phone = normalizedRegisterPhone;

    if (!canSubmitRegister) {
      setFeedback("Vui lòng kiểm tra lại thông tin đăng ký.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await platformApi.register({
        name: registerName.trim(),
        phone,
        email: registerEmail.trim(),
        city: registerCity
      });
      setOtpPhone(result.phone);
      setOtpCode("");
      setOtpHint(result.devOtp ? `Mã OTP demo: ${result.devOtp}` : "");
      setIsOtpOpen(true);
      setFeedback(result.message);
    } catch (reason) {
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFeedback("Vui lòng nhập mã OTP gồm 6 số.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await platformApi.verifyRegisterOtp({ phone: otpPhone, otp: otpCode.trim() });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...result.user, token: result.token }));
      window.dispatchEvent(new Event("homeswift-auth"));
      const redirectPath = searchParams.get("redirect") || "/user/workspace";
      setFeedback("Xác thực thành công. Đang chuyển trang...");
      setIsOtpOpen(false);
      setTimeout(() => navigate(redirectPath), 500);
    } catch (reason) {
      setFeedback((reason as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <div className="login-card">
        <Link to="/" className="login-logo">
          <span className="brand-icon" aria-hidden="true" />
          <strong>Home<span>Swift</span></strong>
        </Link>

        <div className="auth-mode-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => {
              setMode("login");
              setFeedback("");
            }}
          >
            Đăng nhập
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => {
              setMode("register");
              setFeedback("");
            }}
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
                onChange={(event) => {
                  setRegisterName(event.target.value);
                  setFeedback("");
                }}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={Boolean(registerFieldErrors.name)}
              />
              {registerFieldErrors.name ? <small className="field-error">{registerFieldErrors.name}</small> : null}
            </label>
            <label>
              Số điện thoại
              <input
                value={registerPhone}
                onChange={(event) => {
                  setRegisterPhone(normalizePhone(event.target.value).slice(0, 10));
                  setFeedback("");
                }}
                placeholder="0901 234 567"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={Boolean(registerFieldErrors.phone)}
              />
              {registerFieldErrors.phone ? <small className="field-error">{registerFieldErrors.phone}</small> : null}
            </label>
            <label>
              Email
              <input
                value={registerEmail}
                onChange={(event) => {
                  setRegisterEmail(event.target.value);
                  setFeedback("");
                }}
                placeholder="email@homeswift.vn"
                autoComplete="email"
                aria-invalid={Boolean(registerFieldErrors.email)}
              />
              {registerFieldErrors.email ? <small className="field-error">{registerFieldErrors.email}</small> : null}
            </label>
            <label>
              Khu vực
              <select
                value={registerCity}
                onChange={(event) => {
                  setRegisterCity(event.target.value);
                  setFeedback("");
                }}
                required
                aria-invalid={Boolean(registerFieldErrors.city)}
              >
                <option value="" disabled>Chọn thành phố/khu vực</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {registerFieldErrors.city ? <small className="field-error">{registerFieldErrors.city}</small> : null}
            </label>
            <button className="button primary login-submit" type="submit" disabled={isSubmitting || !canSubmitRegister}>
              {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
        )}

        {feedback ? <p className="feedback login-feedback">{feedback}</p> : null}
      </div>

      {isOtpOpen ? (
        <div className="otp-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="otp-title">
          <form className="otp-modal" onSubmit={submitOtp}>
            <h2 id="otp-title">Xác thực số điện thoại</h2>
            <p>Mã OTP đã được gửi tới số {otpPhone}. Vui lòng nhập mã để hoàn tất đăng ký.</p>
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
