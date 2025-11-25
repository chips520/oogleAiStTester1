import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select a paid API key using the key selector.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCodeAssistance = async (
  prompt: string, 
  currentCode: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Contextual prompt to ensure relevant C# Modbus code
    const fullPrompt = `
      You are an expert .NET Core automation engineer. 
      The user is working on a script to control hardware via Modbus TCP.
      
      Current Code Context:
      \`\`\`csharp
      ${currentCode}
      \`\`\`

      User Request: ${prompt}

      Provide ONLY the C# code snippet or the modified function. 
      Do not include markdown code block syntax (\`\`\`) in the output, just raw text if possible, or minimal explanation.
      Focus on using libraries like NModbus or FluentModbus.
      If the user asks for a full script, provide a standard Console Application structure.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a helpful coding assistant specialized in Industrial IoT, Modbus, and C# .NET Core.",
        temperature: 0.2, // Low temperature for deterministic code
      }
    });

    return response.text || "// No response from AI";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `// Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

export const analyzeError = async (errorLog: string, code: string): Promise<string> => {
   try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have a runtime error in my .NET Modbus script.
      
      Code:
      ${code}

      Error:
      ${errorLog}

      Explain what is wrong and how to fix it briefly.`,
    });

    return response.text || "Could not analyze error.";
  } catch (e) {
    return "AI Service unavailable for error analysis.";
  }
}