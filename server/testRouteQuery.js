const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// MongoDB bağlantısı
const MONGODB_URI = "mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga";

async function testRouteQuery() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Servis güzergahı olan çalışanları getir
    const employeesWithRoute = await Employee.find({
      $or: [
        { servisGuzergahi: { $exists: true, $ne: '', $ne: null } },
        { 'serviceInfo.routeName': { $exists: true, $ne: '', $ne: null } }
      ]
    }).select('adSoyad servisGuzergahi serviceInfo').lean();

    console.log(`📊 Servis güzergahı olan çalışan sayısı: ${employeesWithRoute.length}`);
    
    if (employeesWithRoute.length > 0) {
      console.log('\n📋 İlk 5 çalışan:');
      employeesWithRoute.slice(0, 5).forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad}`);
        console.log(`   - servisGuzergahi: "${emp.servisGuzergahi}"`);
        console.log(`   - serviceInfo.routeName: "${emp.serviceInfo?.routeName || 'null'}"`);
        console.log('');
      });
    }

    // Dispanser güzergahı özelinde test
    const dispanserEmployees = await Employee.find({
      $or: [
        { servisGuzergahi: "DİSPANSER SERVİS GÜZERGAHI" },
        { 'serviceInfo.routeName': "DİSPANSER SERVİS GÜZERGAHI" }
      ]
    }).select('adSoyad servisGuzergahi serviceInfo').lean();

    console.log(`🎯 Dispanser güzergahı çalışan sayısı: ${dispanserEmployees.length}`);
    
    if (dispanserEmployees.length > 0) {
      console.log('\n📋 Dispanser güzergahı çalışanları:');
      dispanserEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.adSoyad}`);
        console.log(`   - servisGuzergahi: "${emp.servisGuzergahi}"`);
        console.log(`   - serviceInfo.routeName: "${emp.serviceInfo?.routeName || 'null'}"`);
      });
    }

    // Benzersiz güzergah isimlerini listele
    const uniqueRoutes = await Employee.distinct('servisGuzergahi', {
      servisGuzergahi: { $exists: true, $ne: '', $ne: null }
    });
    
    console.log(`\n🚌 Benzersiz güzergah isimleri (${uniqueRoutes.length} adet):`);
    uniqueRoutes.forEach((route, index) => {
      console.log(`${index + 1}. "${route}"`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  testRouteQuery();
}

module.exports = { testRouteQuery }; 