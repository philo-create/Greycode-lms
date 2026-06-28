import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// A robust local deterministic circuit router as a ultimate fail-safe if the API is experiencing 503 errors
function localRuleBasedRoute(components: any[], userPrompt: string): { success: boolean; connections: any[]; explanation: string } {
  const batteries = components.filter(c => c.componentType === 'battery');
  const leds = components.filter(c => c.componentType === 'led');
  const resistors = components.filter(c => c.componentType === 'resistor');
  const motors = components.filter(c => ['motor', 'wheel', 'robot-arm'].includes(c.componentType || ''));
  const esp32s = components.filter(c => c.componentType === 'esp32');

  const connections: any[] = [];
  let explanationParts: string[] = [];

  // If there's an ESP32 and a Battery, power the ESP32 from the Battery
  if (esp32s.length > 0 && batteries.length > 0) {
    const esp = esp32s[0];
    const battery = batteries[0];
    connections.push({
      startBoardId: battery.id,
      startPin: "vcc",
      endBoardId: esp.id,
      endPin: "5V",
      color: "#ef4444"
    });
    connections.push({
      startBoardId: esp.id,
      startPin: "GND_1",
      endBoardId: battery.id,
      endPin: "gnd",
      color: "#3b82f6"
    });
    explanationParts.push("Connected the Battery to the ESP32 to provide power.");
  }

  // 1. ESP32-centric designs
  if (esp32s.length > 0) {
    const esp = esp32s[0];
    explanationParts.push("Using your ESP32 Microcontroller to control the circuit 💻.");

    if (leds.length > 0) {
      leds.forEach((led, index) => {
        const resistor = resistors[index];
        const signalPin = index === 0 ? "18" : (index === 1 ? "5" : "4"); // digital output pins
        const gndPin = index === 0 ? "GND_1" : "GND_2";

        if (resistor) {
          connections.push({
            startBoardId: esp.id,
            startPin: signalPin,
            endBoardId: resistor.id,
            endPin: "left",
            color: "#8b5cf6" // Purple for signal/digital pin
          });
          connections.push({
            startBoardId: resistor.id,
            startPin: "right",
            endBoardId: led.id,
            endPin: "anode",
            color: "#f59e0b"
          });
          explanationParts.push(`Connected ESP32 pin ${signalPin} to LED through protective resistor ${resistor.id}.`);
        } else {
          connections.push({
            startBoardId: esp.id,
            startPin: signalPin,
            endBoardId: led.id,
            endPin: "anode",
            color: "#8b5cf6"
          });
          explanationParts.push(`Connected ESP32 pin ${signalPin} directly to LED anode. Remember that adding a resistor is best practice!`);
        }

        connections.push({
          startBoardId: led.id,
          startPin: "cathode",
          endBoardId: esp.id,
          endPin: gndPin,
          color: "#3b82f6"
        });
      });
    }

    if (motors.length > 0) {
      motors.forEach((motor, index) => {
        const signalPin = index === 0 ? "2" : "23";
        connections.push({
          startBoardId: esp.id,
          startPin: signalPin,
          endBoardId: motor.id,
          endPin: "term1",
          color: "#8b5cf6"
        });
        connections.push({
          startBoardId: motor.id,
          startPin: "term2",
          endBoardId: esp.id,
          endPin: "GND_2",
          color: "#3b82f6"
        });
        explanationParts.push(`Connected motor ${motor.id} to ESP32 control pin ${signalPin} and Ground.`);
      });
    }
  } 
  // 2. Battery-centric designs (if no ESP32 exists)
  else if (batteries.length > 0) {
    const battery = batteries[0];
    explanationParts.push("Using your Battery as the main power source 🔋.");

    // Loop through LEDs and connect them safely (resistor in series if available)
    if (leds.length > 0) {
      leds.forEach((led, index) => {
        const resistor = resistors[index];
        if (resistor) {
          // Battery VCC -> Resistor Left
          connections.push({
            startBoardId: battery.id,
            startPin: "vcc",
            endBoardId: resistor.id,
            endPin: "left",
            color: "#ef4444" // Red for positive path
          });
          // Resistor Right -> LED Anode
          connections.push({
            startBoardId: resistor.id,
            startPin: "right",
            endBoardId: led.id,
            endPin: "anode",
            color: "#f59e0b" // Orange for series middle path
          });
          explanationParts.push(`Connected ${led.componentType} through resistor ${resistor.id} to protect the LED from burning out.`);
        } else {
          // Direct connection with educational warning
          connections.push({
            startBoardId: battery.id,
            startPin: "vcc",
            endBoardId: led.id,
            endPin: "anode",
            color: "#ef4444"
          });
          explanationParts.push(`⚠️ Directly connected LED ${led.id} to the battery. In real circuits, remember to add a resistor to protect the LED!`);
        }
        // LED Cathode -> Battery GND
        connections.push({
          startBoardId: led.id,
          startPin: "cathode",
          endBoardId: battery.id,
          endPin: "gnd",
          color: "#3b82f6" // Blue for ground
        });
      });
    }

    // Connect any motors
    if (motors.length > 0) {
      motors.forEach((motor) => {
        connections.push({
          startBoardId: battery.id,
          startPin: "vcc",
          endBoardId: motor.id,
          endPin: "term1",
          color: "#ef4444"
        });
        connections.push({
          startBoardId: motor.id,
          startPin: "term2",
          endBoardId: battery.id,
          endPin: "gnd",
          color: "#3b82f6"
        });
        explanationParts.push(`Connected motor/arm ${motor.id} directly to your power supply loop.`);
      });
    }
  } else {
    explanationParts.push("Add a Battery or an ESP32 to supply power to your circuit components!");
  }

  const defaultExp = explanationParts.join(" ");

  return {
    success: connections.length > 0,
    connections,
    explanation: defaultExp || "Circuit routing completed successfully!"
  };
}

