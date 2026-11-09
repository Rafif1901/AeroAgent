const Telemetry = require('../models/Telemetry');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// @desc    Ingest data sensor polusi manual (Sama seperti sebelumnya)
// @route   POST /api/telemetry
const addTelemetryData = async (req, res) => {
    try {
        const { stationId, locationName, pm25, pm10, co, so2, no2, o3, categori, temperature, humidity, windSpeed, externalEvent } = req.body;
        const now = new Date();
        const bucketDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        const readingData = {
            timestamp: now,
            pm25, pm10: pm10 ?? 0, co: co ?? 0, so2: so2 ?? 0, no2: no2 ?? 0, o3: o3 ?? 0, categori: categori || 'SEDANG',
            temperature: temperature ?? 28.0, humidity: humidity ?? 75.0, windSpeed: windSpeed ?? 2.5, externalEvent: externalEvent || 'Normal'
        };

        const updatedBucket = await Telemetry.findOneAndUpdate(
            { stationId, bucketDate },
            { $set: { locationName: locationName || stationId }, $inc: { count: 1 }, $push: { readings: readingData } },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, message: 'Telemetry data successfully stored', data: updatedBucket });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Agent 1 (Data Collector): Baca CSV ISPU Jakarta secara otomatis & masukkan ke Database
// @route   POST /api/telemetry/sync-ispu
const syncISPUData = async (req, res) => {
    const results = [];
    // Mengarahkan path satu level ke atas dari folder controllers menuju root folder
    const csvFilePath = path.join(__dirname, '../data_ispu_jakarta.csv');

    if (!fs.existsSync(csvFilePath)) {
        return res.status(404).json({ 
            success: false, 
            message: 'File CSV tidak ditemukan. Pastikan Anda telah mengubah namanya menjadi data_ispu_jakarta.csv dan meletakkannya di folder utama proyek (sejajar dengan server.js).' 
        });
    }

    // Mulai membaca file CSV
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const latestDataMap = new Map();
                
                // Looping semua baris CSV. Karena CSV biasanya berisi data harian dari tanggal 1 hingga akhir bulan, 
                // penggunaan Map ini secara otomatis akan menimpa data stasiun yang sama, sehingga kita mendapatkan 
                // data terakhir/terbaru (tanggal terbesar) yang ada di file CSV untuk setiap stasiun.
                for (const item of results) {
                    const stasiunLengkap = item.stasiun || 'DKI Unknown';
                    // Mencari pola "DKI" diikuti angka, misal "DKI1" dari "DKI1 (Bunderan HI)"
                    const stationIdMatch = stasiunLengkap.match(/DKI\d+/);
                    const stationId = stationIdMatch ? stationIdMatch[0] : 'SPKU-DKI';
                    
                    // Mengambil nama lokasi dengan menghapus ID stasiunnya
                    const locationName = stasiunLengkap.replace(/DKI\d+/, '').replace(/[()]/g, '').trim() || stationId;

                    // Mapping nama kolom sesuai CSV Satu Data Indonesia
                    latestDataMap.set(stationId, {
                        stationId,
                        locationName,
                        pm25: Number(item.pm_duakomalima) || 0,
                        pm10: Number(item.pm_sepuluh) || 0,
                        so2: Number(item.sulfur_dioksida) || 0,
                        co: Number(item.karbon_monoksida) || 0,
                        o3: Number(item.ozon) || 0,
                        no2: Number(item.nitrogen_dioksida) || 0,
                        categori: item.kategori || 'SEDANG'
                    });
                }

                const now = new Date();
                const bucketDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
                const syncedStations = [];

                // Simpan data terbaru setiap stasiun ke MongoDB
                for (const stationData of latestDataMap.values()) {
                    const readingData = {
                        timestamp: now,
                        pm25: stationData.pm25,
                        pm10: stationData.pm10,
                        co: stationData.co,
                        so2: stationData.so2,
                        no2: stationData.no2,
                        o3: stationData.o3,
                        categori: stationData.categori,
                        temperature: 29.5, // Cuaca default karena ISPU tidak memiliki sensor suhu
                        humidity: 78.0,
                        windSpeed: 2.1,
                        externalEvent: 'Normal'
                    };

                    const updated = await Telemetry.findOneAndUpdate(
                        { stationId: stationData.stationId, bucketDate },
                        {
                            $set: { locationName: stationData.locationName },
                            $inc: { count: 1 },
                            $push: { readings: readingData }
                        },
                        { upsert: true, new: true }
                    );
                    syncedStations.push(updated);
                }

                res.status(201).json({
                    success: true,
                    message: `Agent 1 berhasil membaca CSV lokal dan menyinkronkan data untuk ${syncedStations.length} stasiun`,
                    data: syncedStations
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
};

// @desc    Ambil riwayat telemetri per stasiun
// @route   GET /api/telemetry/:stationId
const getTelemetryByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const data = await Telemetry.find({ stationId }).sort({ bucketDate: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { addTelemetryData, syncISPUData, getTelemetryByStation };