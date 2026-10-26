const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const telemetryRoutes = require('./routes/telemetryRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

// Main Routes
app.use('/api/telemetry', telemetryRoutes);

app.get('/', (req, res) => {
    res.send(' AeroAgent Backend API is Running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});