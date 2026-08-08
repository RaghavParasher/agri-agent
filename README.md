# 🌿 AgriAgent: Autonomous Smart Agriculture Powered by Gemma 4

[![Live Demo](https://img.shields.io/badge/Live_Dashboard-Click_to_Test-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white)](https://raghavparasher.github.io/agri-agent/)
[![Kaggle Notebook](https://img.shields.io/badge/Kaggle_Notebook-Clonable_Demo-blue?style=for-the-badge&logo=jupyter&logoColor=white)](https://www.kaggle.com/code/raghavparasher/notebook2ec091adcd)
[![GitHub Codebase](https://img.shields.io/badge/GitHub-Public_Repository-lightgrey?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RaghavParasher/agri-agent)

An AI-first, autonomous agricultural companion built for the **Build with Gemma: TFUG Prayagraj [AI Prayagraj]** hackathon. AgriAgent addresses both the **GenAI for Good Track** (Agriculture) and the **Autonomous Agent Track** (Gemma 4 native function calling).

---

## ⚡ Live Link to Test
👉 **[Launch the Live Interactive Dashboard](https://raghavparasher.github.io/agri-agent/)**

No setup required! Open the link, select a field, choose leaf samples to run visual diagnostics, and query the agent in real-time.

---

## 🌟 Upgraded Key Features

### 1. Gemma 4 Native Parallel Function Calling
AgriAgent parses complex, multi-layered queries and dispatches **multiple parallel tool requests in a single turn**.
- *Example Query*: *"Check Field B sensors and tell me the market price of Wheat."*
- *Execution*: Generates parallel JSON payloads for both `get_soil_sensors` and `get_market_prices` simultaneously, receives execution feedback, and synthesizes a single, complete response.

### 2. Multimodal Visual Crop Diagnostics (Field Camera)
Simulates Gemma 4’s visual image feature extraction to diagnose crop leaf infections.
- *How to use*: Toggle leaf presets in the sidebar (**Rice (Healthy)**, **Rust (Infected)**, **Blight (Infected)**) and click **Capture & Analyze Leaf**.
- *Execution*: Runs scanning animations and provides diagnostic names, severity ratings, confidence levels, and specific organic/chemical treatments.

### 3. Interactive Data Visualizations (Chart.js)
Displays live metrics using highly polished widgets:
- **Soil Moisture Line Chart**: Plots a 7-hour history trend that updates dynamically when watering actuators are triggered.
- **NPK Nutrient Radar Chart**: Plots dynamic Nitrogen, Phosphorus, and Potassium soil values against optimal target levels.
- **Market Crops Price Chart**: Tracks 6-day market value line charts for Rice, Wheat, and Maize.

### 4. Smart Resource Control (Rain Avoidance)
AgriAgent verifies the local soil moisture and rain forecast probability *before* opening irrigation valves to conserve water and prevent root saturation.

---

## 📂 Project Structure

- `index.html`: Dashboard structure containing crop cameras, sensor grids, and the **Gemma 4 Execution Mind** console.
- `index.css`: Modern forest theme (`#080f0c`) utilizing custom glassmorphism panels, card layouts, and spin viewfinders.
- `app.js`: Connects user input, coordinates Chart.js data sets, and updates UI triggers.
- `gemma-agent.js`: Interprets prompts and models the Gemma 4 parallel tool loop.
- `mock-apis.js`: Local databases simulating IoT sensors, weather forecasting alerts, market pricing indices, and sprinkler actuators.
- `agri_agent_demo.ipynb`: Executable python notebook demonstrating the tool calling loops in Jupyter.
- `writeup.md`: Official project submission report draft.
- `agri_agent_thumbnail.jpg`: Project visual thumbnail card.

---

## 🚀 How to Run Locally

### 1. Interactive UI Dashboard
1. Clone this repository:
   ```bash
   git clone https://github.com/RaghavParasher/agri-agent.git
   ```
2. Navigate to the folder and open `index.html` in any web browser.
3. Test parallel queries and camera diagnostics!

### 2. Python Notebook
If you have Jupyter installed, run:
```bash
jupyter notebook agri_agent_demo.ipynb
```
Otherwise, you can upload the notebook file directly to Kaggle.
