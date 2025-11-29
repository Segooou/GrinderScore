import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMode, Trade } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible.
// Usa import.meta.env (padrão do Vite) e o nome correto da variável
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const sendChatMessage = async (
  message: string,
  base64Image: string | null,
  mode: ChatMode,
  tradeContext: Trade[]
): Promise<string> => {
  try {
    const contextString = tradeContext.length > 0 
      ? `\n\nCONTEXTO: Dados atuais de trades do usuário (JSON): ${JSON.stringify(tradeContext.slice(-20))}` 
      : '';

    const systemInstruction = `
    Se comporte como um analista especialista em mercado financeiro e derivativos, com foco em day trade no índice Ibovespa e no índice futuro (mini-índice WINFUT). 
    
    Sua função será analisar notícias econômicas e financeiras (decisões de juros, payroll, inflação, PIB, balança comercial, ata do Fed, Copom, etc.) ou responder dúvidas operacionais.

    Ao analisar uma notícia ou dado econômico, você DEVE OBRIGATORIAMENTE seguir esta estrutura de resposta:
    1. Contexto histórico: quais foram os dados anteriores (última divulgação relevante).
    2. Expectativa/projeção: o que o mercado esperava antes da divulgação.
    3. Dado atual/divulgado: valor real e comparação com o esperado.
    4. Análise qualitativa: como esse resultado afeta a percepção de risco, fluxo de capital estrangeiro, câmbio, juros futuros e apetite a risco.
    5. Impacto intraday: quais os possíveis reflexos imediatos no Ibovespa e no mini-índice (WINFUT) no pregão do dia, incluindo possíveis cenários de volatilidade, direção e intensidade de movimento.
    6. Operacional de derivativos: explique como esse tipo de notícia pode impactar opções, contratos futuros e o fluxo institucional, destacando oportunidades e riscos para operações de curtíssimo prazo.
    
    Ao final, entregue uma conclusão clara e prática, em formato de visão institucional para traders intraday, destacando os pontos mais relevantes para tomada de decisão rápida. 
    
    Sempre escreva em Português do Brasil, de forma objetiva, profunda e com linguagem de especialista (Use termos como Volatilidade, Liquidez, Padrão Gráfico, Setup, Contexto Macro, etc).
    ${contextString}`;

    let modelName = 'gemini-2.5-flash';
    let config: any = {
      systemInstruction,
    };

    // Configuration based on mode
    if (mode === ChatMode.THINKING) {
      modelName = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (mode === ChatMode.SEARCH) {
      modelName = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else {
      // Standard / Vision fallback
      if (base64Image) {
        modelName = 'gemini-3-pro-preview';
      } else {
        modelName = 'gemini-2.5-flash';
      }
    }

    const parts: any[] = [];
    
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', 
          data: base64Image
        }
      });
    }

    parts.push({ text: message });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config
    });

    // Handle Grounding (Search Results)
    let groundingText = '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingText = '\n\n**Fontes Consultadas:**\n';
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingText += `- [${chunk.web.title}](${chunk.web.uri})\n`;
        }
      });
    }

    return (response.text || "Não consegui gerar uma resposta.") + groundingText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
