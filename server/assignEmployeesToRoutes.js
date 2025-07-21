const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const ServiceRoute = require('./models/ServiceRoute');

// MongoDB bağlantısı
const MONGODB_URI = "mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga";

// Excel'deki güzergah ve yolcu verileri
const routePassengerData = {
  "DİSPANSER SERVİS GÜZERGAHI": [
    { name: "ALİ GÜRBÜZ", stop: "SADIRVAN (PERŞEMBE PAZARI)", order: 1 },
    { name: "ALİ SAVAŞ", stop: "NOKTA A-101/DOĞTAŞ", order: 2 },
    { name: "BERAT ÖZDEN", stop: "DİSPANSER ÜST GEÇİT", order: 3 },
    { name: "CEVCET ÖKSÜZ", stop: "DİSPANSER ÜST GEÇİT", order: 4 },
    { name: "ERDAL YAKUT", stop: "GÜL PASTANESİ", order: 5 },
    { name: "EYÜP TORUN", stop: "DİSPANSER ÜST GEÇİT", order: 6 },
    { name: "İBRAHİM VARLIOĞLU", stop: "DİSPANSER ÜST GEÇİT", order: 7 },
    { name: "MUHAMMED SEFA PEHLİVANLI", stop: "DİSPANSER ÜST GEÇİT", order: 8 },
    { name: "MURAT ÇAVDAR", stop: "SADIRVAN (PERŞEMBE PAZARI)", order: 9 },
    { name: "MUSTAFA BIYIK", stop: "DİSPANSER ÜST GEÇİT", order: 10 },
    { name: "ÖZKAN AYDIN", stop: "DİSPANSER ÜST GEÇİT", order: 12 },
    { name: "CELAL GÜLŞEN", stop: "DİSPANSER ÜST GEÇİT", order: 13 },
    { name: "MUHAMMED NAZİM GÖÇ", stop: "DİSPANSER ÜST GEÇİT", order: 14 },
    { name: "TUNCAY TEKİN", stop: "DİSPANSER ÜST GEÇİT", order: 15 }
  ],
  
  "SANAYİ MAHALLESİ SERVİS GÜZERGAHI": [
    { name: "ALİ ŞIH YORULMAZ", stop: "ÇORBACI ALİ DAYI", order: 1 },
    { name: "AHMET DURAN TUNA", stop: "NOKTA A-101/DOĞTAŞ", order: 2 },
    { name: "FATİH BALOĞLU", stop: "ÇORBACI ALİ DAYI", order: 4 },
    { name: "HAKKİ YÜCEL", stop: "ÇORBACI ALİ DAYI", order: 5 },
    { name: "HAYATİ SÖZDİNLER", stop: "ÇORBACI ALİ DAYI", order: 6 },
    { name: "HAYDAR ACAR", stop: "RASATTEPE KÖPRÜ", order: 7 },
    { name: "GÜLNUR AĞIRMAN", stop: "AYTEMİZ PETROL", order: 7 },
    { name: "İSMET BAŞER", stop: "AYTEMİZ PETROL", order: 8 },
    { name: "KEMALETTİN GÜLEŞEN", stop: "RASATTEPE KÖPRÜ", order: 9 },
    { name: "MACİT USLU", stop: "ÇORBACI ALİ DAYI", order: 10 },
    { name: "MUSTAFA SÜMER", stop: "RASATTEPE KÖPRÜ", order: 11 },
    { name: "NİYAZİ YURTSEVEN", stop: "NOKTA A-101", order: 12 },
    { name: "BERAT AKTAŞ", stop: "NOKTA A-101", order: 13 },
    { name: "NURİ ÖZKAN", stop: "ÇORBACI ALİ DAYI", order: 14 },
    { name: "MUSTAFA BAŞKAYA", stop: "ÇORBACI ALİ DAYI", order: 16 },
    { name: "MUZAFFER KIZILÇIÇEK", stop: "MEZARLIK PEYZAJ ÖNÜ", order: 17 }
  ],
  
  "OSMANGAZİ-KARŞIYAKA MAHALLESİ": [
    { name: "ASIM DEMET", stop: "SALI PAZARI", order: 1 },
    { name: "İLYAS ÇURTAY", stop: "KAHVELER (KARŞIYAKA)", order: 2 },
    { name: "POLAT ERCAN", stop: "KAHVELER (KARŞIYAKA)", order: 3 },
    { name: "EMRE DEMİRCİ", stop: "KEL MUSTAFA DURAĞI", order: 4 },
    { name: "MUSTAFA SAMURKOLLU", stop: "ERDURAN BAKKAL (KARŞIYAKA)", order: 3 },
    { name: "SEFA ÖZTÜRK", stop: "BAHÇELİEVLER", order: 6 },
    { name: "SALİH GÖZÜAK", stop: "KAHVELER (KARŞIYAKA)", order: 7 },
    { name: "SELİM ALSAÇ", stop: "SALI PAZARI", order: 8 },
    { name: "ÜMİT SAZAK", stop: "KAHVELER (KARŞIYAKA)", order: 9 },
    { name: "ÜMİT TORUN", stop: "KAHVELER (KARŞIYAKA)", order: 10 },
    { name: "KEMAL KARACA", stop: "BAHÇELİEVLER", order: 11 },
    { name: "YAŞAR ÇETİN", stop: "BAHÇELİEVLER SAĞLIK OCAĞI", order: 11 },
    { name: "MUSTAFA DOĞAN", stop: "YUVA TOKİ", order: 12 },
    { name: "CİHAN ÇELEBİ", stop: "GULLU YOLU BİM MARKET", order: 13 }
  ],
  
  "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI": [
    { name: "AHMET ÇANGA", stop: "NOKTA A-101/DOĞTAŞ", order: 1 },
    { name: "AHMET ŞAHİN", stop: "SAAT KULESİ", order: 2 },
    { name: "ALİ ÇAVUŞ BAŞTUĞ", stop: "FIRINLI CAMİ", order: 3 },
    { name: "ALİ ÖKSÜZ", stop: "SAAT KULESİ", order: 4 },
    { name: "AYNUR AYTEKİN", stop: "ÇALILIÖZ KÖPRÜ (ALT YOL)", order: 5 },
    { name: "CELAL BARAN", stop: "ÇALILIÖZ KÖPRÜ (ALT YOL)", order: 6 },
    { name: "LEVENT DURMAZ", stop: "ÇALILIÖZ KÖPRÜ (ALT YOL)", order: 9 },
    { name: "METİN ARSLAN", stop: "NAR MARKET", order: 10 },
    { name: "MUSA DOĞU", stop: "FIRINLI CAMİ", order: 11 },
    { name: "ÖMER FİLİZ", stop: "SAAT KULESİ", order: 11 },
    { name: "SADULLAH AKBAYIR", stop: "SAAT KULESİ", order: 12 },
    { name: "EYÜP ÜNVANLİ", stop: "FIRINLI CAMİ", order: 13 },
    { name: "OSMAN ÖZKİLİÇ", stop: "VALİLİK", order: 14 },
    { name: "UĞUR ALBAYRAK", stop: "SAAT KULESİ", order: 13 },
    { name: "BERAT SUSAR", stop: "VALİLİK ARKASI", order: 15 },
    { name: "HÜLUSİ EREN CAN", stop: "VALİLİK ARKASI", order: 16 },
    { name: "İBRAHİM ÜÇER", stop: "ES BENZİNLİK", order: 17 },
    { name: "SONER ÇETİN GÜRSOY", stop: "VALİLİK ARKASI", order: 18 },
    { name: "ABBAS CAN ÖNGER", stop: "BAĞDAT BENZİNLİK", order: 19 },
    { name: "MEHMET ALİ ÖZÇELİK", stop: "SAAT KULESİ", order: 19 }
  ],
  
  "ÇARŞI MERKEZ SERVİS GÜZERGAHI": [
    { name: "AHMET ÇELİK", stop: "S-OİL BENZİNLİK", order: 1 },
    { name: "BİRKAN ŞEKER", stop: "S-OİL BENZİNLİK", order: 2 },
    { name: "HİLMİ SORGUN", stop: "S-OİL BENZİNLİK", order: 3 },
    { name: "EMİR KAAN BAŞER", stop: "BAŞPINAR", order: 4 },
    { name: "MERT SÜNBÜL", stop: "TOPRAK YEMEK", order: 5 },
    { name: "MESUT TUNCER", stop: "HALİ SAHA", order: 6 },
    { name: "ALPEREN TOZLU", stop: "HALİ SAHA", order: 7 },
    { name: "VEYSEL EMRE TOZLU", stop: "HALİ SAHA", order: 8 },
    { name: "HAKAN AKPINAR", stop: "HALİ SAHA", order: 9 },
    { name: "MUHAMMED ZÜMER KEKİLLİOĞLU", stop: "HALİ SAHA", order: 10 },
    { name: "MİNE KARAOĞLU", stop: "ESKİ REKTÖRLÜK", order: 11 },
    { name: "FURKAN KADİR EDEN", stop: "REKTÖRLÜK", order: 12 },
    { name: "YUSUF GÜRBÜZ", stop: "ES BENZİNLİK", order: 13 },
    { name: "MEHMET EKTAŞ", stop: "ESKİ REKTÖRLÜK", order: 14 },
    { name: "HÜDAGÜL DEĞİRMENCİ", stop: "ESKİ REKTÖRLÜK", order: 15 },
    { name: "YASİN SAYGILI", stop: "ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ", order: 16 },
    { name: "ÇAĞRI YILDIZ", stop: "BAĞDAT KÖPRÜ", order: 17 },
    { name: "CEMAL ERAKSOY", stop: "YENİMAHALLE GO BENZİNLİK", order: 18 },
    { name: "AZİZ BUĞRA KARA", stop: "BAĞDAT KÖPRÜ VE ÜZERİ", order: 19 }
  ]
};

