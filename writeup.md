### 💡 Inspiration

In developing agricultural regions like Prayagraj, smallholder farmers face severe efficiency and financial bottlenecks:
1. **Water Inefficiency**: Irrigation is often scheduled by calendar days rather than actual soil moisture levels, leading to high water waste.
2. **Nutrient & Disease Vulnerability**: Deficiencies in vital soil nutrients (Nitrogen, Phosphorus, Potassium) and crop diseases (such as Stem Rust and Northern Leaf Blight) go unnoticed until crop damage is irreversible.
3. **Market Disadvantage**: Farmers frequently sell their produce to local middlemen at a loss because they lack access to real-time market price trends.

**AgriAgent** was built to solve these issues. It acts as an autonomous smart-farming companion that monitors soil sensor telemetry, pulls weather forecasting reports to prevent over-irrigation, controls irrigation valves, and analyzes crop market trends to help farmers maximize crop health and profits.

---

### 🛠️ How we built it

We built AgriAgent using **Gemma 4**'s advanced reasoning capabilities and native function calling. The architecture is split into three main components:

#### 1. Gemma 4 Native Function Calling Engine
We designed a step-by-step reasoning parser in JavaScript (`gemma-agent.js`) that mimics Gemma 4's native function calling logic. 

**Gemma 4 System Prompt:**
```text
You are AgriAgent, an expert agricultural AI assistant powered by Gemma 4. 
You help farmers optimize crop yields, manage water resources, diagnose crop diseases, and check market prices.
You have access to the following real-time IoT sensors and agricultural tools:
1. get_soil_sensors(field_id)
2. get_weather_forecast(field_id)
3. get_market_prices(crop_name)
4. trigger_irrigation(field_id, duration_minutes)
5. analyze_crop_image(image_id)
```

#### 2. Local Agricultural APIs
We developed a mock database layer (`mock-apis.js`) simulating actual IoT soil sensors (NPK levels, temperature, moisture, pH), weather service alerts, market price indices, and sprinkler actuators.

#### 3. Glassmorphic Web Dashboard
A visual, responsive HTML5 dashboard with custom CSS variables and animations. It includes a **Gemma 4 Execution Mind** console, visualizing the raw JSON tool requests and steps in real-time.

#### 4. Python Demo Notebook
An executable Python script demonstrating the function calling loop using standard programming APIs.

We focused on **prompt engineering** and **structured JSON validation** to allow Gemma 4 to output precise tool calling payloads (e.g., `get_soil_sensors(field_id="field-b")`) and process multi-turn loops recursively.

---

### 🕸️ The Prototype

* **Kaggle Notebook (Clonable Demo)**: [Kaggle Notebook](https://www.kaggle.com/code/raghavparasher/notebook2ec091adcd)
* **GitHub Repository**: [GitHub Codebase](https://github.com/RaghavParasher/agri-agent)
* **Live Interactive Demo**: You can run the dashboard locally by opening the `index.html` file in the repository inside any modern web browser.
* **Demo Video**: *[See running dashboard screenshots and interactive terminal instructions in the GitHub repository README]*

---

### ⚡ Walkthrough: Gemma 4 Advanced Agent Traces

#### Trace A: Parallel Tool Calling
If the user inputs a compound query like: *"Check Field B sensors and tell me the market price of Wheat,"* Gemma 4 analyzes the query and generates **multiple parallel tool calls** in a single turn.

**1. Gemma 4 Output (JSON):**
```json
{
  "tool_calls": [
    {
      "id": "call_soil_1",
      "type": "function",
      "function": {
        "name": "get_soil_sensors",
        "arguments": { "field_id": "field-b" }
      }
    },
    {
      "id": "call_price_1",
      "type": "function",
      "function": {
        "name": "get_market_prices",
        "arguments": { "crop_name": "Wheat" }
      }
    }
  ]
}
```
**2. System API Response:**
The engine executes both tools concurrently and returns:
```json
[
  {
    "tool_call_id": "call_soil_1",
    "name": "get_soil_sensors",
    "output": { "status": "success", "data": { "moisture": 34, "crop": "Wheat", "npk": { "nitrogen": 20, "phosphorus": 15, "potassium": 40 } } }
  },
  {
    "tool_call_id": "call_price_1",
    "name": "get_market_prices",
    "output": { "status": "success", "crop": "Wheat", "data": { "currentPrice": 2450, "trend": "up" } }
  }
]
```
**3. Final Synthesis**: Gemma 4 evaluates both results and outputs a single response suggesting irrigation for Field B (since moisture is 34%) and notifying the farmer that Wheat market prices are rising (₹2,450/quintal, trend up).

#### Trace B: Multimodal Vision Leaf Diagnostics
When a leaf photo (e.g. *wheat rust*) is captured, Gemma 4 triggers the vision analysis tool:
1. **Tool Call**: `analyze_crop_image(image_id="wheat-rust")`
2. **API Result**: Returns moderate infection of *Stem Rust (Puccinia graminis)*.
3. **Response Synthesis**: Gemma 4 prescribes organic remedies (neem oil extract) and chemical fungicide backstops (Propiconazole).

---

### 🚧 Challenges we ran into

Building a fully functional agent loop in a short 1-day sprint presented two major challenges:
1. **Tool Loop Synchronization**: Simulating the multi-turn agent execution flow (Thought ➡️ Tool Call JSON ➡️ Tool Output Feedback ➡️ Final Synthesis) in client-side JavaScript required handling asynchronous states and preventing execution blocks.
2. **UI State Coherence**: Making sure the visual dashboard widgets (NPK gauges, weather cards, moisture percentages) instantly reflected changes caused by physical actions triggered by the agent (such as watering Field B for 20 minutes) required creating a reactive messaging bridge between the chat console and the dashboard.
