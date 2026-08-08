// Mock IoT sensors and agricultural APIs for the AgriAgent system

const fields = {
    "field-a": {
        id: "field-a",
        name: "North Field (Clayey)",
        crop: "Rice",
        moisture: 72, // percentage
        ph: 6.2,
        temperature: 28.5, // Celsius
        npk: { nitrogen: 45, phosphorus: 30, potassium: 55 }, // mg/kg
        moistureHistory: [70, 71, 72, 70, 69, 72, 72], // last 7 hours moisture history
        irrigationHistory: []
    },
    "field-b": {
        id: "field-b",
        name: "West Terrace (Sandy Loam)",
        crop: "Wheat",
        moisture: 34, // low moisture (needs water)
        ph: 6.8,
        temperature: 31.2,
        npk: { nitrogen: 20, phosphorus: 15, potassium: 40 }, // low NPK
        moistureHistory: [52, 48, 44, 40, 38, 35, 34],
        irrigationHistory: []
    },
    "field-c": {
        id: "field-c",
        name: "Valley Slope (Silty)",
        crop: "Maize",
        moisture: 52,
        ph: 6.5,
        temperature: 26.0,
        npk: { nitrogen: 50, phosphorus: 35, potassium: 45 },
        moistureHistory: [55, 54, 53, 53, 52, 52, 52],
        irrigationHistory: []
    }
};

const weatherData = {
    "field-a": {
        location: "Prayagraj North",
        temperature: 30,
        condition: "Partly Cloudy",
        humidity: 75,
        precipProbability: 20,
        forecast: [
            { day: "Today", temp: 30, condition: "Cloudy", precip: 20 },
            { day: "Tomorrow", temp: 32, condition: "Sunny", precip: 10 },
            { day: "Sunday", temp: 29, condition: "Rainy", precip: 80 }
        ],
        alerts: []
    },
    "field-b": {
        location: "Prayagraj West",
        temperature: 33,
        condition: "Dry & Sunny",
        humidity: 45,
        precipProbability: 5,
        forecast: [
            { day: "Today", temp: 33, condition: "Sunny", precip: 5 },
            { day: "Tomorrow", temp: 36, condition: "Heatwave", precip: 0 },
            { day: "Sunday", temp: 35, condition: "Dry & Clear", precip: 0 }
        ],
        alerts: [
            { severity: "warning", type: "Heatwave Alert", message: "Extreme heatwave expected tomorrow. Temperatures up to 38°C. Ensure adequate soil moisture." }
        ]
    },
    "field-c": {
        location: "Prayagraj Valley",
        temperature: 28,
        condition: "Light Showers",
        humidity: 80,
        precipProbability: 60,
        forecast: [
            { day: "Today", temp: 28, condition: "Light Rain", precip: 60 },
            { day: "Tomorrow", temp: 27, condition: "Showers", precip: 70 },
            { day: "Sunday", temp: 28, condition: "Thunderstorms", precip: 90 }
        ],
        alerts: [
            { severity: "info", type: "Precipitation Alert", message: "High rain probability (80%+) on Sunday. Suspend manual watering to avoid waterlogging." }
        ]
    }
};

const marketPrices = {
    "Rice": {
        currentPrice: 2200, // INR per Quintal
        trend: "up",
        history: [2100, 2120, 2150, 2140, 2180, 2200]
    },
    "Wheat": {
        currentPrice: 2450,
        trend: "up",
        history: [2300, 2350, 2380, 2400, 2420, 2450]
    },
    "Maize": {
        currentPrice: 1980,
        trend: "down",
        history: [2050, 2030, 2010, 2000, 1990, 1980]
    }
};

