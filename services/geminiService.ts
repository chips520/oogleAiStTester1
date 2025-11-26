
import { GoogleGenAI } from "@google/genai";
import { AutomationProject } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select a paid API key using the key selector.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAutomationConfig = async (
  prompt: string, 
  currentProject: AutomationProject
): Promise<Partial<AutomationProject>> => {
  try {
    const ai = getClient();
    
    const systemPrompt = `
      You are an expert Industrial Automation Architect for a Low-Code IDE.
      The user describes a control requirement (e.g., "Monitor temp", "Manage Pallet", "Robot Handshake").
      You must convert this into a JSON configuration using Logic Steps, Scripts, and UI Widgets.

      ### AVAILABLE LOGIC STEPS (For simple flow):
      1. MODBUS_READ: { address: number, count: number, storeToVar: string }
      2. MODBUS_WRITE: { address: number, value: number | string (var name) }
      3. DELAY: { ms: number }
      4. LOG: { message: string }
      5. SCRIPT_CALL: { scriptId: string } (Use this to run complex logic defined in scripts)

      ### SCRIPTING (For complex logic):
      You can generate 'scripts'. 
      - Script Content is JavaScript.
      - Access variables via 'variables.myVar'.
      - Log via 'log("msg")'.
      - Example: "variables.count++; if(variables.count > 10) variables.alert = true;"

      ### AVAILABLE UI WIDGETS:
      1. BUTTON: { label: string, events: { onClick: string (scriptId) } }
      2. INDICATOR: { label: string, bindVar: string } (Red/Green light)
      3. GAUGE: { label: string, bindVar: string }
      4. LABEL: { label: string, bindVar: string }
      5. TRAY: { label: string, bindVar: string, rows: number, cols: number }

      ### RULES:
      - Return ONLY valid JSON with keys 'logicSteps', 'uiWidgets', 'scripts'.
      - Do not include markdown formatting.
      - If logic is complex (loops, array manipulation), CREATE A SCRIPT and use a Button to trigger it or a SCRIPT_CALL step.
      - Always ensure script IDs generated match the IDs used in events or steps.

      ### EXAMPLE OUTPUT:
      {
        "scripts": [
          { "id": "s1", "name": "ResetLogic", "content": "variables.counter = 0; log('Reset done');" }
        ],
        "uiWidgets": [
          { "id": "w1", "type": "BUTTON", "label": "Reset", "x": 0, "y": 0, "w": 1, "h": 1, "events": { "onClick": "s1" } }
        ]
      }
    `;

    const fullPrompt = `
      Current Variables: ${JSON.stringify(Object.keys(currentProject.variables))}
      Current Scripts: ${JSON.stringify(currentProject.scripts.map(s => s.name))}
      User Request: ${prompt}
      
      Generate the JSON config now.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse AI JSON", text);
        return {};
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
