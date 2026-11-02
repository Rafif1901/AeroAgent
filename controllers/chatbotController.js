const Telemetry = require('../models/Telemetry');
const { pool } = require('../config/pg');

// @desc    Interaksi masyarakat dengan Agent 5 (Chatbot) & Panel Visual Kanan
// @route   POST /api/chatbot/query
const handleChatQuery = async (req, res) => {
    try {
        const { message, location = 'Cilandak, Jakarta' } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message query is required'
            });
        }

        // Ambil seluruh stasiun terbaru dari MongoDB untuk referensi data terverifikasi
        const buckets = await Telemetry.find().sort({ bucketDate: -1 });
        const stationList = [];

        for (const bucket of buckets) {
            if (bucket.readings && bucket.readings.length > 0) {
                const latest = bucket.readings[bucket.readings.length - 1];
                const aqi = Math.round(latest.pm25 * 2.1);
                stationList.push({
                    stationId: bucket.stationId,
                    locationName: bucket.locationName || bucket.stationId,
                    aqi,
                    pm25: latest.pm25,
                    pm10: latest.pm10,
                    co: latest.co,
                    temperature: latest.temperature || 25,
                    windSpeed: latest.windSpeed || 2.1,
                    humidity: latest.humidity || 90,
                    timestamp: latest.timestamp
                });
            }
        }

        // Urutkan dari AQI tertinggi untuk kartu "Area Paling Kritis"
        stationList.sort((a, b) => b.aqi - a.aqi);

        // Cari stasiun yang cocok dengan lokasi pengguna, atau gunakan default bila belum ada di DB
        const matchedStation = stationList.find(s =>
            s.locationName.toLowerCase().includes(location.toLowerCase()) ||
            s.stationId.toLowerCase().includes(location.toLowerCase())
        ) || stationList[0] || {
            stationId: 'SPKU-JKT-SEL',
            locationName: location,
            aqi: 32,
            pm25: 12.0,
            pm10: 28.0,
            co: 0.8,
            temperature: 25,
            windSpeed: 2.1,
            humidity: 90
        };

        // Tentukan kategori AQI & Health Recommendation
        let aqiCategory = 'Good';
        let healthInstruction = 'Udara bersih, aman untuk beraktivitas di luar ruangan.';

        if (matchedStation.aqi > 150) {
            aqiCategory = 'Unhealthy';
            healthInstruction = 'Gunakan masker respirator (N95/KN95) saat di luar ruangan dan hindari olahraga luar ruang.';
        } else if (matchedStation.aqi > 100) {
            aqiCategory = 'Unhealthy for Sensitive Groups';
            healthInstruction = 'Wear a mask if you are outside. Untuk kelompok sensitif, kurangi aktivitas berat di luar ruangan.';
        } else if (matchedStation.aqi > 50) {
            aqiCategory = 'Moderate';
            healthInstruction = 'Wear a mask if you are outside jika Anda memiliki sensitivitas pernapasan.';
        }

        // Susun balasan NLP berdasarkan konteks pertanyaan (Quick Replies / Natural Language)
        const lowerMsg = message.toLowerCase();
        let replyText = `Saat ini AQI di ${matchedStation.locationName} adalah ${matchedStation.aqi} (${aqiCategory}) dengan konsentrasi PM2.5 sebesar ${matchedStation.pm25} µg/m³. ${healthInstruction}`;

        if (lowerMsg.includes('olahraga') || lowerMsg.includes('lari')) {
            replyText = matchedStation.aqi > 100
                ? `Untuk kelompok sensitif, pertimbangkan olahraga di dalam ruangan atau kurangi aktivitas berat di luar karena AQI mencapai ${matchedStation.aqi}.`
                : `Kualitas udara di ${matchedStation.locationName} saat ini cukup baik (AQI ${matchedStation.aqi}), cocok untuk olahraga pagi di luar ruangan.`;
        } else if (lowerMsg.includes('rute') || lowerMsg.includes('kantor') || lowerMsg.includes('jalan')) {
            replyText = `Saya merekomendasikan rute alternatif dengan paparan polutan PM2.5 yang lebih rendah. Detail perbandingan rute aman tersedia di panel sebelah kanan.`;
        }

        // Daftar Area Paling Kritis (menggunakan data DB atau fallback contoh Jakarta)
        const criticalAreas = stationList.length >= 3
            ? stationList.slice(0, 3).map((s, idx) => ({ rank: idx + 1, area: s.locationName, aqi: s.aqi }))
            : [
                { rank: 1, area: 'Cawang', aqi: 142 },
                { rank: 2, area: 'Cempaka Putih', aqi: 138 },
                { rank: 3, area: 'Tanjung Priok', aqi: 122 }
            ];

        res.status(200).json({
            success: true,
            chatbotReply: {
                sender: 'Aero Chat Bot',
                timestamp: new Date().toISOString(),
                answer: replyText,
                dataSource: 'Satu Data Indonesia (ISPU) & SPKU DKI Jakarta',
                disclaimer: 'Berikut panduan umum, bukan saran medis personal.'
            },
            rightPanelData: {
                airQualityCard: {
                    location: matchedStation.locationName,
                    aqi: matchedStation.aqi,
                    category: aqiCategory,
                    pm25: `${matchedStation.pm25} µg/m³`,
                    temperature: `${matchedStation.temperature}C`,
                    windSpeed: `${matchedStation.windSpeed}km/h`,
                    humidity: `${matchedStation.humidity}%`
                },
                healthRecommendationCard: {
                    icons: ['mask', 'footwear', 'phone', 'house'],
                    instruction: healthInstruction
                },
                safeRouteCard: {
                    badge: 'PM2.5 lebih rendah 12%',
                    routes: [
                        {
                            name: '1. Bundaran HI -> Jl. Sudirman',
                            duration: '28 menit',
                            avgPm25: '44 µg/m³',
                            isRecommended: true
                        },
                        {
                            name: 'Alternatif: via Jl. KH Mas Mansyur',
                            duration: '32 menit',
                            avgPm25: '50 µg/m³',
                            isRecommended: false
                        }
                    ]
                },
                criticalAreasCard: criticalAreas
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Simpan feedback pengguna terhadap jawaban Chatbot (Thumbs Up/Down & Report)
// @route   POST /api/chatbot/feedback
const submitChatFeedback = async (req, res) => {
    try {
        const { userQuery, botResponse, rating, reason, comment } = req.body;

        if (!rating || !['up', 'down'].includes(rating.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Rating is required ("up" or "down")'
            });
        }

        const savedFeedback = await pool.query(
            `INSERT INTO chatbot_feedback (user_query, bot_response, rating, reason, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userQuery || '', botResponse || '', rating.toLowerCase(), reason || null, comment || null]
        );

        res.status(201).json({
            success: true,
            message: 'Feedback successfully recorded for AI evaluation',
            data: savedFeedback.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    handleChatQuery,
    submitChatFeedback
};