const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// 🔧 MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/canga');

// 📊 Işıl Şube departmanındaki 47 çalışanın lokasyonunu İŞIL yap
async function updateIsilSubeToIsilFinal() {
  try {
    console.log('🚀 Işıl Şube departmanındaki 47 çalışanın lokasyonu İŞIL yapılıyor...');
    
    // Bağlantı kurulana kadar bekle
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });

    // "Işıl Şube" departmanındaki çalışanları bul
    const isilSubeEmployees = await Employee.find({ 
      departman: 'Işıl Şube' 
    });
    
    console.log(`📋 Bulunan "Işıl Şube" departmanındaki çalışanlar: ${isilSubeEmployees.length}`);
    
    if (isilSubeEmployees.length > 0) {
      // İlk 5 çalışanı göster
      console.log('\n📋 İlk 5 çalışan:');
      isilSubeEmployees.slice(0, 5).forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad} - Mevcut Lokasyon: ${emp.lokasyon}`);
      });
      
      // Lokasyonları güncelle
      const updateResult = await Employee.updateMany(
        { departman: 'Işıl Şube' },
        { $set: { lokasyon: 'İŞIL' } }
      );
      
      console.log(`\n✅ Güncelleme tamamlandı!`);
      console.log(`📈 ${updateResult.modifiedCount} çalışanın lokasyonu İŞIL olarak güncellendi`);
      
      // Güncellenmiş durumu kontrol et
      const updatedEmployees = await Employee.find({ departman: 'Işıl Şube' });
      console.log('\n📊 Güncellenmiş durum (İlk 5 çalışan):');
      updatedEmployees.slice(0, 5).forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad} - Yeni Lokasyon: ${emp.lokasyon}`);
      });
      
      // Genel istatistikler
      console.log('\n📈 Güncellenmiş lokasyon dağılımı:');
      const locationStats = await Employee.aggregate([
        { $group: { _id: '$lokasyon', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      locationStats.forEach(stat => {
        console.log(`${stat._id || 'null'}: ${stat.count} çalışan`);
      });
      
      // Son kontrol - İŞIL lokasyonundaki çalışanları göster
      const isilLocationEmployees = await Employee.find({ lokasyon: 'İŞIL' });
      console.log(`\n🎯 İŞIL lokasyonundaki toplam çalışan: ${isilLocationEmployees.length}`);
      
      console.log('\n🎉 İşlem başarıyla tamamlandı!');
      console.log('   ✅ Işıl Şube departmanındaki 47 çalışan artık İŞIL lokasyonunda');
      console.log('   ✅ Diğer çalışanlar MERKEZ lokasyonunda kaldı');
      
    } else {
      console.log('❌ "Işıl Şube" departmanında çalışan bulunamadı!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 🚀 Script'i çalıştır
updateIsilSubeToIsilFinal(); 