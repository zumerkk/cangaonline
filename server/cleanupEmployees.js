const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Environment variables'ları yükle
dotenv.config();

// MongoDB Atlas bağlantısı
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

mongoose.connect(mongoURI);

async function cleanupEmployees() {
    try {
        console.log('🧹 Çalışan verilerini temizliyorum...');
        
        // Tüm çalışanları sil
        const result = await Employee.deleteMany({});
        
        console.log(`✅ ${result.deletedCount} çalışan verisi başarıyla silindi`);
        console.log('💾 Veritabanı temizlendi, yeni veriler için hazır!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Temizleme sırasında hata:', error);
        process.exit(1);
    }
}

cleanupEmployees(); 