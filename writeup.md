### 💡 Inspiration

In developing agricultural regions like Prayagraj, smallholder farmers face severe efficiency and financial bottlenecks:
1. **Water Inefficiency**: Irrigation is often scheduled by calendar days rather than actual soil moisture levels, leading to high water waste.
2. **Nutrient & Disease Vulnerability**: Deficiencies in vital soil nutrients (Nitrogen, Phosphorus, Potassium) and crop diseases go unnoticed until crop damage is irreversible.
3. **Market Disadvantage**: Farmers frequently sell their produce to local middlemen at a loss because they lack access to real-time market price trends.

**AgriAgent** was built to solve these issues. It acts as an autonomous smart-farming companion that monitors soil sensor telemetry, pulls weather forecasting reports to prevent over-irrigation, controls irrigation valves, and analyzes crop market trends to help farmers maximize crop health and profits.

---

### 🛠️ How we built it

We built AgriAgent using **Gemma 4**'s advanced reasoning capabilities and native function calling. The architecture is split into three main components:
1. **Gemma 4 Native Function Calling Engine**: We designed a step-by-step reasoning parser in JavaScript (`gemma-agent.js`) that mimics Gemma 4's native function calling logic. The model is registered with system instructions and custom schemas for external APIs.
2. **Local Agricultural APIs**: We developed a mock database layer (`mock-apis.js`) simulating actual IoT soil sensors (NPK levels, temperature, moisture, pH), weather service alerts, market price indices, and sprinkler actuators.
3. **Glassmorphic Web Dashboard**: A visual, responsive HTML5 dashboard with custom CSS variables and animations. It includes a **Gemma 4 Execution Mind** console, visualizing the raw JSON tool requests and steps in real-time.
4. **Python Demo Notebook**: An executable Python script demonstrating the function calling loop using standard programming APIs.

We focused on **prompt engineering** and **structured JSON validation** to allow Gemma 4 to output precise tool calling payloads (e.g., `get_soil_sensors(field_id="field-b")`) and process multi-turn loops recursively.

---

### 🕸️ The Prototype

* **Kaggle Notebook (Clonable Demo)**: [Kaggle Notebook](https://www.kaggle.com/code/raghavparasher/notebook2ec091adcd)
* **GitHub Repository**: [GitHub Codebase](https://github.com/RaghavParasher/agri-agent)
* **Live Interactive Demo**: You can run the dashboard locally by opening the `index.html` file in the repository inside any modern web browser.
* **Demo Video**: *[See running dashboard screenshots and interactive terminal instructions in the GitHub repository README]*

---

### 🚧 Challenges we ran into

Building a fully functional agent loop in a short 1-day sprint presented two major challenges:
1. **Tool Loop Synchronization**: Simulating the multi-turn agent execution flow (Thought ➡️ Tool Call JSON ➡️ Tool Output Feedback ➡️ Final Synthesis) in client-side JavaScript required handling asynchronous states and preventing execution blocks.
2. **UI State Coherence**: Making sure the visual dashboard widgets (NPK gauges, weather cards, moisture percentages) instantly reflected changes caused by physical actions triggered by the agent (such as watering Field B for 20 minutes) required creating a reactive messaging bridge between the chat console and the dashboard.
