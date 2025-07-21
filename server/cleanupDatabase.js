const mongoose = require('mongoose');
require('dotenv').config();

// Modelleri import et
const Employee = require('./models/Employee');
const User = require('./models/User');
const Shift = require('./models/Shift');
const ServiceSchedule = require('./models/ServiceSchedule');
const Notification = require('./models/Notification');
const SystemLog = require('./models/SystemLog');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/canga';
    await mongoose.connect(mongoURI);
    console.log('🟢 MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('🔴 MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Veritabanı temizleme işlemi
const cleanupDatabase = async () => {
  try {
    console.log('\n🧹 VERİTABANI TEMİZLİK İŞLEMİ BAŞLADI...\n');
    
    // 1. Mevcut verileri say (istatistik için)
    const employeeCount = await Employee.countDocuments();
    const userCount = await User.countDocuments();
    const shiftCount = await Shift.countDocuments();
    const serviceScheduleCount = await ServiceSchedule.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    console.log('📊 MEVCUT VERİ İSTATİSTİKLERİ:');
    console.log(`   👥 Toplam Çalışan: ${employeeCount}`);
    console.log(`   👤 Toplam Kullanıcı: ${userCount}`);
    console.log(`   🕐 Toplam Vardiya: ${shiftCount}`);
    console.log(`   🚌 Toplam Servis Programı: ${serviceScheduleCount}`);
    console.log(`   🔔 Toplam Bildirim: ${notificationCount}\n`);

    // 2. Çalışanlara bağlı verileri temizle
    console.log('🗑️  ÇALIŞANLARABAĞlı VERİLER TEMİZLENİYOR...\n');

    // Users tablosunu tamamen temizle (employeeId unique constraint sorunu için)
    console.log('   🔧 User tablosundaki tüm veriler temizleniyor...');
    const userDeleteResult = await User.deleteMany({});
    console.log(`   ✅ ${userDeleteResult.deletedCount} kullanıcı tamamen silindi`);

    // Shift tablosundaki employee referanslarını temizle
    console.log('   🔧 Shift tablosundaki employee referansları temizleniyor...');
    const shiftUpdateResult = await Shift.updateMany(
      {},
      { 
        $set: { 
          employees: [],
          'workGroups.$[].employees': []
        }
      }
    );
    console.log(`   ✅ ${shiftUpdateResult.modifiedCount} vardiyadan employee referansları temizlendi`);

    // ServiceSchedule tablosundaki employee referanslarını temizle
    console.log('   🔧 ServiceSchedule tablosundaki employee referansları temizleniyor...');
    const serviceUpdateResult = await ServiceSchedule.updateMany(
      {},
      { 
        $unset: { 
          employeeId: "",
          employeeName: "" 
        },
        $set: {
          'route.employees': []
        }
      }
    );
    console.log(`   ✅ ${serviceUpdateResult.modifiedCount} servis programından employee referansları temizlendi`);

    // Notification tablosundaki employeeIds referanslarını temizle
    console.log('   🔧 Notification tablosundaki employeeIds referansları temizleniyor...');
    const notificationUpdateResult = await Notification.updateMany(
      { 'targetFilters.employeeIds': { $exists: true } },
      { 
        $set: { 
          'targetFilters.employeeIds': [] 
        }
      }
    );
    console.log(`   ✅ ${notificationUpdateResult.modifiedCount} bildirimden employee referansları temizlendi`);

    // ServiceSchedule tablosundaki yolcu listelerini temizle  
    console.log('   🔧 ServiceSchedule tablosundaki yolcu listeleri temizleniyor...');
    const passengerUpdateResult = await ServiceSchedule.updateMany(
      {},
      { 
        $set: {
          'serviceRoutes.$[].timeSlots.$[].passengers': [],
          'specialLists': [],
          'statistics.totalPassengers': 0
        }
      }
    );
    console.log(`   ✅ ${passengerUpdateResult.modifiedCount} servis programından yolcu listeleri temizlendi`);

    // 3. TÜM EMPLOYEE VERİLERİNİ SİL
    console.log('\n🗑️  TÜM ÇALIŞAN VERİLERİ SİLİNİYOR...\n');
    
    const employeeDeleteResult = await Employee.deleteMany({});
    console.log(`   ✅ ${employeeDeleteResult.deletedCount} çalışan başarıyla silindi!`);

    // 4. SystemLog'a temizlik kaydı ekle
    const logData = {
      action: 'SYSTEM_MAINTENANCE',
      level: 'INFO',
      message: 'Database cleanup completed successfully',
      description: `Deleted ${employeeDeleteResult.deletedCount} employees, ${userDeleteResult.deletedCount} users, updated ${shiftUpdateResult.modifiedCount} shifts, ${serviceUpdateResult.modifiedCount} service schedules, ${notificationUpdateResult.modifiedCount} notifications, ${passengerUpdateResult.modifiedCount} passenger lists`,
      metadata: {
        tags: ['database-cleanup', 'maintenance'],
        category: 'SYSTEM',
        source: 'cleanup-script'
      }
    };

    await SystemLog.create(logData);
    console.log('   📝 Temizlik işlemi sistem loglarına kaydedildi');

    // 5. Son kontrol - temizlik sonrası istatistikler
    console.log('\n📊 TEMİZLİK SONRASI İSTATİSTİKLER:');
    console.log(`   👥 Kalan Çalışan: ${await Employee.countDocuments()}`);
    console.log(`   👤 Kullanıcı: ${await User.countDocuments()}`);
    console.log(`   🕐 Vardiya: ${await Shift.countDocuments()}`);
    console.log(`   🚌 Servis Programı: ${await ServiceSchedule.countDocuments()}`);
    console.log(`   🔔 Bildirim: ${await Notification.countDocuments()}`);
    
    // Yolcu sayısını kontrol et
    const remainingPassengers = await ServiceSchedule.aggregate([
      { $unwind: '$serviceRoutes' },
      { $unwind: '$serviceRoutes.timeSlots' },
      { $unwind: { path: '$serviceRoutes.timeSlots.passengers', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const passengerCount = remainingPassengers.length > 0 ? remainingPassengers[0].count : 0;
    console.log(`   🧳 Kalan Yolcu: ${passengerCount}`);

    console.log('\n✅ VERİTABANI TEMİZLİK İŞLEMİ BAŞARIYLA TAMAMLANDI! 🎉\n');
    console.log('💡 Artık temiz bir veritabanın var. Yeni çalışanları ekleyebilirsin!\n');

  } catch (error) {
    console.error('\n🔴 TEMİZLİK İŞLEMİ SIRASINDA HATA:', error);
    
    // Hata logunu da kaydet
    try {
      await SystemLog.create({
        action: 'ERROR_OCCURRED',
        level: 'ERROR',
        message: 'Database cleanup failed',
        description: error.message,
        error: {
          message: error.message,
          stack: error.stack
        },
        metadata: {
          tags: ['database-cleanup', 'error'],
          category: 'SYSTEM',
          source: 'cleanup-script'
        }
      });
    } catch (logError) {
      console.error('🔴 Log kaydetme hatası:', logError);
    }
    
    throw error;
  }
};

// Script çalıştırma
const runCleanup = async () => {
  try {
    // Onay sorusu
    console.log('\n⚠️  UYARI: Bu işlem GERİ ALINMAZ!');
    console.log('🗑️  Tüm çalışan verileri ve bağlı referanslar silinecek.');
    console.log('📊 Sadece model şemaları korunacak.\n');
    
    // Node.js ortamında kullanıcı onayı (production'da bu kısmı kaldırabilirsin)
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askConfirmation = () => {
      return new Promise((resolve) => {
        rl.question('Bu işlemi gerçekleştirmek istediğinden emin misin? (evet/hayır): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'evet' || answer.toLowerCase() === 'yes');
        });
      });
    };

    const confirmed = await askConfirmation();
    
    if (!confirmed) {
      console.log('❌ İşlem iptal edildi.');
      process.exit(0);
    }

    // Veritabanına bağlan
    await connectDB();
    
    // Temizlik işlemini çalıştır
    await cleanupDatabase();
    
  } catch (error) {
    console.error('🔴 SCRIPT HATASI:', error);
  } finally {
    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
};

// Eğer script doğrudan çalıştırılıyorsa
if (require.main === module) {
  runCleanup();
}

module.exports = { cleanupDatabase, connectDB }; 