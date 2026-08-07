# AgriAgent: Autonomous Smart Agriculture Powered by Gemma 4

An AI-first, autonomous agricultural companion built for the **Build with Gemma: TFUG Prayagraj [AI Prayagraj]** hackathon. AgriAgent addresses both the **GenAI for Good Track** (Agriculture) and the **Autonomous Agent Track** (Gemma 4 native function calling).

---

## 🌟 Key Features
- **Smart Agriculture Dashboard**: Real-time monitoring of soil telemetry (Moisture %, NPK nutrient values, soil pH, and temperature).
- **Gemma 4 Native Function Calling**: Employs Gemma 4’s native tool-calling capabilities to query IoT sensors, fetch local weather forecasts, check market grain rates, and automate irrigation loops.
- **Dynamic Decision Branching**: Agent verifies live soil moisture and rain probability before executing irrigation to conserve water and prevent waterlogging.
- **Live Execution Console**: Interactive visual logger showing Gemma 4’s thought processes, API parameters, JSON payloads, and execution outputs in real-time.

---

## 📂 Project Structure
- `index.html`: Main dashboard interface.
- `index.css`: Stylesheet implementing premium dark forest theme (`#080f0c`) with custom glassmorphism.
- `app.js`: Connects dashboard inputs, runs the agent execution, and updates UI telemetry.
- `gemma-agent.js`: Interprets user queries and simulates Gemma 4’s function calling and reasoning loops.
- `mock-apis.js`: Local mock databases representing field telemetry, weather forecasts, market indexes, and irrigation actuators.
- `agri_agent_demo.ipynb`: Fully executable python-based notebook demonstrating the tool execution pipeline.
- `writeup.md`: Official project submission report draft.

---

## 🚀 How to Run Locally

### 1. Dashboard UI
1. Clone this repository to your computer.
2. Double-click the `index.html` file to open it in any modern web browser.
3. Use the quick recommendation chips (e.g. *"Water Field B"*) or type your questions in the chat panel.

### 2. Python Notebook
If you have Jupyter installed locally, run:
```bash
jupyter notebook agri_agent_demo.ipynb
```
Otherwise, you can upload the `.ipynb` file directly to a new Kaggle notebook.
