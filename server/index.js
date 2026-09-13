require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const routes = require('./routes');
const config = require('./config/config');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = config.PORT;

connectDB();

const allowedOrigins = new Set([
    config.FRONTEND_URL,
    'http://myevalio.tech',
    'https://myevalio.tech',
    'http://localhost:3000',
].filter(Boolean));

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userId'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'degraded',
        uptime: process.uptime(),
        db: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
