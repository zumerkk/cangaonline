const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const ServiceRoute = require('./models/ServiceRoute');

// 🌍 MongoDB bağlantısı
const MONGODB_URI = 'mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga';

// 📋 Excel'den alınan gerçek DİSPANSER güzergahı yolcu listesi
const dispanserPassengers = [
  { name: "ALİ GÜRBÜZ", stop: "ŞADIRVAN (PERŞEMBE PAZARI)", order: 1 },
  { name: "ALİ SAVAŞ", stop: "NOKTA A-101/DOĞTAŞ", order: 2 },
  { name: "BERAT ÖZDEN", stop: "DİSPANSER ÜST GEÇİT", order: 3 },
  { name: "CEVDET ÖKSÜZ", stop: "DİSPANSER ÜST GEÇİT", order: 4 },
  { name: "ERDAL YAKUT", stop: "GÜL PASTANESİ", order: 5 },
  { name: "EYÜP TORUN", stop: "DİSPANSER ÜST GEÇİT", order: 6 },
  { name: "İBRAHİM VARLIOĞLU", stop: "DİSPANSER ÜST GEÇİT", order: 7 },
  { name: "MUHAMMED SEFA PEHLİVANLI", stop: "DİSPANSER ÜST GEÇİT", order: 8 },
  { name: "MURAT ÇAVDAR", stop: "ŞADIRVAN (PERŞEMBE PAZARI)", order: 9 },
  { name: "MUSTAFA BIYIK", stop: "DİSPANSER ÜST GEÇİT", order: 10 },
  { name: "ÖZKAN AYDIN", stop: "DİSPANSER ÜST GEÇİT", order: 12 },
  { name: "CELAL GÜLŞEN", stop: "DİSPANSER ÜST GEÇİT", order: 13 },
  { name: "MUHAMMED NAZİM GÖÇ", stop: "DİSPANSER ÜST GEÇİT", order: 14 },
  { name: "TUNCAY TEKİN", stop: "DİSPANSER ÜST GEÇİT", order: 15 }
];

// 📋 Güncellenmiş Dispanser güzergahı durakları
const dispanserStops = [
  { name: "DİSPANSER", order: 1 },
  { name: "ŞADIRVAN (PERŞEMBE PAZARI)", order: 2 },
  { name: "MOTOSİKLET TAMİRCİLERİ", order: 3 },
  { name: "GÜL PASTANESİ", order: 4 },
  { name: "BELEDİYE OTOBÜS DURAKLARI", order: 5 },
  { name: "TİCARET ODASI", order: 6 },
  { name: "PTT", order: 7 },
  { name: "ESKİ REKTÖRLÜK", order: 8 },
  { name: "BAĞDAT KÖPRÜ", order: 9 },
  { name: "FABRİKA", order: 10 }
];

