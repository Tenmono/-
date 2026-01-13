
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseIncomeText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `请从以下中文文本中提取收入信息: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER, description: "金额" },
          source: { type: Type.STRING, description: "来源/原因" },
          category: { type: Type.STRING, description: "分类，如：工作、副业、理财、奖金、其他" }
        },
        required: ["amount", "source", "category"]
      }
    }
  });
  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return null;
  }
};
