const Telemetry = require('../models/Telemetry');
const { pool } = require('../config/pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Jalankan analisis Agent 2, 3, dan 4 menggunakan Gemini AI
// @route   POST /api/dashboard/analyze
const analyzeAndEscalate = async (req, res) => {
    try {
        let { 
            stationId, 
            locationName, 
            pm25, 
            pm10, 
            co, 
            so2 = 0,
            no2 = 0,
            o3 = 0,
            affectedArea = 5.0, 
            pollutionSource = 'Urban Traffic & Industrial Activity' 
        } = req.body;

        if (!stationId) {
            return res.status(400).json({
                success: false,
                message: 'stationId is required for Priority Analysis'
            });
        }

        // Jika nilai pm25 tidak dikirim di body, ambil otomatis dari data ISPU terbaru di MongoDB
        if (pm25 === undefined) {
            const latestBucket = await Telemetry.findOne({ stationId }).sort({ bucketDate: -1 });
            if (!latestBucket || latestBucket.readings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Data telemetri untuk stasiun ${stationId} belum ditemukan di database. Jalankan sync-ispu terlebih dahulu atau kirimkan parameter pm25.`
                });
            }
            const latestReading = latestBucket.readings[latestBucket.readings.length - 1];
            locationName = locationName || latestBucket.locationName;
            pm25 = latestReading.pm25;
            pm10 = latestReading.pm10;
            co = latestReading.co;
            so2 = latestReading.so2 || 0;
            no2 = latestReading.no2 || 0;
            o3 = latestReading.o3 || 0;
            if (latestReading.externalEvent && latestReading.externalEvent !== 'Normal') {
                pollutionSource = latestReading.externalEvent;
            }
        }

        // Inisialisasi model Gemini dengan paksaan output JSON terstruktur
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.8-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const prompt = `
Anda adalah inti kecerdasan buatan AeroAgent untuk Pemerintah Provinsi DKI Jakarta yang menjalankan 3 Agen secara berurutan:
1. Agent 2 (Priority Analyzer): Analisis tingkat keparahan polutan (severity_score skala 0-100) dan hitung priority_index (skala 0-100) dengan mempertimbangkan konsentrasi polutan, luas area terdampak (affectedArea), dan bahaya sumber polusi (terutama jika ada kejadian eksternal seperti abu vulkanik Gunung Anak Krakatau atau kebakaran).
2. Agent 3 (Task Dispatcher): Tentukan instansi pemerintah DKI Jakarta yang paling relevan (target_institution) dan buat rekomendasi tindakan lapangan yang spesifik, taktis, dan kontekstual (recommended_action).
3. Agent 4 (Escalation Agent): Tentukan level urgensi (urgency_level) yang WAJIB bernilai salah satu dari tiga opsi ini: "Level 1 - Monitoring", "Level 2 - Attention", atau "Level 3 - High Risk", serta buat pesan peringatan dini (warning_message).

Data Lingkungan Saat Ini:
- Stasiun SPKU: ${stationId} (${locationName || stationId})
- PM2.5: ${pm25} µg/m³
- PM10: ${pm10 || 0} µg/m³
- CO: ${co || 0}
- SO2: ${so2} | NO2: ${no2} | O3: ${o3}
- Luas Area Terdampak: ${affectedArea} km²
- Indikasi Sumber Polusi / Kejadian Eksternal: ${pollutionSource}

Kembalikan respons HANYA dalam format JSON dengan struktur key berikut:
{
  "severity_score": <number>,
  "priority_index": <number>,
  "urgency_level": "<Level 1 - Monitoring | Level 2 - Attention | Level 3 - High Risk>",
  "target_institution": "<string nama instansi terkait>",
  "recommended_action": "<string rekomendasi kebijakan/tindakan konkret>",
  "warning_message": "<string ringkasan peringatan dini>"
}`;

        const result = await model.generateContent(prompt);
        const aiDecision = JSON.parse(result.response.text());

        // Simpan keputusan Agentic AI ke PostgreSQL
        const savedLog = await pool.query(
            `INSERT INTO warning_logs 
            (station_id, location_name, severity_score, affected_area, pollution_source, priority_index, urgency_level, target_institution, recommended_action, warning_message) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                stationId,
                locationName || stationId,
                Number(aiDecision.severity_score),
                affectedArea,
                pollutionSource,
                Number(aiDecision.priority_index),
                aiDecision.urgency_level,
                aiDecision.target_institution,
                aiDecision.recommended_action,
                aiDecision.warning_message
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Dynamic Agentic AI (Agents 2, 3, 4) analysis completed via Gemini',
            disclaimer: 'AeroAgent is a decision-support tool. Automated task dispatches require human-in-the-loop validation before physical deployment.',
            data: savedLog.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Ambil data lengkap untuk Government Real-Time Dashboard & Heatmap
// @route   GET /api/dashboard/overview
const getDashboardOverview = async (req, res) => {
    try {
        const warningsResult = await pool.query(
            'SELECT * FROM warning_logs ORDER BY created_at DESC LIMIT 20'
        );

        const buckets = await Telemetry.find().sort({ bucketDate: -1 });
        const stationMap = new Map();

        for (const bucket of buckets) {
            if (!stationMap.has(bucket.stationId) && bucket.readings.length > 0) {
                const latestReading = bucket.readings[bucket.readings.length - 1];
                const aqi = Math.round(latestReading.pm25 * 2.1);
                stationMap.set(bucket.stationId, {
                    stationId: bucket.stationId,
                    locationName: bucket.locationName || bucket.stationId,
                    aqi,
                    latestReading
                });
            }
        }

        const heatmapStations = Array.from(stationMap.values()).sort((a, b) => b.aqi - a.aqi);

        res.status(200).json({
            success: true,
            summary: {
                totalMonitoredStations: heatmapStations.length,
                criticalAreasRank: heatmapStations.slice(0, 5),
                latestWarningsAndActions: warningsResult.rows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Validasi Human-in-the-Loop oleh Admin Pemerintah untuk menyetujui rekomendasi tugas
// @route   PATCH /api/dashboard/warnings/:id/approve
const approveTaskDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy = 'Admin Government' } = req.body;

        const result = await pool.query(
            `UPDATE warning_logs 
             SET is_approved = TRUE, approved_by = $1 
             WHERE id = $2 
             RETURNING *`,
            [approvedBy, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Warning log not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task dispatch validated and approved by human-in-the-loop',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    analyzeAndEscalate,
    getDashboardOverview,
    approveTaskDispatch
};