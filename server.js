const express = require('express');
const dotenv = require('dotenv');

// 1. Baca variabel .env terlebih dahulu
dotenv.config();

// 2. Import konfigurasi database & routes
const connectDB = require('./config/db');
const { connectPG } = require('./config/pg');
const telemetryRoutes = require('./routes/telemetryRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Inisialisasi koneksi MongoDB Atlas & PostgreSQL
connectDB();
connectPG();

const app = express();

app.use(express.json());

// Main Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
    res.send('AeroAgent Backend API is Running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});