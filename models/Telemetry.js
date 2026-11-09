const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
    stationId: { 
        type: String, 
        required: true, 
        index: true 
    },
    locationName: {
        type: String,
        default: 'Jakarta'
    },
    bucketDate: { 
        type: Date, 
        required: true, 
        index: true 
    },
    count: { 
        type: Number, 
        default: 0 
    },
    readings: [{
        timestamp: { type: Date, required: true },
        // Parameter Polutan Utama & Standar ISPU DKI Jakarta
        pm25: { type: Number, required: true },
        pm10: { type: Number, default: 0 },
        co: { type: Number, default: 0 },
        so2: { type: Number, default: 0 },
        no2: { type: Number, default: 0 },
        o3: { type: Number, default: 0 },
        categori: { type: String, default: 'SEDANG' },
        // Parameter Cuaca & Kejadian Eksternal
        temperature: { type: Number, default: 28.0 },
        humidity: { type: Number, default: 75.0 },
        windSpeed: { type: Number, default: 2.5 },
        externalEvent: { type: String, default: 'Normal' }
    }]
});

module.exports = mongoose.model('Telemetry', telemetrySchema);