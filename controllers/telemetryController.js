const Telemetry = require('../models/Telemetry');

// @desc    Ingest data sensor polusi baru (Bucket Pattern)
// @route   POST /api/telemetry
const addTelemetryData = async (req, res) => {
    try {
        const { stationId, pm25, pm10, co } = req.body;

        const now = new Date();
        // timestamp bucket (YYYY-MM-DD 00:00:00 UTC)
        const bucketDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        const readingData = {
            timestamp: now,
            pm25,
            pm10,
            co
        };

        // update or create new (upsert)
        const updatedBucket = await Telemetry.findOneAndUpdate(
            { stationId, bucketDate },
            {
                $inc: { count: 1 },
                $push: { readings: readingData }
            },
            { upsert: true, new: true }
        );

        res.status(201).json({
            success: true,
            message: 'telemetry data successfully stored on MongoDB Atlas',
            data: updatedBucket
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

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