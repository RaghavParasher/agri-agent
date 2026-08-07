// AgriAgent Frontend Coordinator

let currentFieldId = "field-b"; // Default active field (Wheat crop, dry)
let agent = null;

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    // Instanciate agent
    agent = new GemmaAgent(window.AgriAPIs);

    // Initial renders
    renderFieldSelector();
    updateTelemetryView();
    renderMarketWidget();
    
    // Add welcome message
    appendMessage("agent", `Hello! I am **AgriAgent**, your Gemma 4 agricultural assistant. <br><br>I can help you monitor sensor status, automate smart irrigation, check forecasts, and analyze market price data. <br><br><strong>Here are some things you can try:</strong><br>• "Check sensors in Field B"<br>• "Show the weather forecast for Field C"<br>• "What is the market price of Wheat right now?"<br>• "Water Field B for 20 minutes"`);

    // Handle Form Submit
    const form = document.getElementById("chatForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleUserQuery();
    });

    lucide.createIcons();
});

// Render the field selection sidebar cards
function renderFieldSelector() {
    const container = document.getElementById("fieldSelector");
    container.innerHTML = "";

    Object.values(window.AgriAPIs.fields).forEach(field => {
        const div = document.createElement("div");
        div.className = `field-card ${field.id === currentFieldId ? 'active' : ''}`;
        div.onclick = () => {
            currentFieldId = field.id;
            renderFieldSelector();
            updateTelemetryView();
        };

        const moistureAlert = field.moisture < 40 ? "⚠️ low" : "normal";

        div.innerHTML = `
            <div class="field-card-header">
                <span class="field-card-name">${field.name}</span>
                <span class="field-card-crop">${field.crop}</span>
            </div>
            <div class="field-card-stats">
                <span>Moisture: <strong>${field.moisture}%</strong></span>
                <span style="color: ${field.moisture < 40 ? 'var(--color-warning)' : 'var(--color-accent)'}">Status: ${moistureAlert}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Update the sensor tiles and weather info based on active field
function updateTelemetryView() {
    const field = window.AgriAPIs.fields[currentFieldId];
    const weather = window.AgriAPIs.weatherData[currentFieldId];

    if (!field || !weather) return;

    // Soil Telemetry
    document.getElementById("valMoisture").innerText = `${field.moisture}%`;
    document.getElementById("valTemp").innerText = `${field.temperature}°C`;
    document.getElementById("valPh").innerText = field.ph;

    // NPK levels
    document.getElementById("valN").innerText = `${field.npk.nitrogen} mg/kg`;
    document.getElementById("valP").innerText = `${field.npk.phosphorus} mg/kg`;
    document.getElementById("valK").innerText = `${field.npk.potassium} mg/kg`;

    document.getElementById("barN").style.width = `${Math.min(100, field.npk.nitrogen * 1.5)}%`;
    document.getElementById("barP").style.width = `${Math.min(100, field.npk.phosphorus * 2)}%`;
    document.getElementById("barK").style.width = `${Math.min(100, field.npk.potassium * 1.5)}%`;

    // Weather Card
    document.getElementById("weatherLocation").innerText = weather.location;
    document.getElementById("weatherTemp").innerText = `${weather.temperature}°C`;
    
    // Choose weather icon based on forecast/condition
    let icon = "☀️";
    if (weather.condition.includes("Cloudy")) icon = "⛅";
    if (weather.condition.includes("Rain") || weather.condition.includes("Showers")) icon = "🌧️";
    document.getElementById("weatherIcon").innerText = icon;

    // Render Alerts
    const alertsContainer = document.getElementById("weatherAlerts");
    alertsContainer.innerHTML = "";
    if (weather.alerts.length > 0) {
        weather.alerts.forEach(alert => {
            const div = document.createElement("div");
            div.className = "alert-item";
            div.innerHTML = `<i data-lucide="alert-triangle" style="width: 14px; height: 14px; flex-shrink: 0;"></i> <span><strong>${alert.type}</strong>: ${alert.message}</span>`;
            alertsContainer.appendChild(div);
        });
        lucide.createIcons();
    } else {
        alertsContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--color-text-muted);">✅ No severe alerts for this region.</div>`;
    }
}

// Render Crop Markets
function renderMarketWidget() {
    const container = document.getElementById("marketWidget");
    container.innerHTML = "";

    Object.entries(window.AgriAPIs.marketPrices).forEach(([cropName, priceObj]) => {
        const row = document.createElement("div");
        row.className = "market-crop-row";
        
        const trendIcon = priceObj.trend === "up" ? "📈" : "📉";
        const trendColor = priceObj.trend === "up" ? "var(--color-primary)" : "var(--color-danger)";

        row.innerHTML = `
            <div class="market-crop-info">
                <span class="market-crop-name">${cropName}</span>
                <span class="market-crop-trend" style="color: ${trendColor}">${trendIcon} daily trend</span>
            </div>
            <div class="market-crop-price">₹${priceObj.currentPrice}<span style="font-size: 0.7rem; color: var(--color-text-muted); display: block;">per Quintal</span></div>
        `;
        container.appendChild(row);
    });
}

// Add message to Chat Panel
function appendMessage(sender, text) {
    const chatContainer = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

    // Convert simple Markdown formatting (bold, lists, emojis) into HTML for chat bubbles
    let htmlContent = text
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

    msg.innerHTML = `
        <div class="agent-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
        <div class="message-bubble">
            ${htmlContent}
        </div>
    `;

    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send quick suggestions chips
function sendQuickMessage(text) {
    const input = document.getElementById("chatInput");
    input.value = text;
    handleUserQuery();
}

// Process query submit
async function handleUserQuery() {
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (!query) return;

    appendMessage("user", query);
    input.value = "";
    input.disabled = true;

    // Clear previous logs
    const consoleLogs = document.getElementById("consoleLogs");
    consoleLogs.innerHTML = "";

    try {
        const response = await agent.runAgentLoop(query, (step) => {
            // Append console logs step by step
            appendConsoleStep(step);
        });

        appendMessage("agent", response);

        // Update dashboards as data might have changed via tool calls (e.g. irrigation)
        renderFieldSelector();
        updateTelemetryView();
        renderMarketWidget();

    } catch (err) {
        console.error(err);
        appendMessage("agent", "I experienced an error executing that request. Please verify the sensors and try again.");
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// Add execution card in the Gemma 4 console panel
function appendConsoleStep(step) {
    const container = document.getElementById("consoleLogs");
    
    // If it's the first step, clear placeholder text
    if (container.querySelector(".text-dim")) {
        container.innerHTML = "";
    }

    const card = document.createElement("div");
    card.className = "console-step-card";
    
    // Formatting logs text
    let bodyHtml = step.content;
    if (step.content.includes("```json")) {
        // Beautify json printout
        bodyHtml = step.content.replace(/```json([\s\S]*?)```/g, "<pre><code style='color: #6ee7b7;'>$1</code></pre>");
    }

    card.innerHTML = `
        <div class="console-step-header">
            <span>⚡ ${step.title}</span>
            <span style="font-size: 0.65rem; color: var(--color-text-dim);">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="console-step-body">
            ${bodyHtml}
        </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
}

// Reset data helper
function resetDemo() {
    // Restore initial values
    window.AgriAPIs.fields["field-a"].moisture = 72;
    window.AgriAPIs.fields["field-b"].moisture = 34;
    window.AgriAPIs.fields["field-c"].moisture = 52;
    
    renderFieldSelector();
    updateTelemetryView();
    renderMarketWidget();

    // Clear logs
    const consoleLogs = document.getElementById("consoleLogs");
    consoleLogs.innerHTML = `
        <div style="color: var(--color-text-dim); text-align: center; margin-top: 2rem;">
            <i data-lucide="activity" style="width: 40px; height: 40px; margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto; opacity: 0.5;"></i>
            Telemetry values reset. Ask the agent a question to observe Gemma 4 tool calling.
        </div>
    `;
    
    appendMessage("agent", "Telemetry systems have been reset to factory defaults. Field B moisture is back to 34% (low). How can I assist you now?");
    lucide.createIcons();
}
