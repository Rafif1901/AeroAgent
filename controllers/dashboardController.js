const Telemetry = require('../models/Telemetry');
const { pool } = require('../config/pg');

// @desc    Jalankan analisis Agent 2, 3, dan 4 untuk suatu stasiun/area
// @route   POST /api/dashboard/analyze
const analyzeAndEscalate = async (req, res) => {
    try {
        const { 
            stationId, 
            locationName, 
            pm25, 
            pm10, 
            co, 
            affectedArea = 5.0, // dalam km2
            pollutionSource = 'Vehicle & Industrial Emissions' 
        } = req.body;

        if (!stationId || pm25 === undefined) {
            return res.status(400).json({
                success: false,
                message: 'stationId and pm25 are required for Priority Analysis'
            });
        }

        // --- AGENT 2: PRIORITY ANALYZER ---
        // Hitung skor keparahan (Severity Score) berdasarkan polutan utama
        const severityScore = Number(((pm25 * 0.6) + ((pm10 || 0) * 0.25) + ((co || 0) * 1.5)).toFixed(2));
        
        // Bobot sumber polusi (Volcanic Ash mendapat bobot prioritas lebih tinggi sesuai Bab 1.2)
        const sourceMultiplier = pollutionSource.toLowerCase().includes('volcanic') || pollutionSource.toLowerCase().includes('krakatau') ? 1.35 : 1.0;

        // Rumus Priority Index (skala 0 - 100+)
        const priorityIndex = Number(
            ((severityScore * 0.7 + affectedArea * 2.5) * sourceMultiplier).toFixed(2)
        );

        // --- AGENT 4: ESCALATION AGENT ---
        // Klasifikasi 3 Level Urgensi: Monitoring, Attention, High Risk
        let urgencyLevel = 'Level 1 - Monitoring';
        let warningMessage = `Kondisi udara di ${locationName || stationId} dalam pemantauan rutin.`;

        if (priorityIndex >= 75) {
            urgencyLevel = 'Level 3 - High Risk';
            warningMessage = `PERINGATAN TINGGI: Indeks Prioritas mencapai ${priorityIndex} di ${locationName || stationId} akibat ${pollutionSource}. Eskalasi darurat diperlukan segera!`;
        } else if (priorityIndex >= 45) {
            urgencyLevel = 'Level 2 - Attention';
            warningMessage = `PERHATIAN: Peningkatan polutan signifikan (Priority Index: ${priorityIndex}) di ${locationName || stationId}.`;
        }

        // --- AGENT 3: TASK DISPATCHER ---
        let targetInstitution = 'Dinas Lingkungan Hidup (DLH) DKI Jakarta';
        let recommendedAction = 'Lakukan pemantauan berkala pada SPKU setempat.';

        if (pollutionSource.toLowerCase().includes('volcanic') || pollutionSource.toLowerCase().includes('krakatau')) {
            targetInstitution = 'BPBD DKI Jakarta & Dinas Kesehatan';
            recommendedAction = 'Distribusikan masker respirator N95 ke warga terdampak, aktifkan peringatan debu vulkanik, dan siagakan fasilitas kesehatan.';
        } else if (priorityIndex >= 75) {
            targetInstitution = 'DLH DKI Jakarta & Dinas Perhubungan (Dishub)';
            recommendedAction = 'Terapkan rekayasa lalu lintas/pembatasan kendaraan di area kritis, lakukan penyemprotan air jalanan (water mist), dan inspeksi emisi industri sekitar.';
        } else if (priorityIndex >= 45) {
            targetInstitution = 'Dinas Lingkungan Hidup (DLH) DKI Jakarta';
            recommendedAction = 'Tingkatkan frekuensi uji emisi kendaraan dan berikan imbauan pembatasan aktivitas luar ruangan bagi kelompok sensitif.';
        }

        // Simpan log ke PostgreSQL
        const savedLog = await pool.query(
            `INSERT INTO warning_logs 
            (station_id, location_name, severity_score, affected_area, pollution_source, priority_index, urgency_level, target_institution, recommended_action, warning_message) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                stationId,
                locationName || stationId,
                severityScore,
                affectedArea,
                pollutionSource,
                priorityIndex,
                urgencyLevel,
                targetInstitution,
                recommendedAction,
                warningMessage
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Agentic AI analysis and escalation completed',
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
        // 1. Ambil 20 log peringatan & Priority Index terbaru dari PostgreSQL
        const warningsResult = await pool.query(
            'SELECT * FROM warning_logs ORDER BY created_at DESC LIMIT 20'
        );

        // 2. Ambil data telemetri terbaru dari setiap stasiun di MongoDB untuk Heatmap
        const buckets = await Telemetry.find().sort({ bucketDate: -1 });
        const stationMap = new Map();

        for (const bucket of buckets) {
            if (!stationMap.has(bucket.stationId) && bucket.readings.length > 0) {
                const latestReading = bucket.readings[bucket.readings.length - 1];
                // Estimasi nilai AQI sederhana dari PM2.5
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