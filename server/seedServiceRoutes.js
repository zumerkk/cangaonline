const mongoose = require('mongoose');
const ServiceRoute = require('./models/ServiceRoute');
const Employee = require('./models/Employee');

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga';

// Excel'deki servis güzergahları verisi - Güncel veriler
const serviceRoutesData = [
  {
    routeName: "DİSPANSER SERVİS GÜZERGAHI",
    routeCode: "DSG-01",
    color: "#1976d2",
    status: "AKTIF",
    stops: [
      { name: "DİSPANSER", order: 1 },
      { name: "SADIRVAN (PERŞEMBE PAZARI)", order: 2 },
      { name: "MOTOSİKLET TAMİRCİLERİ", order: 3 },
      { name: "GÜL PASTANESİ", order: 4 },
      { name: "BELEDİYE OTOBÜS DURAKLARI", order: 5 },
      { name: "TİCARET ODASI", order: 6 },
      { name: "PTT", order: 7 },
      { name: "ESKİ REKTÖRLÜK", order: 8 },
      { name: "BAĞDAT KÖPRÜ", order: 9 },
      { name: "FABRİKA", order: 10 }
    ],
    passengers: [
      { name: "ALİ GÜRBÜZ", stopName: "SADIRVAN (PERŞEMBE PAZARI)", orderNumber: 1 },
      { name: "ALİ SAVAŞ", stopName: "NOKTA A-101/DOĞTAŞ", orderNumber: 2 },
      { name: "BERAT ÖZDEN", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 3 },
      { name: "CEVDET ÖKSÜZ", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 4 },
      { name: "ERDAL YAKUT", stopName: "GÜL PASTANESİ", orderNumber: 5 },
      { name: "EYÜP TORUN", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 6 },
      { name: "İBRAHİM VARLIOĞLU", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 7 },
      { name: "MUHAMMED SEFA PEHLİVANLI", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 8 },
      { name: "MURAT ÇAVDAR", stopName: "SADIRVAN (PERŞEMBE PAZARI)", orderNumber: 9 },
      { name: "MUSTAFA BIYIK", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 10 },
      { name: "ÖZKAN AYDIN", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 12 },
      { name: "CELAL GÜLŞEN", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 13 },
      { name: "MUHAMMED NAZİM GÖÇ", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 14 },
      { name: "TUNCAY TEKİN", stopName: "DİSPANSER ÜST GEÇİT", orderNumber: 15 }
    ]
  },
  {
    routeName: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI",
    routeCode: "SMG-02",
    color: "#388e3c",
    status: "AKTIF",
    stops: [
      { name: "RASATTEPE KÖPRÜ", order: 1 },
      { name: "ÇORBACI ALİ DAYI", order: 2 },
      { name: "NOKTA A101", order: 3 },
      { name: "ÇALILIÖZ KÖPRÜ ÜSTÜ", order: 4 },
      { name: "ÇOCUK ŞUBE (ESKİ BÖLGE TRAFİK) KARŞISI", order: 5 },
      { name: "ESKİ HİLAL HASTANESİ ÖNÜ", order: 6 },
      { name: "PODİUM AVM KAVŞAK", order: 7 },
      { name: "MEZARLIKLAR", order: 8 },
      { name: "BAĞDAT KÖPRÜ", order: 9 },
      { name: "FABRİKA", order: 10 }
    ],
    passengers: [
      { name: "ALİ ŞIH YORULMAZ", stopName: "ÇORBACI ALİ DAYI", orderNumber: 1 },
      { name: "AHMET DURAN TUNA", stopName: "NOKTA A-101/DOĞTAŞ", orderNumber: 2 },
      { name: "FATİH BALOĞLU", stopName: "ÇORBACI ALİ DAYI", orderNumber: 4 },
      { name: "HAKKİ YÜCEL", stopName: "ÇORBACI ALİ DAYI", orderNumber: 5 },
      { name: "HAYATİ SÖZDİNLER", stopName: "ÇORBACI ALİ DAYI", orderNumber: 6 },
      { name: "HAYDAR ACAR", stopName: "RASATTEPE KÖPRÜ", orderNumber: 7 },
      { name: "GÜLNUR AĞIRMAN", stopName: "AYTEMİZ PETROL", orderNumber: 7 },
      { name: "İSMET BAŞER", stopName: "AYTEMİZ PETROL", orderNumber: 8 },
      { name: "KEMALETTİN GÜLEŞEN", stopName: "RASATTEPE KÖPRÜ", orderNumber: 9 },
      { name: "MACİT USLU", stopName: "ÇORBACI ALİ DAYI", orderNumber: 10 },
      { name: "MUSTAFA SÜMER", stopName: "RASATTEPE KÖPRÜ", orderNumber: 11 },
      { name: "NİYAZİ YURTSEVEN", stopName: "NOKTA A-101", orderNumber: 12 },
      { name: "BERAT AKTAŞ", stopName: "NOKTA A-101", orderNumber: 13 },
      { name: "NURİ ÖZKAN", stopName: "ÇORBACI ALİ DAYI", orderNumber: 14 },
      { name: "MUSTAFA BAŞKAYA", stopName: "ÇORBACI ALİ DAYI", orderNumber: 16 },
      { name: "MUZAFFER KIZILÇIÇEK", stopName: "MEZARLIK PEYZAJ ÖNÜ", orderNumber: 17 }
    ]
  },
  {
    routeName: "OSMANGAZİ-KARŞIYAKA MAHALLESİ",
    routeCode: "OKM-03",
    color: "#f57c00",
    status: "AKTIF",
    stops: [
      { name: "BAHÇELİEVLER ESKİ TERMİNAL GİRİŞİ", order: 1 },
      { name: "AYBIMAŞ", order: 2 },
      { name: "BAHÇELİEVLER SAĞLIK OCAĞI", order: 3 },
      { name: "ORTAKLAR MARKET", order: 4 },
      { name: "SALI PAZARI (KARŞIYAKA)", order: 5 },
      { name: "KAHVELER (KARŞIYAKA)", order: 6 },
      { name: "AHİLİ BİLET GİŞESİ", order: 7 },
      { name: "ŞEMA KOLEJİ", order: 8 },
      { name: "FABRİKA", order: 9 }
    ],
    passengers: [
      { name: "ASIM DEMET", stopName: "SALI PAZARI", orderNumber: 1 },
      { name: "İLYAS CURTAY", stopName: "KAHVELER (KARŞIYAKA)", orderNumber: 2 },
      { name: "POLAT ERCAN", stopName: "KAHVELER (KARŞIYAKA)", orderNumber: 3 },
      { name: "EMRE DEMİRCİ", stopName: "KEL MUSTAFA DUĞRĞI", orderNumber: 4 },
      { name: "MUSTAFA SAMURKOLLU", stopName: "ERDURAN BAKKAL (KARŞIYAKA)", orderNumber: 3 },
      { name: "SEFA ÖZTÜRK", stopName: "BAHÇELİEVLER", orderNumber: 6 },
      { name: "SALİH GÖZÜAK", stopName: "KAHVELER (KARŞIYAKA)", orderNumber: 7 },
      { name: "SELİM ALSAÇ", stopName: "SALI PAZARI", orderNumber: 8 },
      { name: "ÜMİT SAZAK", stopName: "KAHVELER (KARŞIYAKA)", orderNumber: 9 },
      { name: "ÜMİT TORUN", stopName: "KAHVELER (KARŞIYAKA)", orderNumber: 10 },
      { name: "KEMAL KARACA", stopName: "BAHÇELİEVLER", orderNumber: 11 },
      { name: "YAŞAR ÇETİN", stopName: "BAHÇELİEVLER SAĞLIK OCAĞI", orderNumber: 11 },
      { name: "MUSTAFA DOĞAN", stopName: "YUVA TOKİ", orderNumber: 12 },
      { name: "CİHAN ÇELEBİ", stopName: "ÇULLU YOLU BİM MARKET", orderNumber: 13 }
    ]
  },
  {
    routeName: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI",
    routeCode: "CMG-04",
    color: "#d32f2f",
    status: "AKTIF",
    stops: [
      { name: "ÇOCUK ŞUBE (ESKİ BÖLGE TRAFİK) ALTI NAR MARKET", order: 1 },
      { name: "TAÇ MAHAL DÜĞÜN SALONU", order: 2 },
      { name: "SÜMEZE PİDE", order: 3 },
      { name: "ÇALILIÖZ KÖPRÜ ALTI", order: 4 },
      { name: "FIRINLI CAMİ", order: 5 },
      { name: "SAAT KULESİ", order: 6 },
      { name: "ADLİYE BİNASI ARKA YOL", order: 7 },
      { name: "ŞOK MARKET", order: 8 },
      { name: "VALİLİK ARKA GİRİŞ KAPISI ÖNÜ", order: 9 },
      { name: "ESKİ REKTÖRLÜK", order: 10 },
      { name: "BAĞDAT KÖPRÜ", order: 11 },
      { name: "FABRİKA", order: 12 }
    ],
    passengers: [
      { name: "AHMET ÇANGA", stopName: "NOKTA A-101/DOĞTAŞ", orderNumber: 1 },
      { name: "AHMET ŞAHİN", stopName: "SAAT KULESİ", orderNumber: 2 },
      { name: "ALİ ÇAVUŞ BAŞTUĞ", stopName: "FIRINLI CAMİ", orderNumber: 3 },
      { name: "ALİ ÖKSÜZ", stopName: "SAAT KULESİ", orderNumber: 4 },
      { name: "AYNUR AYTEKİN", stopName: "ÇALILIÖZ KÖPRÜ (ALT YOL)", orderNumber: 5 },
      { name: "CELAL BARAN", stopName: "ÇALILIÖZ KÖPRÜ (ALT YOL)", orderNumber: 6 },
      { name: "LEVENT DURMAZ", stopName: "ÇALILIÖZ KÖPRÜ (ALT YOL)", orderNumber: 9 },
      { name: "METİN ARSLAN", stopName: "NAR MARKET", orderNumber: 10 },
      { name: "MUSA DOĞU", stopName: "FIRINLI CAMİ", orderNumber: 11 },
      { name: "ÖMER FİLİZ", stopName: "SAAT KULESİ", orderNumber: 11 },
      { name: "SADULLAH AKBAYIR", stopName: "SAAT KULESİ", orderNumber: 12 },
      { name: "EYÜP ÜNVANLI", stopName: "FIRINLI CAMİ", orderNumber: 13 },
      { name: "OSMAN ÖZKİLİÇ", stopName: "VALİLİK", orderNumber: 14 },
      { name: "UĞUR ALBAYRAK", stopName: "SAAT KULESİ", orderNumber: 13 },
      { name: "BERAT SUSAR", stopName: "VALİLİK ARKASI", orderNumber: 15 },
      { name: "HÜLUSİ EREN CAN", stopName: "VALİLİK ARKASI", orderNumber: 16 },
      { name: "İBRAHİM ÜÇER", stopName: "ES BENZİNLİK", orderNumber: 17 },
      { name: "SONER ÇETİN GÜRSOY", stopName: "VALİLİK ARKASI", orderNumber: 18 },
      { name: "ABBAS CAN ÖNGER", stopName: "BAĞDAT BENZİNLİK", orderNumber: 19 },
      { name: "MEHMET ALİ ÖZÇELİK", stopName: "SAAT KULESİ", orderNumber: 19 }
    ]
  },
  {
    routeName: "ÇARŞI MERKEZ SERVİS GÜZERGAHI",
    routeCode: "CMG-05",
    color: "#7b1fa2",
    status: "AKTIF",
    stops: [
      { name: "MERSAN", order: 1 },
      { name: "ERGENEKON SİTESİ", order: 2 },
      { name: "TRAFİK EĞİTİM YOLU", order: 3 },
      { name: "HALİ SAHA", order: 4 },
      { name: "TOPRAK YEMEK", order: 5 },
      { name: "BAŞPINAR İTFAİYE KARŞISI", order: 6 },
      { name: "S-OİL BENZİNLİK", order: 7 },
      { name: "AYTEMİZ BENZİNLİK", order: 8 },
      { name: "SANAYİ DEMİRCİLER", order: 9 },
      { name: "İŞKUR", order: 10 },
      { name: "ES BENZİNLİK (KIRGAZ)", order: 11 },
      { name: "BELEDİYE TERMİNAL", order: 12 },
      { name: "PTT", order: 13 },
      { name: "İSTASYON", order: 14 },
      { name: "ESKİ REKTÖRLÜK", order: 15 },
      { name: "BAĞDAT KÖPRÜ", order: 16 },
      { name: "FABRİKA", order: 17 }
    ],
    passengers: [
      { name: "AHMET ÇELİK", stopName: "S-OİL BENZİNLİK", orderNumber: 1 },
      { name: "BİRKAN ŞEKER", stopName: "S-OİL BENZİNLİK", orderNumber: 2 },
      { name: "HİLMİ SORGUN", stopName: "S-OİL BENZİNLİK", orderNumber: 3 },
      { name: "EMİR KAAN BAŞER", stopName: "BAŞPINAR", orderNumber: 4 },
      { name: "MERT SÜNBÜL", stopName: "TOPRAK YEMEK", orderNumber: 5 },
      { name: "MESUT TUNCER", stopName: "HALİ SAHA", orderNumber: 6 },
      { name: "ALPEREN TOZLU", stopName: "HALİ SAHA", orderNumber: 7 },
      { name: "VEYSEL EMRE TOZLU", stopName: "HALİ SAHA", orderNumber: 8 },
      { name: "HAKAN AKPINAR", stopName: "HALİ SAHA", orderNumber: 9 },
      { name: "MUHAMMED ZÜMER KEKİLLİOĞLU", stopName: "HALİ SAHA", orderNumber: 10 },
      { name: "MİNE KARAOĞLU", stopName: "ESKİ REKTÖRLÜK", orderNumber: 11 },
      { name: "FURKAN KADİR EDEN", stopName: "REKTÖRLÜK", orderNumber: 12 },
      { name: "YUSUF GÜRBÜZ", stopName: "ES BENZİNLİK", orderNumber: 13 },
      { name: "MEHMET EKTAŞ", stopName: "ESKİ REKTÖRLÜK", orderNumber: 14 },
      { name: "HÜDAGÜL DEĞİRMENCİ", stopName: "ESKİ REKTÖRLÜK", orderNumber: 15 },
      { name: "YASİN SAYGİLİ", stopName: "ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ", orderNumber: 16 },
      { name: "ÇAĞRI YILDIZ", stopName: "BAĞDAT KÖPRÜ", orderNumber: 17 },
      { name: "CEMAL ERAKSOY", stopName: "YENİ MAHALLE GO BENZİNLİK", orderNumber: 18 },
      { name: "AZİZ BUĞRA KARA", stopName: "BAĞDAT KÖPRÜ VE ÜZERİ", orderNumber: 19 }
    ]
  }
];

