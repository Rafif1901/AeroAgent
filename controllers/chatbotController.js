const Telemetry = require('../models/Telemetry');
const { pool } = require('../config/pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Interaksi masyarakat dengan Agent 5 (Chatbot Dinamis Gemini) & Panel Visual Kanan
// @route   POST /api/chatbot/query
const handleChatQuery = async (req, res) => {
    try {
        const { message, location = 'Jakarta Pusat' } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message query is required'
            });
        }

        // 1. Ambil seluruh data stasiun terbaru dari MongoDB
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
                    so2: latest.so2 || 0,
                    no2: latest.no2 || 0,
                    o3: latest.o3 || 0,
                    categori: latest.categori || 'SEDANG',
                    temperature: latest.temperature || 28,
                    windSpeed: latest.windSpeed || 2.1,
                    humidity: latest.humidity || 75,
                    externalEvent: latest.externalEvent || 'Normal',
                    timestamp: latest.timestamp
                });
            }
        }

        stationList.sort((a, b) => b.aqi - a.aqi);

        const matchedStation = stationList.find(s =>
            s.locationName.toLowerCase().includes(location.toLowerCase()) ||
            s.stationId.toLowerCase().includes(location.toLowerCase())
        ) || stationList[0] || {
            stationId: 'DKI1',
            locationName: location,
            aqi: 55,
            pm25: 26.0,
            pm10: 45.0,
            co: 10.0,
            categori: 'SEDANG',
            temperature: 28,
            windSpeed: 2.1,
            humidity: 75,
            externalEvent: 'Normal'
        };

        // 2. Panggil Gemini API dengan konteks data telemetri asli (Grounding anti-halusinasi)
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.8-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const prompt = `
Anda adalah Agent 5 (Aero Chat Bot), asisten publik cerdas dari sistem pemantauan polusi udara AeroAgent DKI Jakarta.
Tugas Anda adalah menjawab pertanyaan pengguna secara ramah, menenangkan (tidak memicu kepanikan), objektif, dan WAJIB mengacu pada Data Telemetri Terverifikasi di bawah ini (jangan mengarang angka di luar data).

Lokasi Pengguna Saat Ini: ${matchedStation.locationName} (Stasiun: ${matchedStation.stationId})
Data Spesifik Lokasi Pengguna:
- AQI: ${matchedStation.aqi} (Kategori ISPU: ${matchedStation.categori})
- PM2.5: ${matchedStation.pm25} µg/m³ | PM10: ${matchedStation.pm10} µg/m³ | CO: ${matchedStation.co}
- Suhu: ${matchedStation.temperature}°C | Kelembapan: ${matchedStation.humidity}% | Kecepatan Angin: ${matchedStation.windSpeed} km/h
- Kejadian Eksternal: ${matchedStation.externalEvent}

Ringkasan Seluruh Stasiun SPKU Jakarta Saat Ini (Diurutkan dari polusi tertinggi):
${JSON.stringify(stationList.map(s => ({ stasiun: s.stationId, lokasi: s.locationName, aqi: s.aqi, pm25: s.pm25, kategori: s.categori })))}

Pertanyaan Pengguna: "${message}"

Berikan respons HANYA dalam format JSON dengan struktur berikut:
{
  "answer": "<jawaban bahasa alami yang langsung menjawab pertanyaan pengguna secara spesifik berdasarkan data di atas>",
  "aqiCategory": "<Good | Moderate | Unhealthy for Sensitive Groups | Unhealthy>",
  "healthInstruction": "<1 kalimat instruksi kesehatan praktis untuk kartu UI>",
  "safeRouteBadge": "<contoh: PM2.5 lebih rendah 15%>",
  "recommendedRouteName": "<nama rute utama yang disarankan sesuai konteks Jakarta>",
  "recommendedRouteDuration": "<estimasi waktu, contoh: 25 menit>",
  "recommendedRoutePm25": "<estimasi paparan PM2.5, contoh: 42 µg/m³>",
  "alternativeRouteName": "<nama rute alternatif>",
  "alternativeRouteDuration": "<estimasi waktu, contoh: 30 menit>",
  "alternativeRoutePm25": "<estimasi paparan PM2.5, contoh: 51 µg/m³>"
}`;

        const result = await model.generateContent(prompt);
        const aiOutput = JSON.parse(result.response.text());

        const criticalAreas = stationList.length >= 3
            ? stationList.slice(0, 3).map((s, idx) => ({ rank: idx + 1, area: s.locationName, aqi: s.aqi }))
            : [
                { rank: 1, area: 'Lubang Buaya, Jakarta Timur', aqi: 142 },
                { rank: 2, area: 'Kebon Jeruk, Jakarta Barat', aqi: 138 },
                { rank: 3, area: 'Kelapa Gading, Jakarta Utara', aqi: 122 }
            ];

        res.status(200).json({
            success: true,
            chatbotReply: {
                sender: 'Aero Chat Bot',
                timestamp: new Date().toISOString(),
                answer: aiOutput.answer,
                dataSource: 'Satu Data Indonesia (ISPU) & SPKU DKI Jakarta',
                disclaimer: 'Berikut panduan umum, bukan saran medis personal.'
            },
            rightPanelData: {
                airQualityCard: {
                    location: matchedStation.locationName,
                    aqi: matchedStation.aqi,
                    category: aiOutput.aqiCategory,
                    pm25: `${matchedStation.pm25} µg/m³`,
                    temperature: `${matchedStation.temperature}C`,
                    windSpeed: `${matchedStation.windSpeed}km/h`,
                    humidity: `${matchedStation.humidity}%`
                },
                healthRecommendationCard: {
                    icons: ['mask', 'footwear', 'phone', 'house'],
                    instruction: aiOutput.healthInstruction
                },
                safeRouteCard: {
                    badge: aiOutput.safeRouteBadge || 'PM2.5 lebih rendah 12%',
                    routes: [
                        {
                            name: aiOutput.recommendedRouteName || '1. Bundaran HI -> Jl. Sudirman',
                            duration: aiOutput.recommendedRouteDuration || '28 menit',
                            avgPm25: aiOutput.recommendedRoutePm25 || '44 µg/m³',
                            isRecommended: true
                        },
                        {
                            name: aiOutput.alternativeRouteName || 'Alternatif: via Jl. KH Mas Mansyur',
                            duration: aiOutput.alternativeRouteDuration || '32 menit',
                            avgPm25: aiOutput.alternativeRoutePm25 || '50 µg/m³',
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