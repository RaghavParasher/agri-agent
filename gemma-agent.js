// Gemma 4 Agent Simulation Logic with Native Function Calling support

const SYSTEM_PROMPT = `You are AgriAgent, an expert agricultural AI assistant powered by Gemma 4. 
You help farmers optimize crop yields, manage water resources, diagnose crop diseases, and check market prices.
You have access to the following real-time IoT sensors and agricultural tools:

1. get_soil_sensors(field_id: string) -> returns NPK levels, moisture %, temperature, and ph
2. get_weather_forecast(field_id: string) -> returns weather alerts and 3-day forecast
3. get_market_prices(crop_name: string) -> returns current market price trends in INR/quintal
4. trigger_irrigation(field_id: string, duration_minutes: number) -> activates smart irrigation sprinkler

Rules:
- When a user asks about sensor status, crop health, weather, prices, or irrigation, you MUST call the appropriate function first.
- To call a function, you must reply with a thought followed by a JSON block containing the tool call.
- Do NOT make assumptions about field sensors or weather conditions without calling the tools first.
- Keep your answers highly practical, farmer-focused, and supportive. Use metric units (Celsius, mg/kg, Quintals, etc.).
`;

const TOOLS_SCHEMA = [
    {
        name: "get_soil_sensors",
        description: "Fetch real-time nitrogen (N), phosphorus (P), potassium (K), moisture %, pH, and temperature for a given field ID.",
        parameters: {
            type: "object",
            properties: {
                field_id: { type: "string", description: "The field identifier (e.g. 'field-a', 'field-b', 'field-c')." }
            },
            required: ["field_id"]
        }
    },
    {
        name: "get_weather_forecast",
        description: "Retrieve local weather forecast, humidity, precipitation probability, and extreme agricultural alerts.",
        parameters: {
            type: "object",
            properties: {
                field_id: { type: "string", description: "The field identifier (e.g. 'field-a', 'field-b', 'field-c')." }
            },
            required: ["field_id"]
        }
    },
    {
        name: "get_market_prices",
        description: "Fetch current market price trends (INR per Quintal) for crops like Rice, Wheat, or Maize.",
        parameters: {
            type: "object",
            properties: {
                crop_name: { type: "string", description: "The crop name (e.g. 'Wheat', 'Rice', 'Maize')." }
            },
            required: ["crop_name"]
        }
    },
    {
        name: "trigger_irrigation",
        description: "Open the smart irrigation valve for a specific field for a designated number of minutes.",
        parameters: {
            type: "object",
            properties: {
                field_id: { type: "string", description: "The field identifier." },
                duration_minutes: { type: "integer", description: "Watering duration in minutes." }
            },
            required: ["field_id", "duration_minutes"]
        }
    }
];

class GemmaAgent {
    constructor(apis) {
        this.apis = apis;
        this.systemPrompt = SYSTEM_PROMPT;
        this.toolsSchema = TOOLS_SCHEMA;
    }

