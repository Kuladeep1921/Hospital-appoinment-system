// ── Global error catchers (MUST be first — catches any silent crash) ─────────
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    process.exit(1);
});
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');

dotenv.config();

// ── Startup env diagnostics ───────────────────────────────────────────────────
console.log('🔍 ENV check:');
console.log('   NODE_ENV   :', process.env.NODE_ENV    || '(not set)');
console.log('   PORT       :', process.env.PORT        || '(not set)');
console.log('   MONGO_URI  :', process.env.MONGO_URI   ? '✅ present' : '❌ MISSING');
console.log('   JWT_SECRET :', process.env.JWT_SECRET  ? '✅ present' : '❌ MISSING');
console.log('   GROQ_KEY   :', process.env.GROQ_API_KEY ? '✅ present' : '❌ MISSING');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '(not set — using localhost fallback)');

if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is not set. Add it in Render Dashboard → Environment.');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not set. Add it in Render Dashboard → Environment.');
    process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Load routes one-by-one so we see exactly which one crashes ───────────────
console.log('📦 Loading routes...');
let authRoutes, doctorRoutes, appointmentRoutes, chatbotRoutes,
    districtRoutes, hospitalRoutes, userRoutes, placesRoutes;

try { authRoutes        = require('./routes/authRoutes');        console.log('   ✅ authRoutes'); }
catch (e) { console.error('   ❌ authRoutes failed:', e.message, e.stack); process.exit(1); }

try { doctorRoutes      = require('./routes/doctorRoutes');      console.log('   ✅ doctorRoutes'); }
catch (e) { console.error('   ❌ doctorRoutes failed:', e.message, e.stack); process.exit(1); }

try { appointmentRoutes = require('./routes/appointmentRoutes'); console.log('   ✅ appointmentRoutes'); }
catch (e) { console.error('   ❌ appointmentRoutes failed:', e.message, e.stack); process.exit(1); }

try { chatbotRoutes     = require('./routes/chatbotRoutes');     console.log('   ✅ chatbotRoutes'); }
catch (e) { console.error('   ❌ chatbotRoutes failed:', e.message, e.stack); process.exit(1); }

try { districtRoutes    = require('./routes/districtRoutes');    console.log('   ✅ districtRoutes'); }
catch (e) { console.error('   ❌ districtRoutes failed:', e.message, e.stack); process.exit(1); }

try { hospitalRoutes    = require('./routes/hospitalRoutes');    console.log('   ✅ hospitalRoutes'); }
catch (e) { console.error('   ❌ hospitalRoutes failed:', e.message, e.stack); process.exit(1); }

try { userRoutes        = require('./routes/userRoutes');        console.log('   ✅ userRoutes'); }
catch (e) { console.error('   ❌ userRoutes failed:', e.message, e.stack); process.exit(1); }

try { placesRoutes      = require('./routes/placesRoutes');      console.log('   ✅ placesRoutes'); }
catch (e) { console.error('   ❌ placesRoutes failed:', e.message, e.stack); process.exit(1); }

console.log('📦 All routes loaded OK');
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// CORS
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chatbot',      chatbotRoutes);
app.use('/api/districts',    districtRoutes);
app.use('/api/hospitals',    hospitalRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/places',       placesRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'MediBook Healthcare API is running' });
});

// Connect to MongoDB and start server
const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log('🔌 Connecting to MongoDB...');
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () =>
            console.log(`🚀 Server running on port ${PORT}`)
        );
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:');
        console.error('   Message :', err.message);
        console.error('   Code    :', err.code);
        console.error('   Full err:', err);
        process.exit(1);
    });
