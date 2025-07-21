const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Environment variables'ları yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - Production için CORS ayarları
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://canga-vardiya-sistemi-production.up.railway.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean); // undefined değerleri filtrele

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas bağlantısı - Cloud Database
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  console.error('🔧 .env dosyasında MongoDB Atlas connection string\'ini tanımlayın');
  console.error('📝 Örnek: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname');
  process.exit(1);
}

// 🚀 Database optimization ve indexing
const createDatabaseIndexes = async () => {
  try {
    console.log('🔧 Creating database indexes for performance...');

    // Employee indexes for faster queries
    await require('./models/Employee').collection.createIndex({ 
      status: 1, 
      department: 1 
    }, { name: 'employee_status_dept_idx' });

    await require('./models/Employee').collection.createIndex({ 
      location: 1, 
      status: 1 
    }, { name: 'employee_location_status_idx' });

    await require('./models/Employee').collection.createIndex({ 
      fullName: 'text', 
      firstName: 'text', 
      lastName: 'text',
      employeeId: 'text' 
    }, { name: 'employee_search_idx' });

    // Shift indexes for faster queries
    await require('./models/Shift').collection.createIndex({ 
      status: 1, 
      location: 1 
    }, { name: 'shift_status_location_idx' });

    await require('./models/Shift').collection.createIndex({ 
      startDate: 1, 
      endDate: 1 
    }, { name: 'shift_dates_idx' });

    await require('./models/Shift').collection.createIndex({ 
      createdAt: -1 
    }, { name: 'shift_created_idx' });

    // User indexes
    await require('./models/User').collection.createIndex({ 
      email: 1 
    }, { unique: true, name: 'user_email_unique_idx' });

    // General performance indexes
    await require('./models/Notification').collection.createIndex({ 
      createdAt: -1 
    }, { name: 'notification_created_idx' });

    await require('./models/SystemLog').collection.createIndex({ 
      timestamp: -1 
    }, { name: 'system_log_timestamp_idx' });

    console.log('✅ Database indexes created successfully!');
  } catch (error) {
    console.warn('⚠️ Index creation warning (may already exist):', error.message);
  }
};

// MongoDB Atlas bağlantısı - Gelişmiş konfigürasyon
mongoose.connect(mongoURI, {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(async () => {
    console.log('✅ MongoDB Atlas connected successfully');
    
    // 🚀 Performance optimization
    await createDatabaseIndexes();
    
    // Connection pool optimization
    mongoose.connection.db.admin().command({ 
      setParameter: 1, 
      maxTimeMSForReadOperations: 30000  // 30 second timeout
    }).catch(err => console.log('Connection optimization note:', err.message));
    
    console.log('📊 Database ready for high-performance queries!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('💡 MongoDB bağlantı detayları:', {
      uri: mongoURI ? mongoURI.replace(/\/\/.*@/, '//***:***@') : 'undefined',
      nodeEnv: process.env.NODE_ENV,
      error: err.message
    });
    process.exit(1);
  });

// Routes - API endpoints
app.use('/api/employees', require('./routes/employees'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/services', require('./routes/services')); // Servis sistemi
app.use('/api/notifications', require('./routes/notifications')); // Bildirim sistemi
app.use('/api/users', require('./routes/users')); // Kullanıcı yönetim sistemi
app.use('/api/database', require('./routes/database')); // MongoDB Veritabanı Yönetimi
app.use('/api/calendar', require('./routes/calendar')); // Takvim/Ajanda sistemi
app.use('/api/scheduled-lists', require('./routes/scheduledLists')); // 📅 Otomatik Liste Sistemi
app.use('/api/analytics', require('./routes/analytics')); // 📊 Analytics & Raporlama
app.use('/api/ai-analysis', require('./routes/aiAnalysis')); // 🤖 AI Veri Analizi

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Canga Vardiya Sistemi API çalışıyor! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    message: 'Canga Savunma Endüstrisi - Vardiya Yönetim Sistemi API',
    version: '2.0.0',
    endpoints: {
      employees: '/api/employees',
      shifts: '/api/shifts',
      excel: '/api/excel',
      dashboard: '/api/dashboard',
      services: '/api/services',
      notifications: '/api/notifications',
      database: '/api/database', // MongoDB Yönetimi
      calendar: '/api/calendar', // Takvim/Ajanda
      scheduledLists: '/api/scheduled-lists', // 📅 Otomatik Liste Sistemi
      analytics: '/api/analytics', // 📊 Analytics & Raporlama
      aiAnalysis: '/api/ai-analysis', // 🤖 AI Veri Analizi
      health: '/api/health'
    },
    newFeatures: {
      'Otomatik Liste Oluşturma': 'Zamanlanmış listeler ile otomatik Excel üretimi',
      'Gelişmiş Analytics': 'Kullanım istatistikleri ve performans raporları',
      'Trending Analizi': 'Departman ve şablon bazlı kullanım trendleri',
      'AI Veri Analizi': 'Gemini AI ile akıllı isim benzerlik ve veri tutarlılık analizi',
      'Hata Tespit Sistemi': 'AI destekli otomatik hata bulma ve temizleme önerileri'
    }
  });
});

// Hata yakalama middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Hatası:', error);
  res.status(500).json({
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint bulunamadı',
    path: req.originalUrl
  });
});

// Server'ı başlat - MongoDB bağlantısı hazır olduktan sonra
let server;

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n👋 ${signal} alındı. Server kapatılıyor...`);
  
  if (server) {
    server.close(() => {
      console.log('🌐 HTTP server kapatıldı');
      mongoose.connection.close(false).then(() => {
        console.log('📦 MongoDB bağlantısı kapatıldı');
        process.exit(0);
      }).catch(err => {
        console.error('❌ MongoDB kapatma hatası:', err);
        process.exit(1);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// MongoDB bağlantısı hazır olduktan sonra server'ı başlat
mongoose.connection.once('open', () => {
  server = app.listen(PORT, () => {
    console.log(`
🚀 Canga Vardiya Sistemi Backend çalışıyor!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📝 API Docs: http://localhost:${PORT}/
🔧 Health Check: http://localhost:${PORT}/api/health
🔗 MongoDB: ✅ Connected and Ready
    `);
  });
});

// Fallback - 15 saniye sonra yine de başlat (timeout için)
setTimeout(() => {
  if (!server) {
    console.log('⚠️ MongoDB timeout - Server fallback mode başlatılıyor...');
    server = app.listen(PORT, () => {
      console.log(`
🚀 Canga Backend (Fallback Mode)
📡 Port: ${PORT}
⚠️ MongoDB: Bağlantı bekleniyor...
      `);
    });
  }
}, 15000);

module.exports = app; 