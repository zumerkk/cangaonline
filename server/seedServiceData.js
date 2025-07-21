const mongoose = require('mongoose');
const ServiceRoute = require('./models/ServiceRoute');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Atlas bağlantısı - Environment variable zorunlu
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable tanımlanmamış!');
  console.error('🔧 .env dosyasında MongoDB Atlas connection string\'ini ekleyin');
  process.exit(1);
}

// MongoDB Atlas bağlantısı
mongoose.connect(mongoURI)
.then(() => {
  console.log('✅ MongoDB bağlantısı başarılı!');
  seedServiceData();
})
.catch((error) => {
  console.error('❌ MongoDB bağlantı hatası:', error);
});

// Excel'deki servis güzergah verilerini sisteme yükle
async function seedServiceData() {
  try {
    console.log('🚌 Servis güzergah verileri yükleniyor...');

    // Önce mevcut verileri temizle
    await ServiceRoute.deleteMany({});
    console.log('Eski veriler temizlendi');

    // Excel'deki güzergahları oluştur
    const serviceRoutes = [
      {
        routeName: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
        routeCode: 'CARSI_MERKEZ',
        color: '#1976d2',
        stops: [
          { name: 'MERSAN', order: 1 },
          { name: 'ERGENEKON SİTESİ', order: 2 },
          { name: 'TRAFİK EĞİTİM YOLU', order: 3 },
          { name: 'HALI SAHA', order: 4 },
          { name: 'TOPRAK YEMEK', order: 5 },
          { name: 'BAŞPINAR İTFAİYE KARŞISI', order: 6 },
          { name: 'S-OİL BENZİNLİK', order: 7 },
          { name: 'AYTEMİZ BENZİNLİK', order: 8 },
          { name: 'SANAYİ DEMİRCİLER', order: 9 },
          { name: 'İŞKUR', order: 10 },
          { name: 'ES BENZİNLİK (KIRGAZ)', order: 11 },
          { name: 'BELEDİYE TERMİNAL', order: 12 },
          { name: 'PTT', order: 13 },
          { name: 'İSTASYON', order: 14 },
          { name: 'ESKİ REKTÖRLÜK', order: 15 },
          { name: 'BAĞDAT KÖPRÜ', order: 16 },
          { name: 'FABRİKA', order: 17 }
        ],
        schedule: [
          { timeSlot: '08:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '15:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '16:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '19:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '20:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '23:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '00:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '21:00 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true }
        ],
        createdBy: 'System',
        status: 'AKTIF'
      },

      {
        routeName: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
        routeCode: 'CALILIOZ',
        color: '#388e3c',
        stops: [
          { name: 'ÇOCUK ŞUBE (ESKİ BÖLGE TRAFİK) ALTI NAR MARKET', order: 1 },
          { name: 'TAÇ MAHAL DÜĞÜN SALONU', order: 2 },
          { name: 'SÜMEZE PİDE', order: 3 },
          { name: 'ÇALILIÖZ KÖPRÜ ALTI', order: 4 },
          { name: 'FIRINLI CAMİ', order: 5 },
          { name: 'SAAT KULESİ', order: 6 },
          { name: 'ADLİYE BİNASI ARKA YOL', order: 7 },
          { name: 'ŞOK MARKET', order: 8 },
          { name: 'VALİLİK ARKA GİRİŞ KAPISI ÖNÜ', order: 9 },
          { name: 'ESKİ REKTÖRLÜK', order: 10 },
          { name: 'BAĞDAT KÖPRÜ', order: 11 },
          { name: 'FABRİKA', order: 12 }
        ],
        schedule: [
          { timeSlot: '08:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '15:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '16:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '19:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '20:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '23:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true }
        ],
        createdBy: 'System',
        status: 'AKTIF'
      },

      {
        routeName: 'OSMANGAZI-KARŞIYAKA MAHALLESİ',
        routeCode: 'OSMANGAZI_KARSIYAKA',
        color: '#f57c00',
        stops: [
          { name: 'BAHÇELİEVLER ESKİ TERMİNAL GİRİŞİ', order: 1 },
          { name: 'AYBIMAŞ', order: 2 },
          { name: 'BAHÇELİEVLER SAĞLIK OCAĞI', order: 3 },
          { name: 'ORTAKLAR MARKET', order: 4 },
          { name: 'SALI PAZARI (KARŞIYAKA)', order: 5 },
          { name: 'KAHVELER (KARŞIYAKA)', order: 6 },
          { name: 'AHLİLİ BİLET GİŞESİ', order: 7 },
          { name: 'ŞEMA KOLEJİ', order: 8 },
          { name: 'FABRİKA', order: 9 }
        ],
        schedule: [
          { timeSlot: '08:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '15:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '16:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '19:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true }
        ],
        createdBy: 'System',
        status: 'AKTIF'
      },

      {
        routeName: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
        routeCode: 'SANAYI',
        color: '#d32f2f',
        stops: [
          { name: 'RASATTEPE KÖPRÜ', order: 1 },
          { name: 'ÇORBACI ALİ DAYI', order: 2 },
          { name: 'NOKTA A101', order: 3 },
          { name: 'ÇALILIÖZ KÖPRÜ ÜSTÜ', order: 4 },
          { name: 'ÇOCUK ŞUBE (ESKİ BÖLGE TRAFİK) KARŞISI', order: 5 },
          { name: 'ESKİ HİLAL HASTANESİ ÖNÜ', order: 6 },
          { name: 'PODİUM AVM KAVŞAK', order: 7 },
          { name: 'MEZARLIKLAR', order: 8 },
          { name: 'BAĞDAT KÖPRÜ', order: 9 },
          { name: 'FABRİKA', order: 10 }
        ],
        schedule: [
          { timeSlot: '08:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '15:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '16:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '19:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true }
        ],
        createdBy: 'System',
        status: 'AKTIF'
      },

      {
        routeName: 'DİSPANSER SERVİS GÜZERGAHI',
        routeCode: 'DISPANSER',
        color: '#7b1fa2',
        stops: [
          { name: 'DİSPANSER', order: 1 },
          { name: 'ŞADIRVAN (PERŞEMBE PAZARI)', order: 2 },
          { name: 'MOTOSİKLET TAMİRCİLERİ', order: 3 },
          { name: 'GÜL PASTANESİ', order: 4 },
          { name: 'BELEDİYE OTOBÜS DURAKLARI', order: 5 },
          { name: 'TİCARET ODASI', order: 6 },
          { name: 'PTT', order: 7 },
          { name: 'ESKİ REKTÖRLÜK', order: 8 },
          { name: 'BAĞDAT KÖPRÜ', order: 9 },
          { name: 'FABRİKA', order: 10 }
        ],
        schedule: [
          { timeSlot: '08:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '15:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true },
          { timeSlot: '16:15 FABRİKA ÇIKIŞ', direction: 'FABRİKADAN', isActive: true },
          { timeSlot: '19:30 FABRİKA GELİŞ', direction: 'FABRİKAYA', isActive: true }
        ],
        createdBy: 'System',
        status: 'AKTIF'
      }
    ];

    // Güzergahları kaydet
    for (const routeData of serviceRoutes) {
      const route = new ServiceRoute(routeData);
      await route.save();
      console.log(`✅ ${route.routeName} güzergahı oluşturuldu`);
    }

    console.log(`
🎉 Servis güzergahları başarıyla yüklendi!
📊 Toplam güzergah sayısı: ${serviceRoutes.length}
🚌 Sistemde şu güzergahlar mevcut:
- ÇARŞI MERKEZ SERVİS GÜZERGAHI (17 durak)
- ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI (18 durak)  
- OSMANGAZI-KARŞIYAKA MAHALLESİ (12 durak)
- SANAYİ MAHALLESİ SERVİS GÜZERGAHI (18 durak)
- DİSPANSER SERVİS GÜZERGAHI (10 durak)

🔧 Şimdi çalışanların servis bilgilerini güncelleyebilirsiniz!
    `);

    process.exit(0);

  } catch (error) {
    console.error('❌ Servis verileri yükleme hatası:', error);
    process.exit(1);
  }
} 