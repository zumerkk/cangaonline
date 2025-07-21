const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Ortam değişkenlerini yükle (.env kök dizinde ise)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Employee = require('./models/Employee');

// MongoDB bağlantı URI'si (.env'de MONGO_URI varsa kullan, yoksa local)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canga';

// -------------------------
// 🚍 VERİ SETİ TANIMI
// -------------------------
// Her servis adı (routeName) için yolcu listesi
// Not: orderNumber boş bırakılmışsa 0 olarak kaydedilir.
const routePassengersMap = {
  'DİSPANSER': [
    { fullName: 'ALİ GÜRBÜZ', stopName: 'ŞADIRVAN (PERŞEMBE PAZARI)', orderNumber: 1 },
    { fullName: 'ALİ SAVAŞ', stopName: 'NOKTA A-101/DOĞTAŞ', orderNumber: 2 },
    { fullName: 'BERAT ÖZDEN', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 3 },
    { fullName: 'CEVCET ÖKSÜZ', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 4 },
    { fullName: 'ERDAL YAKUT', stopName: 'GÜL PASTANESİ', orderNumber: 5 },
    { fullName: 'EYÜP TORUN', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 6 },
    { fullName: 'İBRAHİM VARLIOĞLU', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 7 },
    { fullName: 'MUHAMMED SEFA PEHLİVANLI', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 8 },
    { fullName: 'MURAT ÇAVDAR', stopName: 'ŞADIRVAN (PERŞEMBE PAZARI)', orderNumber: 9 },
    { fullName: 'MUSTAFA BIYIK', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 10 },
    { fullName: 'ÖZKAN AYDIN', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 12 },
    { fullName: 'CELAL GÜLŞEN', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 13 },
    { fullName: 'MUHAMMED NAZİM GÖÇ', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 14 },
    { fullName: 'TUNCAY TEKİN', stopName: 'DİSPANSER ÜST GEÇİT', orderNumber: 15 },
  ],
  'SANAYİ MAHALLESİ': [
    { fullName: 'ALİ ŞIH YORULMAZ', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 1 },
    { fullName: 'AHMET DURAN TUNA', stopName: 'NOKTA A-101/DOĞTAŞ', orderNumber: 2 },
    { fullName: 'FATİH BALOĞLU', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 4 },
    { fullName: 'HAKKI YÜCEL', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 5 },
    { fullName: 'HAYATİ SÖZDİNLER', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 6 },
    { fullName: 'HAYDAR ACAR', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 7 },
    { fullName: 'GÜLNUR AĞIRMAN', stopName: 'AYTEMİZ PETROL', orderNumber: 0 },
    { fullName: 'İSMET BAŞER', stopName: 'AYTEMİZ PETROL', orderNumber: 8 },
    { fullName: 'KEMALETTİN GÜLEŞEN', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 9 },
    { fullName: 'MACİT USLU', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 10 },
    { fullName: 'MUSTAFA SÜMER', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 11 },
    { fullName: 'NİYAZİ YURTSEVEN', stopName: 'NOKTA A-101', orderNumber: 12 },
    { fullName: 'BERAT AKTAŞ', stopName: 'NOKTA A-101', orderNumber: 13 },
    { fullName: 'NURİ ÖZKAN', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 14 },
    { fullName: 'MUSTAFA BAŞKAYA', stopName: 'ÇORBACI ALİ DAYI', orderNumber: 16 },
    { fullName: 'MUZAFFER KIZILÇİÇEK', stopName: 'MEZARLIK PEYZAJ ÖNÜ', orderNumber: 17 },
  ],
  'OSMANGAZİ-KARŞIYAKA MAHALLESİ': [
    { fullName: 'ASIM DEMET', stopName: 'SALI PAZARI', orderNumber: 1 },
    { fullName: 'İLYAS CURTAY', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 2 },
    { fullName: 'POLAT ERCAN', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 0 },
    { fullName: 'EMRE DEMİRCİ', stopName: 'KEL MUSTAFA DURAĞI', orderNumber: 0 },
    { fullName: 'MUSTAFA SAMURKOLLU', stopName: 'ERDURAN BAKKAL (KARŞIYAKA)', orderNumber: 3 },
    { fullName: 'SEFA ÖZTÜRK', stopName: 'BAHÇELİEVLER', orderNumber: 6 },
    { fullName: 'SALİH GÖZÜAK', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 7 },
    { fullName: 'SELİM ALSAÇ', stopName: 'SALI PAZARI', orderNumber: 8 },
    { fullName: 'ÜMİT SAZAK', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 9 },
    { fullName: 'ÜMİT TORUN', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 10 },
    { fullName: 'KEMAL KARACA', stopName: 'BAHÇELİEVLER', orderNumber: 0 },
    { fullName: 'YAŞAR ÇETİN', stopName: 'BAHÇELİEVLER SAĞLIK OCAĞI', orderNumber: 11 },
    { fullName: 'MUSTAFA DOĞAN', stopName: 'YUVA TOKİ', orderNumber: 0 },
    { fullName: 'CİHAN ÇELEBİ', stopName: 'ÇULLU YOLU BİM MARKET', orderNumber: 0 },
  ],
  'ÇALILIÖZ MAHALLESİ': [
    { fullName: 'AHMET ÇANGA', stopName: 'NOKTA A-101/DOĞTAŞ', orderNumber: 1 },
    { fullName: 'AHMET ŞAHİN', stopName: 'SAAT KULESİ', orderNumber: 2 },
    { fullName: 'ALİ ÇAVUŞ BAŞTUĞ', stopName: 'FIRINLI CAMİ', orderNumber: 3 },
    { fullName: 'ALİ ÖKSÜZ', stopName: 'SAAT KULESİ', orderNumber: 4 },
    { fullName: 'AYNUR AYTEKİN', stopName: 'ÇALLIÖZ KÖPRÜ (ALT YOL)', orderNumber: 5 },
    { fullName: 'CELAL BARAN', stopName: 'ÇALLIÖZ KÖPRÜ (ALT YOL)', orderNumber: 6 },
    { fullName: 'LEVENT DURMAZ', stopName: 'ÇALLIÖZ KÖPRÜ (ALT YOL)', orderNumber: 9 },
    { fullName: 'METİN ARSLAN', stopName: 'NAR MARKET', orderNumber: 10 },
    { fullName: 'MUSA DOĞU', stopName: 'FIRINLI CAMİ', orderNumber: 0 },
    { fullName: 'ÖMER FİLİZ', stopName: 'SAAT KULESİ', orderNumber: 11 },
    { fullName: 'SADULLAH AKBAYIR', stopName: 'SAAT KULESİ', orderNumber: 12 },
    { fullName: 'EYÜP ÜNVANLI', stopName: 'FIRINLI CAMİ', orderNumber: 0 },
    { fullName: 'OSMAN ÖZKILIÇ', stopName: 'VALİLİK', orderNumber: 0 },
    { fullName: 'UĞUR ALBAYRAK', stopName: 'SAAT KULESİ', orderNumber: 13 },
    { fullName: 'BERAT SUSAR', stopName: 'VALİLİK ARKASI', orderNumber: 15 },
    { fullName: 'HULUSİ EREN CAN', stopName: 'VALİLİK ARKASI', orderNumber: 16 },
    { fullName: 'İBRAHİM ÜÇER', stopName: 'ES BENZİNLİK', orderNumber: 17 },
    { fullName: 'SONER ÇETİN GÜRSOY', stopName: 'VALİLİK ARKASI', orderNumber: 18 },
    { fullName: 'ABBAS CAN ÖNGER', stopName: 'BAĞDAT BENZİNLİK', orderNumber: 0 },
    { fullName: 'MEHMET ALİ ÖZÇELİK', stopName: 'SAAT KULESİ', orderNumber: 19 },
  ],
  'ÇARŞI MERKEZ': [
    { fullName: 'AHMET ÇELİK', stopName: 'S-OİL BENZİNLİK', orderNumber: 1 },
    { fullName: 'BİRKAN ŞEKER', stopName: 'S-OİL BENZİNLİK', orderNumber: 2 },
    { fullName: 'HİLMİ SORGUN', stopName: 'S-OİL BENZİNLİK', orderNumber: 3 },
    { fullName: 'EMİR KAAN BAŞER', stopName: 'BAŞPINAR', orderNumber: 4 },
    { fullName: 'MERT SÜNBÜL', stopName: 'TOPRAK YEMEK', orderNumber: 5 },
    { fullName: 'MESUT TUNCER', stopName: 'HALI SAHA', orderNumber: 6 },
    { fullName: 'ALPEREN TOZLU', stopName: 'HALI SAHA', orderNumber: 7 },
    { fullName: 'VEYSEL EMRE TOZLU', stopName: 'HALI SAHA', orderNumber: 8 },
    { fullName: 'HAKAN AKPINAR', stopName: 'HALI SAHA', orderNumber: 0 },
    { fullName: 'MUHAMMED ZÜMER KEKİLLİOĞLU', stopName: 'HALI SAHA', orderNumber: 0 },
    { fullName: 'MİNE KARAOĞLU', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 9 },
    { fullName: 'FURKAN KADİR EDEN', stopName: 'REKTÖRLÜK', orderNumber: 0 },
    { fullName: 'YUSUF GÜRBÜZ', stopName: 'ES BENZİNLİK', orderNumber: 12 },
    { fullName: 'MEHMET ERTAŞ', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 13 },
    { fullName: 'HÜDAGÜL DEĞİRMENCİ', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 14 },
    { fullName: 'YASİN SAYGILI', stopName: 'ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ', orderNumber: 15 },
    { fullName: 'ÇAĞRI YILDIZ', stopName: 'BAĞDAT KÖPRÜ', orderNumber: 17 },
    { fullName: 'CEMAL ERAKSOY', stopName: 'YENİMAHALLE GO BENZİNLİK', orderNumber: 0 },
    { fullName: 'AZİZ BUĞRA KARA', stopName: 'BAĞDAT KÖPRÜ VE ÜZERİ', orderNumber: 18 },
  ],
};

