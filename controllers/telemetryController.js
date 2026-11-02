const Telemetry = require('../models/Telemetry');

// @desc    Ingest data sensor polusi, cuaca & kejadian eksternal (Agent 1 - Data Collector)
// @route   POST /api/telemetry
const addTelemetryData = async (req, res) => {
    try {
        const { 
            stationId, 
            locationName, 
            pm25, 
            pm10, 
            co, 
            temperature, 
            humidity, 
            windSpeed, 
            externalEvent 
        } = req.body;

        const now = new Date();
        const bucketDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        const readingData = {
            timestamp: now,
            pm25,
            pm10,
            co,
            temperature: temperature ?? 25.0,
            humidity: humidity ?? 80.0,
            windSpeed: windSpeed ?? 2.1,
            externalEvent: externalEvent || 'None'
        };

        const updatedBucket = await Telemetry.findOneAndUpdate(
            { stationId, bucketDate },
            {
                $set: { locationName: locationName || stationId },
                $inc: { count: 1 },
                $push: { readings: readingData }
            },
            { upsert: true, new: true }
        );

        res.status(201).json({
            success: true,
            message: 'Telemetry data successfully stored on MongoDB Atlas',
            data: updatedBucket
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Ambil riwayat telemetri per stasiun
// @route   GET /api/telemetry/:stationId
const getTelemetryByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const data = await Telemetry.find({ stationId }).sort({ bucketDate: -1 });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    addTelemetryData,
    getTelemetryByStation
};