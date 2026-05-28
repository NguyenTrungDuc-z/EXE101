import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";

const AUTH_STORAGE_KEY = "homeswift_user";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <section className="login-shell">
      <div className="login-card">
        <Link to="/" className="login-logo">
          <span className="brand-icon" aria-hidden="true" />
          <strong>Home<span>Swift</span></strong>
        </Link>

        <button className="social-button google-button" type="button">
          <span aria-hidden="true">G</span>
          Tiếp tục với Google
        </button>
        <button className="social-button facebook-button" type="button">
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

        {feedback ? <p className="feedback login-feedback">{feedback}</p> : null}
      </div>
    </section>
  );
}
