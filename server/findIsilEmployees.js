const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// 🔧 MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/canga');

// 📊 Işıl ile ilgili tüm kayıtları bul
async function findIsilEmployees() {
  try {
    console.log('🔍 Işıl ile ilgili tüm kayıtlar aranıyor...');
    
    // Bağlantı kurulana kadar bekle
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });

    // Tüm departmanları listele
    console.log('📋 Tüm departmanlar:');
    const allDepartments = await Employee.distinct('departman');
    allDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. "${dept}"`);
    });
    
    // "Işıl" geçen tüm kayıtları regex ile ara
    console.log('\n🔍 "Işıl" geçen tüm kayıtlar:');
    const isilEmployees = await Employee.find({
      $or: [
        { adSoyad: { $regex: /ı[sş]ıl/i } },
        { departman: { $regex: /ı[sş]ıl/i } },
        { pozisyon: { $regex: /ı[sş]ıl/i } },
        { lokasyon: { $regex: /ı[sş]ıl/i } }
      ]
    });
    
    console.log(`📊 Bulunan kayıt sayısı: ${isilEmployees.length}`);
    
    if (isilEmployees.length > 0) {
      console.log('\n📋 Bulunan kayıtlar:');
      isilEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad}`);
        console.log(`   Departman: "${emp.departman}"`);
        console.log(`   Lokasyon: "${emp.lokasyon}"`);
        console.log(`   Pozisyon: "${emp.pozisyon}"`);
        console.log('');
      });
    }
    
    // Departman fieldını sayalım
    console.log('\n📊 Departman istatistikleri:');
    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$departman', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    departmentStats.forEach(stat => {
      console.log(`"${stat._id}": ${stat.count} çalışan`);
    });
    
    // Raw veri kontrolü
    console.log('\n🔍 Raw collection kontrolü:');
    const db = mongoose.connection.db;
    const collection = db.collection('employees');
    
    // Işıl geçen raw kayıtları bul
    const rawIsilEmployees = await collection.find({
      $or: [
        { adSoyad: { $regex: /ı[sş]ıl/i } },
        { departman: { $regex: /ı[sş]ıl/i } },
        { pozisyon: { $regex: /ı[sş]ıl/i } },
        { lokasyon: { $regex: /ı[sş]ıl/i } }
      ]
    }).toArray();
    
    console.log(`📊 Raw collection bulunan kayıt sayısı: ${rawIsilEmployees.length}`);
    
    if (rawIsilEmployees.length > 0) {
      console.log('\n📋 Raw collection kayıtları:');
      rawIsilEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad}`);
        console.log(`   Departman: "${emp.departman}"`);
        console.log(`   Lokasyon: "${emp.lokasyon}"`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 🚀 Script'i çalıştır
findIsilEmployees(); 