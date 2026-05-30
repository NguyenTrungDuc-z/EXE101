import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
if (geminiApiKey) {
  console.log(`GEMINI_API_KEY found, length: ${geminiApiKey.length}`);
} else {
  console.warn("GEMINI_API_KEY not found in environment variables");
}

const genAI = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groqClient = groqApiKey
  ? new Groq({ apiKey: groqApiKey })
  : null;

function buildFallbackReply(message: string) {
  const normalized = String(message ?? "").toLowerCase();
  const hasPricingKeyword = normalized.includes("giá") || normalized.includes("bảng giá") || normalized.includes("bao nhiêu") || normalized.includes("chi phí") || normalized.includes("phí");

  if (hasPricingKeyword) {
    return "HomeSwift hỗ trợ các dịch vụ như vệ sinh nhà, vệ sinh máy lạnh, sửa chữa điện nước, giặt sofa, diệt côn trùng và dọn dẹp sân vườn. Bạn có thể xem bảng giá chi tiết trên website hoặc để tôi gợi ý dịch vụ phù hợp với nhu cầu của bạn.";
  }

  if (/đặt lịch|lịch|book|đặt/.test(normalized)) {
    return "Bạn có thể đặt lịch trực tiếp trên website hoặc nhắn tin cho chúng tôi. Hãy chọn dịch vụ, thời gian phù hợp, sau đó xác nhận lịch để đội ngũ đến đúng hẹn.";
  }

  if (/liên hệ|hotline|số điện thoại|gọi/.test(normalized)) {
    return "Bạn có thể liên hệ HomeSwift qua hotline 0833 256 780 hoặc qua website để được hỗ trợ nhanh nhất.";
  }

  if (/vệ sinh|máy lạnh|điều hòa|sửa chữa|điện nước|diệt côn trùng|sofa|sân vườn/.test(normalized)) {
    return "Tôi có thể hỗ trợ tư vấn các dịch vụ vệ sinh nhà, vệ sinh máy lạnh, sửa chữa điện nước, giặt sofa, diệt côn trùng và dọn dẹp sân vườn. Hãy cho tôi biết dịch vụ bạn cần và khu vực để mình đưa gợi ý phù hợp.";
  }

  return "Chào bạn! Tôi là trợ lý HomeSwift. Mình có thể hỗ trợ về dịch vụ gia đình, bảng giá, đặt lịch và tư vấn nhanh. Bạn muốn biết gì hôm nay?";
}

function isQuotaRelatedError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /429|quota|Too Many Requests|rate limit/i.test(text);
}

async function tryGroqReply(trimmedMessage: string, prompt: string) {
  if (!groqClient) {
    return null;
  }

  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: trimmedMessage
      }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  return completion.choices[0]?.message?.content?.trim() ?? null;
}

export const chatAI = async (req: any, res: any) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung câu hỏi.",
      });
    }

    const trimmedMessage = message.trim();

    if (!genAI) {
      console.warn("GEMINI_API_KEY missing, using fallback chat response.");
      return res.json({
        reply: buildFallbackReply(trimmedMessage),
      });
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
    Bạn là chatbot hỗ trợ khách hàng cho nền tảng dịch vụ gia đình HomeSwift.

    Nhiệm vụ:
    - Tư vấn các dịch vụ vệ sinh, sửa chữa, giặt ủi, điều hòa, điện nước, diệt côn trùng, giặt sofa, dọn dẹp sân vườn...
    - Báo giá dịch vụ, giải thích quy trình, hỗ trợ đặt lịch.
    - Trả lời ngắn gọn, thân thiện, rõ ràng, đúng trọng tâm.

    Định dạng trả lời:
    - Nếu khách hỏi về giá, nêu rõ giá từng dịch vụ nếu có, hoặc hướng dẫn xem chi tiết trên website.
    - Nếu khách hỏi đặt lịch, hướng dẫn thao tác đặt lịch trên web/app và lưu ý cần xác nhận.
    - Nếu khách hỏi thông tin chung, giải thích rõ ràng, không lan man.

    Khách hỏi:
    ${trimmedMessage}
    `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return res.json({
        reply: response,
      });
    } catch (geminiError) {
      console.error("Gemini request failed.", geminiError);

      if (isQuotaRelatedError(geminiError) && groqClient) {
        const prompt = `
    Bạn là chatbot hỗ trợ khách hàng cho nền tảng dịch vụ gia đình HomeSwift.

    Nhiệm vụ:
    - Tư vấn các dịch vụ vệ sinh, sửa chữa, giặt ủi, điều hòa, điện nước, diệt côn trùng, giặt sofa, dọn dẹp sân vườn...
    - Báo giá dịch vụ, giải thích quy trình, hỗ trợ đặt lịch.
    - Trả lời ngắn gọn, thân thiện, rõ ràng, đúng trọng tâm.

    Định dạng trả lời:
    - Nếu khách hỏi về giá, nêu rõ giá từng dịch vụ nếu có, hoặc hướng dẫn xem chi tiết trên website.
    - Nếu khách hỏi đặt lịch, hướng dẫn thao tác đặt lịch trên web/app và lưu ý cần xác nhận.
    - Nếu khách hỏi thông tin chung, giải thích rõ ràng, không lan man.

    Khách hỏi:
    ${trimmedMessage}
    `;

        try {
          const groqReply = await tryGroqReply(trimmedMessage, prompt);
          if (groqReply) {
            return res.json({
              reply: groqReply,
            });
          }
        } catch (groqError) {
          console.error("Groq fallback failed.", groqError);
        }
      }

      return res.json({
        reply: buildFallbackReply(trimmedMessage),
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