export async function POST(req: NextRequest) {
  let requestBody: any = null;
  try {
    requestBody = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { components, userPrompt } = requestBody || {};

  if (!components || !Array.isArray(components)) {
    return NextResponse.json({ success: false, error: "Missing components array" }, { status: 400 });
  }

  const availableComponentsText = components.map(c => 
    `- ID: "${c.id}", Type: "${c.componentType}"`
  ).join("\n");

  const prompt = `
    You are an expert Electrical Engineer and Circuit Auto-Router.
    Your task is to analyze the user's electronic components on their virtual canvas and find the correct, safe, and logical connection wires between their pins.

    List of components currently on the board:
    ${availableComponentsText}

    User custom request/prompt (optional):
    "${userPrompt || "Auto-route the circuit safely to power up the components!"}"

    Here are the components and their connectable pins:
    1. "led":
       - "anode" (positive leg, connects to high voltage/VCC/resistor)
       - "cathode" (negative leg, connects to GND)
    2. "resistor":
       - "left"
       - "right"
    3. "battery":
       - "vcc" (positive, high voltage, red)
       - "gnd" (negative, ground, blue/black)
    4. "esp32" (microcontroller):
       - Left pins: "TX", "RX", "3V3", "GND_1", "22", "21", "23", "19", "18", "5", "4", "2", "0", "RST", "GND_2", "VIN_5V"
       - Right pins: "3V3_2", "GND_3", "36", "39", "34", "35", "32", "33", "25", "26", "27", "14", "12", "13", "15", "VBAT"
       - Standard digital output pin is "18", "5", "4", "2" etc.
       - Standard VCC pins are "3V3" or "VIN_5V"
       - Standard ground pins are "GND_1", "GND_2" or "GND_3"
    5. "motor" / "wheel" / "robot-arm":
       - "term1" (terminal 1)
       - "term2" (terminal 2)
    6. "breadboard": (skip auto-routing to breadboards unless explicitly requested. Prefer connecting components directly).

    RULES FOR AUTO-ROUTING SAFETY:
    - Connecting an LED directly to a battery (vcc to anode, cathode to gnd) is unsafe (burns the LED). If a resistor is present, route the battery VCC through the resistor, then to the LED anode, and LED cathode to battery GND.
    - Wires should have colors:
      - Red ("#ef4444") for positive paths (VCC, 3V3, VIN_5V, anode, signal positive).
      - Blue ("#3b82f6") for ground paths (GND, GND_1, GND_2, GND_3, cathode).
      - Amber/Orange ("#f59e0b") or Purple ("#8b5cf6") for signal / series middle connections.
    - Generate a minimum list of wire connections needed to complete the circuit based on the available components.
    - Do not connect a pin to itself.
    - Do not connect vcc directly to gnd (short circuit).

    Return your response in JSON format matching this schema:
    {
      "success": boolean,
      "connections": [
        {
          "startBoardId": string,
          "startPin": string,
          "endBoardId": string,
          "endPin": string,
          "color": string
        }
      ],
      "explanation": string
    }
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      success: {
        type: Type.BOOLEAN,
        description: "Whether routing was successfully planned."
      },
      connections: {
        type: Type.ARRAY,
        description: "List of connection wires to draw between component pins.",
        items: {
          type: Type.OBJECT,
          properties: {
            startBoardId: { type: Type.STRING, description: "ID of the starting component" },
            startPin: { type: Type.STRING, description: "Name of the starting pin" },
            endBoardId: { type: Type.STRING, description: "ID of the ending component" },
            endPin: { type: Type.STRING, description: "Name of the ending pin" },
            color: { type: Type.STRING, description: "Hex color code for the wire" }
          },
          required: ["startBoardId", "startPin", "endBoardId", "endPin", "color"]
        }
      },
      explanation: {
        type: Type.STRING,
        description: "A friendly, educational explanation of how the circuit was routed for young learners."
      }
    },
    required: ["success", "connections", "explanation"]
  };

  // Tier 1: Try gemini-2.5-flash (primary recommended model)
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2
      }
    });

    const resultText = response.text?.trim() || "";
    const parsed = JSON.parse(resultText);
    return NextResponse.json(parsed);
  } catch (error1: any) {
    console.warn("Primary model (gemini-2.5-flash) failed or high demand. Trying backup model...", error1);

    // Tier 2: Try gemini-1.5-flash (highly reliable secondary model)
    try {
      const response = await getAi().models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2
        }
      });

      const resultText = response.text?.trim() || "";
      const parsed = JSON.parse(resultText);
      return NextResponse.json(parsed);
    } catch (error2: any) {
      console.warn("Backup model (gemini-1.5-flash) also failed. Running local rule-based router as fail-safe.", error2);

      // Tier 3: Run the local deterministic rule-based fail-safe
      try {
        const localResult = localRuleBasedRoute(components, userPrompt || "");
        return NextResponse.json(localResult);
      } catch (localError: any) {
        console.error("Local deterministic routing failed:", localError);
        return NextResponse.json({
          success: false,
          error: "All routing attempts failed: " + (localError.message || "Unknown error")
        }, { status: 500 });
      }
    }
  }
}