// İsim normalizasyon fonksiyonu
function normalizeString(str) {
  if (!str) return '';
  return str.toString()
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .trim();
}

// İsim eşleştirme fonksiyonu
function findEmployeeByName(employees, targetName) {
  const normalizedTarget = normalizeString(targetName);
  
  // Tam eşleşme
  let match = employees.find(emp => 
    normalizeString(emp.adSoyad) === normalizedTarget ||
    normalizeString(emp.firstName + ' ' + emp.lastName) === normalizedTarget
  );
  
  if (match) return match;
  
  // Kısmi eşleşme - isim ve soyisim
  const targetParts = normalizedTarget.split(' ');
  if (targetParts.length >= 2) {
    match = employees.find(emp => {
      const empNormalized = normalizeString(emp.adSoyad);
      return targetParts.every(part => empNormalized.includes(part));
    });
  }
  
  return match;
}

async function assignEmployeesToRoutes() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Tüm çalışanları getir
    console.log('👥 Çalışanlar getiriliyor...');
    const employees = await Employee.find({ 
      $or: [
        { status: 'AKTIF' },
        { durum: 'AKTIF' }
      ]
    }).lean();
    console.log(`📊 Toplam ${employees.length} aktif çalışan bulundu`);
    
    if (employees.length > 0) {
      console.log('📋 İlk birkaç çalışan örneği:');
      employees.slice(0, 3).forEach(emp => {
        console.log(`   - ${emp.adSoyad || emp.firstName + ' ' + emp.lastName} (${emp.employeeId})`);
      });
    }

    // Güzergahları getir
    console.log('🚌 Güzergahlar getiriliyor...');
    const routes = await ServiceRoute.find({ status: 'AKTIF' }).lean();
    console.log(`📊 Toplam ${routes.length} aktif güzergah bulundu`);

    let totalAssigned = 0;
    let totalNotFound = 0;
    const notFoundEmployees = [];

    // Her güzergah için çalışanları ata
    for (const [routeName, passengers] of Object.entries(routePassengerData)) {
      console.log(`\n🚌 İşleniyor: ${routeName}`);
      
      // Güzergahı bul
      const route = routes.find(r => r.routeName === routeName);
      if (!route) {
        console.log(`❌ Güzergah bulunamadı: ${routeName}`);
        continue;
      }

      let routeAssigned = 0;
      let routeNotFound = 0;

      for (const passenger of passengers) {
        const employee = findEmployeeByName(employees, passenger.name);
        
        if (employee) {
          try {
            // Çalışanı güncelle
            await Employee.findByIdAndUpdate(employee._id, {
              'serviceInfo.usesService': true,
              'serviceInfo.routeName': routeName,
              'serviceInfo.stopName': passenger.stop,
              'serviceInfo.orderNumber': passenger.order,
              // Eski alanları da güncelle (backward compatibility)
              servisGuzergahi: routeName,
              durak: passenger.stop
            });

            console.log(`✅ ${passenger.name} -> ${passenger.stop} (${passenger.order})`);
            routeAssigned++;
            totalAssigned++;
          } catch (error) {
            console.log(`❌ Güncelleme hatası ${passenger.name}: ${error.message}`);
          }
        } else {
          console.log(`❌ Bulunamadı: ${passenger.name}`);
          notFoundEmployees.push({
            routeName,
            name: passenger.name,
            stop: passenger.stop
          });
          routeNotFound++;
          totalNotFound++;
        }
      }

      console.log(`📊 ${routeName}: ${routeAssigned} atandı, ${routeNotFound} bulunamadı`);
    }

    console.log(`\n🎯 ÖZET:`);
    console.log(`✅ Toplam atanan: ${totalAssigned}`);
    console.log(`❌ Toplam bulunamayan: ${totalNotFound}`);

    if (notFoundEmployees.length > 0) {
      console.log(`\n❌ Bulunamayan çalışanlar:`);
      notFoundEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.routeName})`);
      });
    }

    console.log('\n✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  assignEmployeesToRoutes();
}

module.exports = { assignEmployeesToRoutes }; 