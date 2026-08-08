// Gemma 4 Agent Simulation Logic with Native Function Calling & Parallel execution support

const SYSTEM_PROMPT = `You are AgriAgent, an expert agricultural AI assistant powered by Gemma 4. 
You help farmers optimize crop yields, manage water resources, diagnose crop diseases, and check market prices.
You have access to the following real-time IoT sensors and agricultural tools:

1. get_soil_sensors(field_id: string) -> returns NPK levels, moisture %, temperature, and ph
2. get_weather_forecast(field_id: string) -> returns weather alerts and 3-day forecast
3. get_market_prices(crop_name: string) -> returns current market price trends in INR/quintal
4. trigger_irrigation(field_id: string, duration_minutes: number) -> activates smart irrigation sprinkler
5. analyze_crop_image(image_id: string) -> performs multimodal analysis on a crop leaf photo to diagnose infections

Rules:
- When a user asks about sensor status, crop health, weather, prices, or irrigation, you MUST call the appropriate function first.
- You support PARALLEL FUNCTION CALLING. If the user asks multiple questions, call ALL relevant tools concurrently in a single step.
- To call functions, you must reply with a thought followed by a JSON block containing one or more tool calls.
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
    },
    {
        name: "analyze_crop_image",
        description: "Perform vision analysis on an uploaded image ID to diagnose crop diseases and outline organic/chemical solutions.",
        parameters: {
            type: "object",
            properties: {
                image_id: { type: "string", description: "The uploaded leaf image identifier (e.g. 'wheat-rust', 'maize-blight', 'rice-healthy')." }
            },
            required: ["image_id"]
        }
    }
];

class GemmaAgent {
    constructor(apis) {
        this.apis = apis;
        this.systemPrompt = SYSTEM_PROMPT;
        this.toolsSchema = TOOLS_SCHEMA;
    }

    async runAgentLoop(userMessage, onStep) {
        const query = userMessage.toLowerCase().trim();
        console.log(`[GemmaAgent] Processing: "${userMessage}"`);

        // Step 1: Prompt Sent
        onStep({
            stage: "prompt_sent",
            title: "Gemma 4 System Prompt & Query Input",
            content: `System Prompt:\n${this.systemPrompt}\n\nUser Query: "${userMessage}"`
        });
        await new Promise(r => setTimeout(r, 600));

        // State detection
        let fieldId = "field-b";
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
        } else if (window.AgriAPIs.fields[fieldId]) {
            cropName = window.AgriAPIs.fields[fieldId].crop;
        }

        // Parallel Tool Parsing
        let toolCalls = [];
        let thoughtParts = [];

        // Check for Image Diagnostics
        if (query.includes("analyze leaf") || query.includes("check image") || query.includes("diagnose crop")) {
            // Extract leaf type
            let leafId = "wheat-rust";
            if (query.includes("rice") || query.includes("rice-healthy")) leafId = "rice-healthy";
            if (query.includes("maize") || query.includes("maize-blight")) leafId = "maize-blight";

            thoughtParts.push(`The user has provided a leaf image (${leafId}). I will trigger my multimodal vision system to diagnose the crop leaf image.`);
            toolCalls.push({
                id: `call_${Math.random().toString(36).substr(2, 9)}`,
                type: "function",
                function: {
                    name: "analyze_crop_image",
                    arguments: { image_id: leafId }
                }
            });
        }

        // Check for Sensor Telemetry
        if (query.includes("sensor") || query.includes("moisture") || query.includes("ph") || query.includes("npk") || query.includes("soil")) {
            // Only add if not doing general watering
            if (!query.includes("water") && !query.includes("irrigate")) {
                thoughtParts.push(`The user wants to check soil sensor telemetry for ${fieldId}. I will query the NPK, moisture, pH, and temp sensors.`);
                toolCalls.push({
                    id: `call_${Math.random().toString(36).substr(2, 9)}`,
                    type: "function",
                    function: {
                        name: "get_soil_sensors",
                        arguments: { field_id: fieldId }
                    }
                });
            }
        }

        // Check for Weather
        if (query.includes("weather") || query.includes("rain") || query.includes("forecast") || query.includes("temperature")) {
            thoughtParts.push(`The user wants weather details for ${fieldId}. I will check forecasts and warning alerts.`);
            toolCalls.push({
                id: `call_${Math.random().toString(36).substr(2, 9)}`,
                type: "function",
                function: {
                    name: "get_weather_forecast",
                    arguments: { field_id: fieldId }
                }
            });
        }

        // Check for Prices
        if (query.includes("price") || query.includes("market") || query.includes("sell") || query.includes("quintal") || query.includes("rate")) {
            thoughtParts.push(`The user is inquiring about market rates for ${cropName}. I will query local market databases.`);
            toolCalls.push({
                id: `call_${Math.random().toString(36).substr(2, 9)}`,
                type: "function",
                function: {
                    name: "get_market_prices",
                    arguments: { crop_name: cropName }
                }
            });
        }

        // Check for Watering
        if (query.includes("water") || query.includes("irrigate") || query.includes("sprinkler")) {
            thoughtParts.push(`The user wants to water ${fieldId}. I will retrieve the soil sensors and weather forecasts in parallel to determine if irrigation is required.`);
            toolCalls.push({
                id: `call_${Math.random().toString(36).substr(2, 9)}`,
                type: "function",
                function: {
                    name: "get_soil_sensors",
                    arguments: { field_id: fieldId }
                }
            });
            toolCalls.push({
                id: `call_${Math.random().toString(36).substr(2, 9)}`,
                type: "function",
                function: {
                    name: "get_weather_forecast",
                    arguments: { field_id: fieldId }
                }
            });
        }

        // Execution of first stage
        if (toolCalls.length > 0) {
            const thoughtText = thoughtParts.join(" Also, ");
            const toolCallBlock = { tool_calls: toolCalls };

            onStep({
                stage: "reasoning",
                title: toolCalls.length > 1 ? "Gemma 4 Parallel Tool Call Generation" : "Gemma 4 Tool Call Generation",
                content: `### Thought Process:\n${thoughtText}\n\n### Tool Call JSON:\n\`\`\`json\n${JSON.stringify(toolCallBlock, null, 2)}\n\`\`\`\`\n*(Note: Gemma 4 outputs parallel calls concurrently)*`
            });
            await new Promise(r => setTimeout(r, 1000));

            // Execute all calls in parallel
            let toolResults = [];
            for (let tc of toolCalls) {
                let res;
                const fnName = tc.function.name;
                const args = tc.function.arguments;

                if (fnName === "get_soil_sensors") {
                    res = this.apis.get_soil_sensors(args.field_id);
                } else if (fnName === "get_weather_forecast") {
                    res = this.apis.get_weather_forecast(args.field_id);
                } else if (fnName === "get_market_prices") {
                    res = this.apis.get_market_prices(args.crop_name);
                } else if (fnName === "analyze_crop_image") {
                    res = this.apis.analyze_crop_image(args.image_id);
                }

                toolResults.push({
                    tool_call_id: tc.id,
                    name: fnName,
                    output: res
                });
            }

            onStep({
                stage: "tool_execution",
                title: "Local System Tools Output Execution",
                content: `Received tool execution reports:\n\`\`\`json\n${JSON.stringify(toolResults, null, 2)}\n\`\`\``
            });
            await new Promise(r => setTimeout(r, 1000));

            // Special Case: Dual evaluation for Irrigation watering
            const isWatering = query.includes("water") || query.includes("irrigate") || query.includes("sprinkler");
            if (isWatering) {
                const sensorRes = toolResults.find(r => r.name === "get_soil_sensors").output;
                const weatherRes = toolResults.find(r => r.name === "get_weather_forecast").output;
                const sensorMoisture = sensorRes.data.moisture;
                const rainChance = weatherRes.data.precipProbability;

                let proceedWatering = true;
                let decisionExplanation = "";

                if (sensorMoisture >= 60) {
                    proceedWatering = false;
                    decisionExplanation = `Moisture level is already high (${sensorMoisture}%).`;
                } else if (rainChance >= 75) {
                    proceedWatering = false;
                    decisionExplanation = `High rain probability (${rainChance}%) in the forecast.`;
                }

                if (proceedWatering) {
                    const matchDuration = query.match(/(\d+)\s*(minute|min)/);
                    const duration = matchDuration ? parseInt(matchDuration[1]) : 15;

                    const irrThought = `Moisture is low (${sensorMoisture}%) and rain chance is low (${rainChance}%). Proceeding to open the smart sprinkler actuator.`;
                    const irrCall = {
                        tool_calls: [{
                            id: `call_${Math.random().toString(36).substr(2, 9)}`,
                            type: "function",
                            function: {
                                name: "trigger_irrigation",
                                arguments: { field_id: fieldId, duration_minutes: duration }
                            }
                        }]
                    };

                    onStep({
                        stage: "reasoning_2",
                        title: "Gemma 4 Actuator Command",
                        content: `### Thought Process:\n${irrThought}\n\n### Tool Call JSON:\n\`\`\`json\n${JSON.stringify(irrCall, null, 2)}\n\`\`\``
                    });
                    await new Promise(r => setTimeout(r, 800));

                    const irrResult = this.apis.trigger_irrigation(fieldId, duration);

                    onStep({
                        stage: "tool_execution_2",
                        title: "Local Actuator Sprinkler Response",
                        content: `Executing actuator function...\nReceived response:\n\`\`\`json\n${JSON.stringify(irrResult, null, 2)}\n\`\`\``
                    });
                    await new Promise(r => setTimeout(r, 600));

                    const finalAnswer = `I checked the sensors and weather. The soil moisture was low (${sensorMoisture}%) with only a ${rainChance}% rain chance. I have successfully opened the irrigation sprinkler valve for **${duration} minutes**.\n\n` +
                        `* **Moisture change**: Restored from ${sensorMoisture}% to **${window.AgriAPIs.fields[fieldId].moisture}%**.\n\n` +
                        `The telemetry charts have updated to verify active irrigation flow.`;

                    onStep({
                        stage: "final_response",
                        title: "Gemma 4 Final Synthesis",
                        content: finalAnswer
                    });
                    return finalAnswer;
                } else {
                    const finalAnswer = `Irrigation has been **declined** for **${window.AgriAPIs.fields[fieldId].name}**:\n\n` +
                        `* **Current Soil Moisture**: ${sensorMoisture}%\n` +
                        `* **Rain Probability**: ${rainChance}%\n` +
                        `* **Decision**: ${decisionExplanation} Suspending manual watering saves agricultural water and prevents root rot.`;

                    onStep({
                        stage: "final_response",
                        title: "Gemma 4 Final Synthesis",
                        content: finalAnswer
                    });
                    return finalAnswer;
                }
            }

            // Normal synthesis of combined tools
            let finalSynthesis = `I completed the requested telemetry reviews:\n\n`;
            for (let tr of toolResults) {
                const name = tr.name;
                const data = tr.output.data;

                if (name === "get_soil_sensors") {
                    finalSynthesis += `**Soil Telemetry (${tr.output.data.name})**:\n` +
                        `- Moisture is **${data.moisture}%**.\n` +
                        `- NPK nutrients read **N:${data.npk.nitrogen}, P:${data.npk.phosphorus}, K:${data.npk.potassium} mg/kg**.\n` +
                        `- Soil pH is **${data.ph}** (normal).\n\n`;
                } else if (name === "get_weather_forecast") {
                    const alertMsg = data.alerts.length > 0 ? `⚠️ Alert: ${data.alerts[0].message}` : "No severe warnings.";
                    finalSynthesis += `**Weather Service (${data.location})**:\n` +
                        `- Temp: **${data.temperature}°C**, Condition: **${data.condition}**.\n` +
                        `- Precip probability is **${data.precipProbability}%**.\n` +
                        `- Alert status: **${alertMsg}**.\n\n`;
                } else if (name === "get_market_prices") {
                    finalSynthesis += `**Crop Market Valuation (${tr.output.crop})**:\n` +
                        `- Current trading index: **₹${data.currentPrice} per Quintal**.\n` +
                        `- Daily Trend: **${data.trend === "up" ? "📈 Rising" : "📉 Declining"}**.\n\n`;
                } else if (name === "analyze_crop_image") {
                    if (data.status === "healthy") {
                        finalSynthesis += `**Multimodal Vision Crop Diagnostics**:\n` +
                            `- Leaf diagnosed: **Healthy ${data.crop} leaf** (${data.confidence}% confidence).\n` +
                            `- Diagnosis: **${data.diagnosis}**.\n` +
                            `- Organic Rec: **${data.organicTreatment}**.\n\n`;
                    } else {
                        finalSynthesis += `**Multimodal Vision Crop Diagnostics**:\n` +
                            `- Crop leaf diagnosed: **${data.crop} Leaf** (${data.confidence}% confidence).\n` +
                            `- Diagnosis: **${data.diagnosis}**.\n` +
                            `- Severity: **${data.severity}**.\n` +
                            `- 🌿 Organic Remedy: *${data.organicTreatment}*.\n` +
                            `- 🧪 Chemical Treatment: *${data.chemicalTreatment}*.\n\n`;
                    }
                }
            }

            onStep({
                stage: "final_response",
                title: "Gemma 4 Final Synthesis",
                content: finalSynthesis
            });
            return finalSynthesis;

        } else {
            // Default simple responses
            onStep({
                stage: "reasoning",
                title: "Gemma 4 Direct Response",
                content: "No function calling required. Answering from local knowledge."
            });
            await new Promise(r => setTimeout(r, 600));

            let finalAnswer = "";
            if (query.includes("hello") || query.includes("hi") || query.includes("help") || query.includes("start")) {
                finalAnswer = `Hello! I am **AgriAgent**, your Gemma 4 agricultural assistant.\n\nI support **Parallel Function Calling** (try asking: *"Check sensors in Field B and show the market price of Wheat"*).\n\nI also support **Vision Diagnostics** (select a leaf image in the Field Camera widget to upload a crop leaf).`;
            } else {
                finalAnswer = `I am ready. Ask me to check soil sensor telemetry, review regional forecasts, check grain prices, or analyze crop leaf image diagnoses. How can I help you today?`;
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