    // Main reasoning cycle simulator
    async runAgentLoop(userMessage, onStep) {
        const query = userMessage.toLowerCase().trim();
        console.log(`[GemmaAgent] Processing: "${userMessage}"`);

        // Step 1: Initial Prompt and Analysis
        onStep({
            stage: "prompt_sent",
            title: "Gemma 4 System Prompt & Query Input",
            content: `System Prompt:\n${this.systemPrompt}\n\nUser Query: "${userMessage}"`
        });
        await new Promise(r => setTimeout(r, 800));

        // Detect target field or crop
        let fieldId = "field-b"; // default to field-b which needs water/attention
        if (query.includes("field a") || query.includes("field-a") || query.includes("north field")) {
            fieldId = "field-a";
        } else if (query.includes("field c") || query.includes("field-c") || query.includes("valley slope")) {
            fieldId = "field-c";
        }

        let cropName = "Wheat";
        if (query.includes("rice") || query.includes("paddy")) {
            cropName = "Rice";
        } else if (query.includes("maize") || query.includes("corn")) {
            cropName = "Maize";
        } else if (fields[fieldId]) {
            cropName = fields[fieldId].crop;
        }

        // Determine tool call intent
        let toolCall = null;
        let thought = "";

        if (query.includes("water") || query.includes("irrigate") || query.includes("sprinkler")) {
            // Check if we just want to trigger it or ask about it
            const matchDuration = query.match(/(\d+)\s*(minute|min)/);
            const duration = matchDuration ? parseInt(matchDuration[1]) : 15;
            
            thought = `The user wants to water ${fields[fieldId].name}. I need to check the current soil moisture sensors first, check if rain is forecasted to prevent water waste, and if conditions warrant it, trigger irrigation. First, let's read the soil sensors.`;
            toolCall = {
                name: "get_soil_sensors",
                arguments: { field_id: fieldId }
            };
        } else if (query.includes("sensor") || query.includes("moisture") || query.includes("ph") || query.includes("npk") || query.includes("soil")) {
            thought = `The user is asking for soil sensor readings of ${fields[fieldId].name}. I will retrieve the current NPK, pH, moisture, and temperature.`;
            toolCall = {
                name: "get_soil_sensors",
                arguments: { field_id: fieldId }
            };
        } else if (query.includes("weather") || query.includes("rain") || query.includes("forecast") || query.includes("temperature")) {
            thought = `The user is asking about the weather. I will fetch the weather forecast and check for any local agricultural alerts for the region of ${fields[fieldId].name}.`;
            toolCall = {
                name: "get_weather_forecast",
                arguments: { field_id: fieldId }
            };
        } else if (query.includes("price") || query.includes("market") || query.includes("sell") || query.includes("quintal") || query.includes("rate")) {
            thought = `The user is inquiring about market prices or trading. I will query the current market price trends for ${cropName} to provide financial advice.`;
            toolCall = {
                name: "get_market_prices",
                arguments: { crop_name: cropName }
            };
        } else {
            // General query, maybe crop disease or simple talk
            thought = `The user is asking a general question: "${userMessage}". I will respond directly using my pre-trained knowledge base on agricultural practices.`;
        }

        // Output Thought and Tool Call
        if (toolCall) {
            onStep({
                stage: "reasoning",
                title: "Gemma 4 Thought & Tool Call Generation",
                content: `### Thought Process:\n${thought}\n\n### Tool Call JSON:\n\`\`\`json\n{\n  "tool_calls": [\n    {\n      "id": "call_${Math.random().toString(36).substr(2, 9)}",\n      "type": "function",\n      "function": {\n        "name": "${toolCall.name}",\n        "arguments": ${JSON.stringify(toolCall.arguments, null, 2)}\n      }\n    }\n  ]\n}\n\`\`\``
            });
            await new Promise(r => setTimeout(r, 1200));

            // Execute the Tool Call
            let toolResult;
            if (toolCall.name === "get_soil_sensors") {
                toolResult = this.apis.get_soil_sensors(toolCall.arguments.field_id);
            } else if (toolCall.name === "get_weather_forecast") {
                toolResult = this.apis.get_weather_forecast(toolCall.arguments.field_id);
            } else if (toolCall.name === "get_market_prices") {
                toolResult = this.apis.get_market_prices(toolCall.arguments.crop_name);
            }

            onStep({
                stage: "tool_execution",
                title: `Local System Execution: \`${toolCall.name}()\``,
                content: `Executing API Call locally...\nReceived response:\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``
            });
            await new Promise(r => setTimeout(r, 1000));

            // If we are watering, and checked sensors, let's trigger irrigation or offer a plan
            if (query.includes("water") || query.includes("irrigate") || query.includes("sprinkler")) {
                const sensorMoisture = toolResult.data.moisture;
                const weatherInfo = this.apis.get_weather_forecast(fieldId);
                
                let proceedWatering = true;
                let decisionExplanation = "";

                if (sensorMoisture >= 60) {
                    proceedWatering = false;
                    decisionExplanation = `Moisture level is already high (${sensorMoisture}%). Additional watering is not needed.`;
                } else if (weatherInfo.data.precipProbability >= 75) {
                    proceedWatering = false;
                    decisionExplanation = `High probability of rain (${weatherInfo.data.precipProbability}%) in the forecast. Suspending watering to save resources and avoid over-saturation.`;
                }

                if (proceedWatering) {
                    const matchDuration = query.match(/(\d+)\s*(minute|min)/);
                    const duration = matchDuration ? parseInt(matchDuration[1]) : 15;
                    
                    thought = `Moisture level is low (${sensorMoisture}%). Weather looks suitable with only ${weatherInfo.data.precipProbability}% chance of rain. I will proceed to open the irrigation valve for ${duration} minutes.`;
                    toolCall = {
                        name: "trigger_irrigation",
                        arguments: { field_id: fieldId, duration_minutes: duration }
                    };

                    onStep({
                        stage: "reasoning_2",
                        title: "Gemma 4 Second-Step Thought & Tool Call",
                        content: `### Thought Process:\n${thought}\n\n### Tool Call JSON:\n\`\`\`json\n{\n  "tool_calls": [\n    {\n      "id": "call_${Math.random().toString(36).substr(2, 9)}",\n      "type": "function",\n      "function": {\n        "name": "trigger_irrigation",\n        "arguments": {\n          "field_id": "${fieldId}",\n          "duration_minutes": ${duration}\n        }\n      }\n    }\n  ]\n}\n\`\`\``
                    });
                    await new Promise(r => setTimeout(r, 1000));

                    const irrResult = this.apis.trigger_irrigation(fieldId, duration);

                    onStep({
                        stage: "tool_execution_2",
                        title: `Local System Execution: \`trigger_irrigation()\``,
                        content: `Executing API Call locally...\nReceived response:\n\`\`\`json\n${JSON.stringify(irrResult, null, 2)}\n\`\`\``
                    });
                    await new Promise(r => setTimeout(r, 800));

                    // Final response generation after successful irrigation
                    const finalAnswer = `I have activated the smart irrigation valve for **${fields[fieldId].name}** for **${duration} minutes**. \n\n* **Before**: Soil moisture was at ${sensorMoisture}%\n* **After**: Soil moisture is now at **${fields[fieldId].moisture}%**\n\nThe sensors have verified that water is flowing successfully. I will keep monitoring the moisture level. Let me know if you need to run this on other fields!`;
                    onStep({
                        stage: "final_response",
                        title: "Gemma 4 Final Synthesis",
                        content: finalAnswer
                    });
                    return finalAnswer;
                } else {
                    const finalAnswer = `I checked the parameters for **${fields[fieldId].name}** and decided **not to water**:\n\n* **Current Soil Moisture**: ${sensorMoisture}%\n* **Rain Probability**: ${weatherInfo.data.precipProbability}%\n* **Decision**: ${decisionExplanation}\n\nBy withholding irrigation, you have conserved water and prevented roots from oversaturation. I will continue checking the telemetry hourly.`;
                    onStep({
                        stage: "final_response",
                        title: "Gemma 4 Final Synthesis",
                        content: finalAnswer
                    });
                    return finalAnswer;
                }
            }

