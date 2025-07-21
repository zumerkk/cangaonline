const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const quickImport = async () => {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // 1. Mevcut tüm çalışanları temizle
    console.log('🗑️  TÜM ÇALIŞANLAR SİLİNİYOR...');
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} çalışan silindi\n`);

    // 2. Test verisi ekle
    console.log('💾 TEST VERİSİ EKLENİYOR...');
    
    const testEmployee = new Employee({
      adSoyad: 'Test KULLANICI',
      tcNo: '12345678901',
      departman: 'MERKEZ FABRİKA',
      lokasyon: 'MERKEZ',
      pozisyon: 'ÇALIŞAN',
      durum: 'AKTIF'
    });

    await testEmployee.save();
    console.log('✅ Test kullanıcı eklendi');

    // 3. Kontrol
    const finalCount = await Employee.countDocuments();
    console.log(`💾 Toplam: ${finalCount} çalışan\n`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('❌ İşlem hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// İşlemi başlat
console.log('🚀 VERİTABANI TEMİZLEME BAŞLIYOR...\n');
quickImport(); 