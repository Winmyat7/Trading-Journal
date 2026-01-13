
import { GoogleGenAI, Type } from "@google/genai";
import { Trade, TradeResult } from "../types";

export interface SearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export interface PsychologicalTheme {
  theme: string;
  description: string;
  winCount: number;
  lossCount: number;
  totalPnL: number;
  recommendation: string;
}

export const searchMarketIntelligence = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a senior market analyst at a top-tier hedge fund. Your goal is to synthesize the latest high-signal intelligence from professional traders, institutional news, and retail sentiment. Provide a concise, action-oriented summary. Prioritize 'Smart Money' movements and macroeconomic catalysts."
      }
    });

    const text = response.text || "No insights found for this query.";
    const sources: { title: string; uri: string }[] = [];
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            web: {
              uri: chunk.web.uri,
              title: chunk.web.title || "Market Source"
            }
          } as any);
        }
      });
    }

    const finalSources = (groundingChunks || [])
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title || 'Market Source', uri: c.web.uri }));

    return { text, sources: finalSources };
  } catch (error) {
    console.error("Market Intelligence Error:", error);
    return { 
      text: "Unable to reach the global trading network. Please check your connection.", 
      sources: [] 
    };
  }
};

export const analyzeTradeWithAI = async (trade: Trade): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const parts: any[] = [
    {
      text: `
        Analyze this trade as a Lead Risk Manager at a Quantitative Proprietary Trading Firm. 
        
        ### TRADE PARAMETERS ###
        - Asset: ${trade.symbol} (${trade.side})
        - Result: ${trade.result} | PnL: $${trade.pnl}
        - Strategy: ${trade.entryType} | TF: ${trade.timeFrame}
        - Execution: Entry @ ${trade.entry}, SL @ ${trade.stopLoss}, TP @ ${trade.takeProfit}
        - Risk Metrics: RR ${trade.rr} | Lot Size ${trade.lotSize}
        - Narrative/Notes: "${trade.notes || 'No psychological context provided.'}"

        ### EVALUATION REQUIREMENTS ###
        1. CRITIQUE THE SETUP: Based on the ${trade.entryType} model, was this a high-probability A+ setup or a low-conviction 'gambler' entry? If images are provided, verify the technical confluence (Liquidity, FVG, Order Blocks, etc.).
        2. EXIT EFFICIENCY: Evaluate the Take Profit and Stop Loss placement. Did the trader leave money on the table, or was the exit perfectly timed with structural exhaustion?
        3. BEHAVIORAL DIAGNOSTIC: Analyze the notes for sub-surface emotional triggers. Look for 'Early Exit Anxiety', 'FOMO Entry', or 'Oversizing'.
        4. VERDICT & DRILLS: Provide a final 'Grading' (A-F) and 3 specific technical or psychological drills to improve performance in the next 10 trades.
      `
    }
  ];

  const processImage = (dataUrl: string) => {
    if (!dataUrl || !dataUrl.includes(',')) return null;
    try {
      const [header, data] = dataUrl.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return { data, mimeType };
    } catch (e) {
      console.error("Image processing error", e);
      return null;
    }
  };

  if (trade.entryImage) {
    const processed = processImage(trade.entryImage);
    if (processed) {
      parts.push({ text: "### MULTIMODAL INPUT: ENTRY CHART SNAPSHOT ###" });
      parts.push({ inlineData: processed });
    }
  }

  if (trade.exitImage) {
    const processed = processImage(trade.exitImage);
    if (processed) {
      parts.push({ text: "### MULTIMODAL INPUT: EXIT CHART SNAPSHOT ###" });
      parts.push({ inlineData: processed });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        systemInstruction: "You are the 'Pseudo-Whale Mentor'. You are a cold, hyper-logical institutional veteran. You have zero tolerance for sloppy execution, emotional bias, or lack of discipline. Your language is sharp, technical (using SMC/ICT and institutional orderflow terminology), and focuses on professionalizing the trader's approach."
      }
    });
    
    return response.text || "Analysis failed. Ensure trade notes and images provide enough context.";
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return "The AI mentor is refining its edge. Please try again in a moment.";
  }
};

export const analyzePsychologicalPatterns = async (trades: Trade[]): Promise<PsychologicalTheme[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const tradesWithNotes = trades.filter(t => t.notes && t.notes.trim().length > 5 && t.result !== TradeResult.PENDING);
  if (tradesWithNotes.length === 0) return [];

  const tradeDataString = tradesWithNotes.map(t => `
    [ID: ${t.id}]
    OUTCOME: ${t.result} (${t.pnl >= 0 ? '+' : ''}$${t.pnl})
    SYMBOL/SIDE: ${t.symbol} ${t.side}
    ENTRY TYPE: ${t.entryType}
    JOURNAL NOTE: ${t.notes}
  `).join('\n---\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep-dive behavioral audit on the following trade journal log. Search for recurring cognitive biases, emotional triggers, and execution 'leaks' hidden in the text. \n\n### DATA LOG ###\n${tradeDataString}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING, description: "Professional name for the behavior (e.g., 'Retrospective Over-analysis', 'Premature De-risking', 'Revenge Escalation')" },
              description: { type: Type.STRING, description: "Detailed observation of the pattern, citing specific examples from the notes without naming IDs" },
              winCount: { type: Type.NUMBER, description: "Wins associated with this mindset" },
              lossCount: { type: Type.NUMBER, description: "Losses associated with this mindset" },
              totalPnL: { type: Type.NUMBER, description: "Cumulative PnL impact" },
              recommendation: { type: Type.STRING, description: "Institutional-grade fix or protocol to mitigate/exploit this theme" }
            },
            required: ["theme", "description", "winCount", "lossCount", "totalPnL", "recommendation"]
          }
        },
        systemInstruction: "You are a specialized High-Performance Trading Psychologist. Your objective is to extract 'Behavioral Alpha' by identifying patterns that distinguish the user's winning mindset from their losing mindset. Look beyond simple words like 'greedy'—find structural leaks in their decision-making process (e.g., 'Scaling into losers', 'Tightening stops prematurely due to recent loss history')."
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Psychological Analysis Error:", error);
    return [];
  }
};