// Kendi araçlarıyla gelen çalışanlar - özel işlem
const ownCarEmployees = [
  "AHMET İLGİN",
  "BAHADIR AKKUL", 
  "BATUHAN İLHAN",
  "BİLAL CEVİZOĞLU",
  "BURCU KARAKOÇ",
  "ERDEM KAMİL YILDIRIM",
  "İRFAN KIRAÇ",
  "KAMİL BATUHAN BEYGO",
  "MEHMET KEMAL İNAÇ",
  "MURAT GENCER",
  "MURAT GÜRBÜZ",
  "MURAT SEPETÇİ",
  "ORHAN YORULMAZ",
  "SERKAN GÜLEŞEN",
  "ÜMİT DEMİREL",
  "BERKAN BULANIK (BAHÇILI)",
  "SÜLEYMAN GÖZÜAK (YENİŞEHİR)"
];

async function seedServiceRoutes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Önce tüm çalışanların servis bilgilerini temizle
    await Employee.updateMany(
      {},
      {
        $unset: {
          'serviceInfo.usesService': 1,
          'serviceInfo.routeName': 1,
          'serviceInfo.stopName': 1,
          'serviceInfo.orderNumber': 1
        }
      }
    );
    console.log('🧹 Tüm çalışanların servis bilgileri temizlendi');

    // Mevcut güzergahları temizle
    await ServiceRoute.deleteMany({});
    console.log('🗑️ Mevcut güzergahlar temizlendi');

    let totalPassengerCount = 0;
    let foundPassengerCount = 0;
    let notFoundPassengers = [];

    // Yeni güzergahları ekle
    for (const routeData of serviceRoutesData) {
      const { passengers, ...routeInfo } = routeData;
      
      // Güzergahı oluştur
      const route = new ServiceRoute({
        ...routeInfo,
        schedule: [
          { time: "07:30", isActive: true },
          { time: "16:30", isActive: true }
        ],
        statistics: {
          totalEmployees: passengers.length,
          activeEmployees: passengers.length
        }
      });

      await route.save();
      console.log(`\n🚌 ${routeData.routeName} güzergahı eklendi`);
      console.log(`   📍 ${routeData.stops.length} durak, ${passengers.length} yolcu`);

      // Çalışanları güncelle - Excel'deki isimlerle eşleştir
      for (const passenger of passengers) {
        totalPassengerCount++;
        
        // Çalışanı bul ve servis bilgilerini güncelle
        const employee = await Employee.findOneAndUpdate(
          {
            adSoyad: { $regex: new RegExp(`^${passenger.name.trim()}$`, 'i') },
            durum: 'AKTIF'
          },
          {
            $set: {
              'serviceInfo.usesService': true,
              'serviceInfo.routeName': routeData.routeName,
              'serviceInfo.stopName': passenger.stopName,
              'serviceInfo.orderNumber': passenger.orderNumber
            }
          },
          { new: true }
        );

        if (employee) {
          foundPassengerCount++;
          console.log(`     ✅ ${passenger.name} -> ${passenger.stopName} (#${passenger.orderNumber})`);
        } else {
          notFoundPassengers.push({
            name: passenger.name,
            route: routeData.routeName,
            stop: passenger.stopName
          });
          console.log(`     ❌ ${passenger.name} çalışanı bulunamadı`);
        }
      }
    }

    // Kendi araçlarıyla gelen çalışanları işaretle
    console.log('\n🚗 Kendi Araçlarıyla Gelen Çalışanlar:');
    let ownCarCount = 0;
    for (const employeeName of ownCarEmployees) {
      const employee = await Employee.findOneAndUpdate(
        {
          adSoyad: { $regex: new RegExp(`^${employeeName.trim()}$`, 'i') },
          durum: 'AKTIF'
        },
        {
          $set: {
            'serviceInfo.usesService': false,
            'serviceInfo.routeName': 'KENDİ ARACI',
            'serviceInfo.stopName': 'KENDİ ARACI İLE GELİYOR',
            'serviceInfo.orderNumber': 0
          }
        },
        { new: true }
      );

      if (employee) {
        ownCarCount++;
        console.log(`     🚗 ${employeeName} -> Kendi aracı ile geliyor`);
      } else {
        console.log(`     ❌ ${employeeName} çalışanı bulunamadı`);
      }
    }

    // Sonuç raporu
    console.log('\n📊 SEED İŞLEMİ TAMAMLANDI');
    console.log('=' * 50);
    console.log(`🚌 Toplam ${serviceRoutesData.length} güzergah oluşturuldu`);
    console.log(`👥 Toplam ${totalPassengerCount} yolcu işlendi`);
    console.log(`✅ ${foundPassengerCount} yolcu başarıyla atandı`);
    console.log(`🚗 ${ownCarCount} çalışan kendi aracı olarak işaretlendi`);
    console.log(`❌ ${notFoundPassengers.length} yolcu bulunamadı`);
    
    if (notFoundPassengers.length > 0) {
      console.log('\n❌ BULUNAMAYAN YOLCULAR:');
      notFoundPassengers.forEach(p => {
        console.log(`   - ${p.name} (${p.route})`);
      });
    }

    // Başarı oranı
    const successRate = ((foundPassengerCount / totalPassengerCount) * 100).toFixed(1);
    console.log(`\n🎯 Başarı Oranı: %${successRate}`);

  } catch (error) {
    console.error('❌ Seed hatası:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  seedServiceRoutes();
}

module.exports = { seedServiceRoutes }; 