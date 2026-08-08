// AgriAgent Frontend Coordinator with Chart.js Integration

let currentFieldId = "field-b"; // Default active field (Wheat crop, dry)
let agent = null;
let selectedLeafId = null;

// Chart.js instances
let moistureChartInstance = null;
let npkRadarChartInstance = null;
let marketChartInstance = null;

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    // Instantiate agent
    agent = new GemmaAgent(window.AgriAPIs);

    // Initial renders
    renderFieldSelector();
    initCharts(); // Initialize visualizations
    updateTelemetryView();
    
    // Add welcome message
    appendMessage("agent", `Hello! I am **AgriAgent**, your Gemma 4 agricultural assistant. <br><br>I support **Vision Diagnostics** (select a leaf under "Field Crop Camera" to test) and **Parallel Function Calling** (try asking: <em>"Check sensors in Field B and show the market price of Wheat"</em>).`);

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

// Update the sensor tiles, weather info, and charts based on active field
function updateTelemetryView() {
    const field = window.AgriAPIs.fields[currentFieldId];
    const weather = window.AgriAPIs.weatherData[currentFieldId];

    if (!field || !weather) return;

    // Soil Telemetry values
    document.getElementById("valMoisture").innerText = `${field.moisture}%`;
    document.getElementById("valTemp").innerText = `${field.temperature}°C`;
    document.getElementById("valPh").innerText = field.ph;

    // Weather Card
    document.getElementById("weatherLocation").innerText = weather.location;
    document.getElementById("weatherTemp").innerText = `${weather.temperature}°C`;
    
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

    // Refresh charts data dynamically
    updateChartsData(field);
}

