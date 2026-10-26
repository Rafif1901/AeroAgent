const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
    stationId: { 
        type: String, 
        required: true, 
        index: true 
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
        pm25: { type: Number },
        pm10: { type: Number },
        co: { type: Number }
    }]
});

module.exports = mongoose.model('Telemetry', telemetrySchema);