const diseaseDatabase = {
    "rice-healthy": {
        status: "healthy",
        crop: "Rice",
        diagnosis: "Healthy leaf tissue",
        confidence: 97,
        organicTreatment: "Maintain regular water levels and monitor for local pests.",
        chemicalTreatment: "No fungicide required."
    },
    "wheat-rust": {
        status: "infected",
        crop: "Wheat",
        diagnosis: "Stem/Black Rust (Puccinia graminis)",
        severity: "Moderate (35% surface area affected)",
        confidence: 94,
        organicTreatment: "Apply neem oil extract spray. Prune and destroy highly infected leaves.",
        chemicalTreatment: "Spray Propiconazole or Tebuconazole fungicide immediately to arrest spore spread."
    },
    "maize-blight": {
        status: "infected",
        crop: "Maize",
        diagnosis: "Northern Leaf Blight (Exserohilum turcicum)",
        severity: "Severe (65% leaf chlorosis)",
        confidence: 89,
        organicTreatment: "Rotate crops next season. Apply copper-based organic fungicide sprays.",
        chemicalTreatment: "Apply Mancozeb or Azoxystrobin fungicide spray at 14-day intervals."
    }
};

// API Functions
function get_soil_sensors(field_id) {
    console.log(`[API Call] get_soil_sensors(field_id="${field_id}")`);
    const fId = field_id.toLowerCase().trim();
    if (fields[fId]) {
        return {
            status: "success",
            timestamp: new Date().toISOString(),
            data: fields[fId]
        };
    }
    return { status: "error", message: `Field with ID '${field_id}' not found.` };
}

function get_weather_forecast(field_id) {
    console.log(`[API Call] get_weather_forecast(field_id="${field_id}")`);
    const fId = field_id.toLowerCase().trim();
    if (weatherData[fId]) {
        return {
            status: "success",
            timestamp: new Date().toISOString(),
            data: weatherData[fId]
        };
    }
    return { status: "error", message: `Weather location for field ID '${field_id}' not found.` };
}

function get_market_prices(crop_name) {
    console.log(`[API Call] get_market_prices(crop_name="${crop_name}")`);
    const crop = crop_name.charAt(0).toUpperCase() + crop_name.slice(1).toLowerCase().trim();
    if (marketPrices[crop]) {
        return {
            status: "success",
            timestamp: new Date().toISOString(),
            crop: crop,
            data: marketPrices[crop]
        };
    }
    return { status: "error", message: `Market data for crop '${crop_name}' not found.` };
}

function trigger_irrigation(field_id, duration_minutes) {
    console.log(`[API Call] trigger_irrigation(field_id="${field_id}", duration_minutes=${duration_minutes})`);
    const fId = field_id.toLowerCase().trim();
    if (fields[fId]) {
        const previousMoisture = fields[fId].moisture;
        const increase = Math.min(100 - previousMoisture, Math.round(duration_minutes * 1.5));
        fields[fId].moisture += increase;
        
        // Push to history
        fields[fId].moistureHistory.shift();
        fields[fId].moistureHistory.push(fields[fId].moisture);

        const record = {
            timestamp: new Date().toISOString(),
            duration: duration_minutes,
            moistureBefore: previousMoisture,
            moistureAfter: fields[fId].moisture
        };
        fields[fId].irrigationHistory.push(record);

        return {
            status: "success",
            message: `Irrigation valve opened for ${duration_minutes} minutes. Soil moisture improved from ${previousMoisture}% to ${fields[fId].moisture}%.`,
            data: record
        };
    }
    return { status: "error", message: `Field with ID '${field_id}' not found.` };
}

function analyze_crop_image(image_id) {
    console.log(`[API Call] analyze_crop_image(image_id="${image_id}")`);
    const imgId = image_id.toLowerCase().trim();
    if (diseaseDatabase[imgId]) {
        return {
            status: "success",
            timestamp: new Date().toISOString(),
            image_id: image_id,
            data: diseaseDatabase[imgId]
        };
    }
    return { status: "error", message: `Image identifier '${image_id}' not recognized in database.` };
}

// Export mock API database and functions to window scope for frontend access
window.AgriAPIs = {
    fields,
    weatherData,
    marketPrices,
    diseaseDatabase,
    get_soil_sensors,
    get_weather_forecast,
    get_market_prices,
    trigger_irrigation,
    analyze_crop_image
};