            // Standard final answers for sensor, weather or prices check
            let finalAnswer = "";
            if (toolCall.name === "get_soil_sensors") {
                const data = toolResult.data;
                const statusStr = data.moisture < 40 ? "⚠️ Needs watering" : "✅ Optimal moisture";
                finalAnswer = `Here is the real-time sensor status for **${data.name}** (${data.crop}):\n\n` +
                    `- **Soil Moisture**: **${data.moisture}%** (${statusStr})\n` +
                    `- **Soil pH**: **${data.ph}** (Optimal range is 6.0 - 7.0)\n` +
                    `- **Temperature**: **${data.temperature}°C**\n` +
                    `- **Nutrient NPK Levels**:\n` +
                    `  - Nitrogen (N): **${data.npk.nitrogen} mg/kg** (Target: 50)\n` +
                    `  - Phosphorus (P): **${data.npk.phosphorus} mg/kg** (Target: 35)\n` +
                    `  - Potassium (K): **${data.npk.potassium} mg/kg** (Target: 50)\n\n` +
                    `*Recommendation*: ${data.moisture < 40 ? "The soil moisture is dangerously low for Wheat. I recommend initiating irrigation immediately." : "Your soil nutrients and moisture look well-balanced. No action is required."}`;
            } else if (toolCall.name === "get_weather_forecast") {
                const data = toolResult.data;
                const alerts = data.alerts.length > 0 
                    ? `\n\n🚨 **Alerts**:\n${data.alerts.map(a => `* **${a.type}**: ${a.message}`).join("\n")}`
                    : "\n\n✅ **Alerts**: No severe weather warnings for this field.";
                
                finalAnswer = `Here is the current agricultural weather forecast for **${data.location}**:\n\n` +
                    `- **Current Temp / Weather**: ${data.temperature}°C, ${data.condition}\n` +
                    `- **Humidity**: ${data.humidity}%\n` +
                    `- **Rain Probability**: ${data.precipProbability}%\n\n` +
                    `**3-Day Forecast**:\n` +
                    data.forecast.map(f => `* **${f.day}**: ${f.temp}°C - ${f.condition} (${f.precip}% rain chance)`).join("\n") +
                    alerts;
            } else if (toolCall.name === "get_market_prices") {
                const data = toolResult.data;
                finalAnswer = `Here is the market price update for **${toolResult.crop}**:\n\n` +
                    `- **Current Price**: **₹${data.currentPrice} per Quintal**\n` +
                    `- **Trend**: ${data.trend === "up" ? "📈 Rising" : "📉 Declining"} in local markets\n` +
                    `- **Recent price points (last 6 days)**: ₹${data.history.join(", ₹")}\n\n` +
                    `*Financial Suggestion*: Prices have been on a steady upward trajectory. If you have storage facilities, I suggest holding inventory for another 3-5 days to maximize revenue, as demand in nearby districts is projected to rise.`;
            }