// -------------------------
// 🛠 Yardımcı Fonksiyonlar
// -------------------------
const normalizeName = (name = '') => name.trim().toUpperCase();

async function assignPassengerToRoute(passenger, routeName) {
  const query = {
    $or: [
      { fullName: { $regex: `^${passenger.fullName}$`, $options: 'i' } },
      { adSoyad: { $regex: `^${passenger.fullName}$`, $options: 'i' } },
    ],
  };

  const employee = await Employee.findOne(query);

  if (!employee) {
    console.warn(`⚠️  Çalışan bulunamadı: ${passenger.fullName}`);
    return { found: false };
  }

  employee.serviceInfo = {
    usesService: true,
    routeName,
    stopName: passenger.stopName || 'FABRİKA',
    orderNumber: passenger.orderNumber || 0,
  };

  await employee.save();
  console.log(`✅ ${employee.adSoyad || employee.fullName} → ${routeName} (${passenger.stopName})`);
  return { found: true };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('🔌 MongoDB bağlantısı kuruldu');

  let totalAssigned = 0;
  let totalMissing = 0;

  for (const [routeName, passengers] of Object.entries(routePassengersMap)) {
    console.log(`\n🚍 Servis: ${routeName} | Yolcu sayısı: ${passengers.length}`);

    for (const p of passengers) {
      const result = await assignPassengerToRoute(p, routeName);
      if (result.found) totalAssigned += 1; else totalMissing += 1;
    }
  }

  console.log(`\n🎉 Tamamlandı. Atanan: ${totalAssigned}, Bulunamayan: ${totalMissing}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Hata:', err);
  mongoose.disconnect();
}); 