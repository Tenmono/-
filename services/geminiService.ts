
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseIncomeText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `请从以下中文文本中提取收益信息: "${text}"。如果是亏损、亏了、支出、消费等负向收益，金额请提取为负数。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER, description: "金额，盈利为正，亏损为负" },
          source: { type: Type.STRING, description: "来源/原因" },
          category: { type: Type.STRING, description: "分类，如：工作、副业、理财、奖金、亏损、其他" }
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
