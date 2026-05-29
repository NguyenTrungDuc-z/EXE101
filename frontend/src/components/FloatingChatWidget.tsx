
import { type FormEvent, useState } from "react";
import { platformApi } from "../api/platformApi";
import ChatbotAvatar from "../assets/chatbot-avatar.svg";

const supportedServices = [
  { emoji: "🧼", label: "Vệ sinh nhà", detail: "Dọn dẹp, lau chùi, khử mùi" },
  { emoji: "❄️", label: "Vệ sinh máy lạnh", detail: "Làm sạch dàn lạnh, thông gió" },
  { emoji: "🔧", label: "Sửa chữa cơ bản", detail: "Van, ống, bồn rò" }
];

const starterMessages = [
  {
    role: "assistant" as const,
    content: "Xin chào! Tôi là HomeSwift AI. Mình hỗ trợ tư vấn về vệ sinh nhà, vệ sinh máy lạnh và sửa chữa cơ bản. Bạn cần giúp gì hôm nay?"
  }
];

const quickPrompts = [
  "Bảng giá vệ sinh nhà",
  "Đặt lịch vệ sinh máy lạnh",
  "Tôi cần hỗ trợ sửa chữa cơ bản"
];

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSending(true);

    try {
      const response = await platformApi.chatWithGemini({ message: trimmed });
      const reply = typeof response?.reply === "string" && response.reply.trim().length > 0
        ? response.reply.trim()
        : "Tôi chưa có phản hồi ngay lúc này, hãy thử lại với câu hỏi khác.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Xin lỗi, tôi đang gặp sự cố khi kết nối trợ lý. Vui lòng thử lại sau."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        className="help-chat-button"
        type="button"
        aria-label="Mở chat hỗ trợ"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="help-chat-button-inner">
          <img src={ChatbotAvatar} alt="Chatbot" style={{ width: 30, height: 30, borderRadius: "50%" }} />
        </span>
      </button>

      {isOpen ? (
        <section className="help-chat-panel" aria-label="Tư vấn trực tuyến">
          <div className="help-chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <img src={ChatbotAvatar} alt="Chatbot" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    width: 10,
                    height: 10,
                    borderRadius: "999px",
                    background: "#22c55e",
                    border: "2px solid #fff"
                  }}
                />
              </div>
              <div>
                <p className="help-chat-title">HomeSwift AI</p>
                <p className="help-chat-subtitle">Tư vấn nhanh, đặt lịch và hỗ trợ dịch vụ</p>
              </div>
            </div>
            <button
              className="help-chat-close"
              type="button"
              aria-label="Đóng chat"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="help-chat-service-strip" aria-label="Dịch vụ hỗ trợ">
            {supportedServices.map((service) => (
              <div className="help-chat-service-item" key={service.label}>
                <div className="help-chat-service-icon">{service.emoji}</div>
                <div>
                  <p className="help-chat-service-name">{service.label}</p>
                  <p className="help-chat-service-detail">{service.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="help-chat-thread" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`help-chat-bubble ${message.role}`}>
                {message.role === "assistant" ? (
                  <div className="help-chat-bubble-avatar" aria-hidden="true">
                    <img src={ChatbotAvatar} alt="Bot" style={{ width: 20, height: 20, borderRadius: "50%" }} />
                  </div>
                ) : (
                  <div className="help-chat-bubble-avatar user" aria-hidden="true">Bạn</div>
                )}
                <div className="help-chat-bubble-body">
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="help-chat-suggestions" aria-label="Gợi ý câu hỏi nhanh">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="help-chat-suggestion"
                type="button"
                onClick={() => setDraft(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="help-chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              aria-label="Nhập câu hỏi"
            />
            <button className="help-chat-send" type="submit" disabled={isSending}>
              {isSending ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
