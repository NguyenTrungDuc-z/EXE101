import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import FacebookLogin from "../../auth/FacebookLogin";
import GoogleLogin from "../../auth/GoogleLogin";

const AUTH_STORAGE_KEY = "homeswift_user";
const FB_APP_ID = "1969315983727979";
const GOOGLE_CLIENT_ID = "221668802735-ps1j4hoftkj11obo4g4d0eod36ljc39h.apps.googleusercontent.com";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbLogin, setFbLogin] = useState<FacebookLogin | null>(null);

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

  return (
    <section className="login-shell">
      <div className="login-card">
        <Link to="/" className="login-logo">
          <span className="brand-icon" aria-hidden="true" />
          <strong>Home<span>Swift</span></strong>
        </Link>

        {/* Google's official Sign-In button is rendered here */}
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

        {feedback ? <p className="feedback login-feedback">{feedback}</p> : null}
      </div>
    </section>
  );
}