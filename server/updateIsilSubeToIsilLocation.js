const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// 🔧 MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/canga');

// 📊 Işıl Şube departmanındaki çalışanların lokasyonunu İŞIL yap
async function updateIsilSubeToIsilLocation() {
  try {
    console.log('🚀 Işıl Şube departmanındaki çalışanların lokasyonu güncelleniyor...');
    
    // Bağlantı kurulana kadar bekle
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });

    // Önce "Işıl Şube" departmanındaki çalışanları bul
    const isilSubeEmployees = await Employee.find({ 
      departman: 'Işıl Şube' 
    });
    
    console.log(`📋 Bulunan "Işıl Şube" departmanındaki çalışanlar: ${isilSubeEmployees.length}`);
    
    if (isilSubeEmployees.length === 0) {
      // Farklı yazım şekillerini dene
      console.log('🔍 Farklı yazım şekillerini deniyorum...');
      
      const variations = [
        'IŞIL ŞUBE',
        'İŞİL ŞUBE', 
        'Isil Sube',
        'İsil Şube',
        'işıl şube'
      ];
      
      for (const variation of variations) {
        const employees = await Employee.find({ departman: variation });
        console.log(`   "${variation}": ${employees.length} çalışan`);
        
        if (employees.length > 0) {
          console.log(`✅ "${variation}" departmanında çalışanlar bulundu!`);
          
          // Bu departmandaki çalışanları güncelle
          const updateResult = await Employee.updateMany(
            { departman: variation },
            { $set: { lokasyon: 'İŞIL' } }
          );
          
          console.log(`📈 ${updateResult.modifiedCount} çalışanın lokasyonu İŞIL olarak güncellendi`);
          
          // Sonuçları kontrol et
          const updatedEmployees = await Employee.find({ departman: variation });
          console.log('\n📊 Güncellenen çalışanlar:');
          updatedEmployees.forEach((emp, index) => {
            console.log(`${index + 1}. ${emp.adSoyad} - Lokasyon: ${emp.lokasyon}`);
          });
          
          break;
        }
      }
    } else {
      // "Işıl Şube" departmanında çalışanlar bulundu
      console.log('📋 Mevcut durumları:');
      isilSubeEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad} - Lokasyon: ${emp.lokasyon}`);
      });
      
      // Lokasyonları güncelle
      const updateResult = await Employee.updateMany(
        { departman: 'Işıl Şube' },
        { $set: { lokasyon: 'İŞIL' } }
      );
      
      console.log(`\n✅ Güncelleme tamamlandı!`);
      console.log(`📈 ${updateResult.modifiedCount} çalışanın lokasyonu İŞIL olarak güncellendi`);
      
      // Güncellenmiş durumu göster
      const updatedEmployees = await Employee.find({ departman: 'Işıl Şube' });
      console.log('\n📊 Güncellenmiş durum:');
      updatedEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad} - Lokasyon: ${emp.lokasyon}`);
      });
    }
    
    // Genel istatistikler
    console.log('\n📈 Lokasyon dağılımı:');
    const locationStats = await Employee.aggregate([
      { $group: { _id: '$lokasyon', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    locationStats.forEach(stat => {
      console.log(`${stat._id || 'null'}: ${stat.count} çalışan`);
    });
    
    console.log('\n🎉 İşlem tamamlandı! Artık Işıl Şube departmanındaki çalışanlar İŞIL lokasyonunda!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 🚀 Script'i çalıştır
updateIsilSubeToIsilLocation(); 