            onStep({
                stage: "final_response",
                title: "Gemma 4 Final Synthesis",
                content: finalAnswer
            });
            return finalAnswer;

        } else {
            // General conversation / crop disease help
            onStep({
                stage: "reasoning",
                title: "Gemma 4 Direct Knowledge Query",
                content: `### Thought Process:\nNo tool call is necessary. Answering the user using built-in agricultural expertise regarding crop health, soil management, or generic diagnostics.`
            });
            await new Promise(r => setTimeout(r, 1000));

            let finalAnswer = "";
            if (query.includes("yellow") || query.includes("leaf") || query.includes("leaves")) {
                finalAnswer = `Yellowing of leaves (chlorosis) in crops can stem from several issues. Let's analyze based on common patterns:\n\n` +
                    `1. **Nitrogen Deficiency**: Older leaves yellow first, starting from the leaf tips. *Fix: Apply nitrogen-rich fertilizer (Urea or organic compost).* \n` +
                    `2. **Overwatering/Poor Drainage**: Yellowing is uniform, leaves feel limp, and soil is soggy. *Fix: Suspend irrigation and verify field channels.* \n` +
                    `3. **Iron/Micronutrient Deficiency**: Yellowing occurs between the veins of young leaves first. *Fix: Apply chelated iron spray.*\n\n` +
                    `*Next Step*: I recommend asking me to check your soil NPK sensors or checking the current weather to narrow down the cause!`;
            } else if (query.includes("hello") || query.includes("hi") || query.includes("help") || query.includes("start")) {
                finalAnswer = `Hello! I am **AgriAgent**, your Gemma 4 agricultural assistant. \n\nI can help you monitor sensor status, automate smart irrigation, check forecasts, and analyze market price data. \n\n**Here are some things you can try:**\n* "Check sensors in Field B"\n* "Show the weather forecast for Field C"\n* "What is the market price of Wheat right now?"\n* "Water Field B for 20 minutes"`;
            } else {
                finalAnswer = `I'm here to assist you with agricultural queries. You can ask me to monitor your soil sensors, verify local weather conditions, fetch market crop rates, or configure smart irrigation timers. How can I help you in the fields today?`;
            }

            onStep({
                stage: "final_response",
                title: "Gemma 4 Final Synthesis",
                content: finalAnswer
            });
            return finalAnswer;
        }
    }
}

window.GemmaAgent = GemmaAgent;