async function updateDispanserRoute() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // 1️⃣ Mevcut aktif çalışan sayısını kontrol et
    const totalActiveEmployees = await Employee.countDocuments({ durum: 'AKTIF' });
    console.log(`👥 Toplam aktif çalışan: ${totalActiveEmployees}`);

    // 2️⃣ Eski test verilerini temizle - Dispanser güzergahından çıkar
    console.log('\n🧹 Test verilerini temizleniyor...');
    const cleanupResult = await Employee.updateMany(
      { servisGuzergahi: 'DİSPANSER SERVİS GÜZERGAHI' },
      {
        $unset: {
          servisGuzergahi: "",
          durak: ""
        }
      }
    );
    console.log(`🗑️ ${cleanupResult.modifiedCount} çalışanın eski servis bilgileri temizlendi`);

    // 3️⃣ ServiceRoute'ta Dispanser güzergahını güncelle
    console.log('\n🚌 Dispanser güzergahını güncelleniyor...');
    await ServiceRoute.findOneAndUpdate(
      { routeName: 'DİSPANSER SERVİS GÜZERGAHI' },
      {
        routeName: 'DİSPANSER SERVİS GÜZERGAHI',
        routeCode: 'DSG-01',
        color: '#1976d2',
        status: 'AKTIF',
        stops: dispanserStops
      },
      { upsert: true, new: true }
    );
    console.log('✅ Dispanser güzergahı durakları güncellendi');

    // 4️⃣ Aktif çalışanları kontrol ederek güzergaha ata
    let addedCount = 0;
    let notFoundCount = 0;
    let inactiveCount = 0;

    console.log('\n👥 Excel\'deki yolcuları aktif çalışanlarla eşleştiriliyor...');
    
    for (const passenger of dispanserPassengers) {
      // İsim normalizasyonu - farklı yazılış varyasyonlarını handle et
      const searchNames = [
        passenger.name,
        passenger.name.toUpperCase(),
        passenger.name.toLowerCase()
      ];

      // Aktif çalışanları ara
      const employee = await Employee.findOne({
        durum: 'AKTIF',
        $or: [
          { adSoyad: { $in: searchNames } }
        ]
      });

      if (employee && employee.durum === 'AKTIF') {
        // Çalışanı güzergaha ata (eski model field'larını kullan)
        await Employee.findByIdAndUpdate(employee._id, {
          servisGuzergahi: 'DİSPANSER SERVİS GÜZERGAHI',
          durak: passenger.stop
        });

        console.log(`✅ ${passenger.name} → ${passenger.stop} (Sıra: ${passenger.order})`);
        addedCount++;
      } else {
        // Pasif veya bulunamayan çalışanları kontrol et
        const anyEmployee = await Employee.findOne({
          adSoyad: passenger.name
        });

        if (anyEmployee && anyEmployee.durum !== 'AKTIF') {
          console.log(`⚠️ ${passenger.name} - PASIF DURUM (${anyEmployee.durum})`);
          inactiveCount++;
        } else {
          console.log(`❌ ${passenger.name} - AKTİF ÇALIŞAN BULUNAMADI`);
          notFoundCount++;
        }
      }
    }

    // 5️⃣ Sonuçları raporla
    console.log('\n📊 İŞLEM SONUÇLARI:');
    console.log('='.repeat(50));
    console.log(`✅ Başarıyla eklenen: ${addedCount} yolcu`);
    console.log(`❌ Bulunamayan: ${notFoundCount} yolcu`);
    console.log(`⚠️ Pasif durumdaki: ${inactiveCount} yolcu`);
    console.log(`📋 Toplam işlenen: ${dispanserPassengers.length} kayıt`);

    // 6️⃣ Güncel durum kontrolü
    const currentDispanserUsers = await Employee.countDocuments({
      durum: 'AKTIF',
      servisGuzergahi: 'DİSPANSER SERVİS GÜZERGAHI'
    });

    console.log(`\n🎯 GÜNCEL DURUM:`);
    console.log(`🚌 Dispanser güzergahında aktif yolcu: ${currentDispanserUsers}`);
    console.log(`👥 Toplam aktif çalışan: ${totalActiveEmployees}`);

    // 7️⃣ Durak bazında yolcu dağılımı
    console.log('\n📍 DURAK BAZINDA YOLCU DAĞILIMI:');
    const stopDistribution = await Employee.aggregate([
      {
        $match: {
          durum: 'AKTIF',
          servisGuzergahi: 'DİSPANSER SERVİS GÜZERGAHI'
        }
      },
      {
        $group: {
          _id: '$durak',
          count: { $sum: 1 },
          passengers: { $push: '$adSoyad' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    stopDistribution.forEach(stop => {
      console.log(`🚏 ${stop._id}: ${stop.count} yolcu`);
      stop.passengers.forEach(name => console.log(`   - ${name}`));
    });

    console.log('\n🎉 Dispanser servis güzergahı başarıyla güncellendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
updateDispanserRoute(); 