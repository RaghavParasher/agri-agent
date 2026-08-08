# AgriAgent: Autonomous Smart Agriculture Powered by Gemma 4

An AI-first, autonomous agricultural companion built for the **Build with Gemma: TFUG Prayagraj [AI Prayagraj]** hackathon. AgriAgent addresses both the **GenAI for Good Track** (Agriculture) and the **Autonomous Agent Track** (Gemma 4 native function calling).

---

## 🌟 Upgraded Winning Features
- **Smart Agriculture Dashboard**: Real-time monitoring of soil telemetry (Moisture %, NPK nutrient values, soil pH, and temperature) integrated with **Chart.js**.
- **Interactive Visualizations**:
  - *NPK Nutrient Radar Chart*: Displays current soil chemicals compared to target optimal values.
  - *Live Soil Moisture Line Chart*: Updates dynamically when the user triggers the irrigation system.
  - *Market Price Trends Chart*: Plots 6-day price evaluations for Rice, Wheat, and Maize.
- **Multimodal Visual Diagnostics**: Features a simulated **Field Crop Camera** stream that uses Gemma 4's vision capabilities to diagnose crop diseases (e.g. Wheat Rust, Maize Blight) from leaf photos and prescribe treatments.
- **Gemma 4 Parallel Function Calling**: Handles compound queries (e.g., *"Check Field B sensors and check Wheat market rates"*) by issuing multiple parallel JSON tool calls in a single turn.
- **Live Execution Console**: Interactive visual logger showing Gemma 4’s thought processes, API parameters, JSON payloads, and execution outputs in real-time.

---

## 📂 Project Structure
- `index.html`: Main dashboard interface.
- `index.css`: Stylesheet implementing premium dark forest theme (`#080f0c`) with custom glassmorphism.
- `app.js`: Connects dashboard inputs, manages Chart.js initializations, and handles leaf scanner camera interactions.
- `gemma-agent.js`: Interprets user queries and simulates Gemma 4’s parallel tool calling and vision loops.
- `mock-apis.js`: Local mock databases representing field telemetry, weather forecasts, market indexes, leaf diseases, and sprinkler actuators.
- `agri_agent_demo.ipynb`: Fully executable python-based notebook demonstrating the upgraded execution pipeline.
- `writeup.md`: Upgraded project submission report draft.

---

## 🚀 How to Run Locally

### 1. Dashboard UI
1. Clone this repository to your computer.
2. Double-click the `index.html` file to open it in any modern web browser.
3. Try clicking a leaf button in the **Field Crop Camera** widget (e.g. *Wheat Rust*), then click **Capture & Analyze Leaf** to run vision diagnostics.
4. Try typing a compound query like: *"Check Field B sensors and tell me the market price of Wheat"*.

### 2. Python Notebook
If you have Jupyter installed locally, run:
```bash
jupyter notebook agri_agent_demo.ipynb
```
Otherwise, you can upload the `.ipynb` file directly to a new Kaggle notebook.