// Initialize Chart.js
function initCharts() {
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = 'Outfit';

    // 1. Soil Moisture line chart
    const ctxMoisture = document.getElementById('moistureChart').getContext('2d');
    moistureChartInstance = new Chart(ctxMoisture, {
        type: 'line',
        data: {
            labels: ['t-6h', 't-5h', 't-4h', 't-3h', 't-2h', 't-1h', 'Now'],
            datasets: [{
                label: 'Moisture (%)',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, ticks: { stepSize: 20 } },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. NPK Nutrient Radar chart
    const ctxNpk = document.getElementById('npkRadarChart').getContext('2d');
    npkRadarChartInstance = new Chart(ctxNpk, {
        type: 'radar',
        data: {
            labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
            datasets: [
                {
                    label: 'Current Soil NPK',
                    data: [0, 0, 0],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981'
                },
                {
                    label: 'Target Optimal Profile',
                    data: [50, 35, 50],
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.05)' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    min: 0,
                    max: 60,
                    ticks: { display: false }
                }
            }
        }
    });

    // 3. Market Crops line chart
    const ctxMarket = document.getElementById('marketChart').getContext('2d');
    const riceHistory = window.AgriAPIs.marketPrices["Rice"].history;
    const wheatHistory = window.AgriAPIs.marketPrices["Wheat"].history;
    const maizeHistory = window.AgriAPIs.marketPrices["Maize"].history;

    marketChartInstance = new Chart(ctxMarket, {
        type: 'line',
        data: {
            labels: ['d-5', 'd-4', 'd-3', 'd-2', 'd-1', 'Today'],
            datasets: [
                {
                    label: 'Rice',
                    data: riceHistory,
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    label: 'Wheat',
                    data: wheatHistory,
                    borderColor: '#f59e0b',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    label: 'Maize',
                    data: maizeHistory,
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true, labels: { boxWidth: 10, padding: 5 } } },
            scales: {
                y: { ticks: { font: { size: 9 } } },
                x: { grid: { display: false }, ticks: { font: { size: 9 } } }
            }
        }
    });
}

// Update data datasets dynamically
function updateChartsData(field) {
    if (moistureChartInstance) {
        moistureChartInstance.data.datasets[0].data = field.moistureHistory;
        moistureChartInstance.update();
    }
    if (npkRadarChartInstance) {
        npkRadarChartInstance.data.datasets[0].data = [field.npk.nitrogen, field.npk.phosphorus, field.npk.potassium];
        npkRadarChartInstance.update();
    }
}

// Camera Field Crop Image Select logic
function selectLeaf(leafId, labelText) {
    selectedLeafId = leafId;
    
    // Toggle active state in leaf buttons
    const buttons = document.querySelectorAll(".leaf-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    
    event.target.classList.add("selected");

    // Enable trigger button
    const triggerBtn = document.getElementById("btnAnalyzeLeaf");
    triggerBtn.disabled = false;

    // Viewfinder effect
    const viewfinder = document.getElementById("cameraViewfinder");
    viewfinder.className = "camera-viewfinder active";
    
    let emoji = "🌾";
    if (leafId === "wheat-rust") emoji = "🍂";
    if (leafId === "maize-blight") emoji = "🌽";
    
    viewfinder.querySelector(".camera-lens").innerText = emoji;
    document.getElementById("cameraStatus").innerText = labelText;
}

// Visual click event handler for Crop Image Capture & Diagnostics
async function triggerLeafAnalysis() {
    if (!selectedLeafId) return;

    const viewfinder = document.getElementById("cameraViewfinder");
    const status = document.getElementById("cameraStatus");
    const triggerBtn = document.getElementById("btnAnalyzeLeaf");

    // Scanning visual effect
    viewfinder.className = "camera-viewfinder scanning";
    status.innerText = "Analyzing visual symptoms...";
    triggerBtn.disabled = true;

    // Assemble query to feed agent
    const query = `Analyze leaf image: ${selectedLeafId}`;
    await handleUserQueryDirectly(query);

    // Reset camera state after done
    viewfinder.className = "camera-viewfinder active";
    status.innerText = `Scan Complete: ${selectedLeafId}`;
    triggerBtn.disabled = false;
}

// Add message to Chat Panel
function appendMessage(sender, text) {
    const chatContainer = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

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

// Form-based query handling
async function handleUserQuery() {
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (!query) return;

    appendMessage("user", query);
    input.value = "";
    await handleUserQueryDirectly(query);
}

// Main execution pathway
async function handleUserQueryDirectly(query) {
    const input = document.getElementById("chatInput");
    input.disabled = true;

    // Clear logs
    const consoleLogs = document.getElementById("consoleLogs");
    consoleLogs.innerHTML = "";

    let response = "";
    try {
        response = await agent.runAgentLoop(query, (step) => {
            appendConsoleStep(step);
        });

        appendMessage("agent", response);

    } catch (err) {
        console.error("Agent Loop Error:", err);
        appendMessage("agent", "I experienced an error executing that request. Please verify the sensors and try again.");
        input.disabled = false;
        input.focus();
        return;
    }

    // Run UI Updates separately to prevent crashing the agent's output display
    try {
        renderFieldSelector();
        updateTelemetryView();
    } catch (uiErr) {
        console.error("UI Update Error:", uiErr);
    }

    input.disabled = false;
    input.focus();
}


// Add execution log card
function appendConsoleStep(step) {
    const container = document.getElementById("consoleLogs");
    
    if (container.querySelector(".text-dim")) {
        container.innerHTML = "";
    }

    const card = document.createElement("div");
    card.className = "console-step-card";
    
    let bodyHtml = step.content;
    if (step.content.includes("```json")) {
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
    
    window.AgriAPIs.fields["field-a"].moistureHistory = [70, 71, 72, 70, 69, 72, 72];
    window.AgriAPIs.fields["field-b"].moistureHistory = [52, 48, 44, 40, 38, 35, 34];
    window.AgriAPIs.fields["field-c"].moistureHistory = [55, 54, 53, 53, 52, 52, 52];

    // Reset camera UI
    selectedLeafId = null;
    const buttons = document.querySelectorAll(".leaf-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    
    const viewfinder = document.getElementById("cameraViewfinder");
    viewfinder.className = "camera-viewfinder";
    viewfinder.querySelector(".camera-lens").innerText = "📸";
    document.getElementById("cameraStatus").innerText = "Camera Offline";
    document.getElementById("btnAnalyzeLeaf").disabled = true;
    
    renderFieldSelector();
    updateTelemetryView();

    // Clear logs
    const consoleLogs = document.getElementById("consoleLogs");
    consoleLogs.innerHTML = `
        <div style="color: var(--color-text-dim); text-align: center; margin-top: 2rem;">
            <i data-lucide="activity" style="width: 40px; height: 40px; margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto; opacity: 0.5;"></i>
            Telemetry values reset. Ask the agent a question to observe Gemma 4 tool calling.
        </div>
    `;
    
    appendMessage("agent", "Telemetry systems have been reset to factory defaults. Field B moisture is back to 34% (low).");
    lucide.createIcons();
}
