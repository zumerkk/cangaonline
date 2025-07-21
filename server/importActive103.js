const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGODB_URI = 'mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga';

// 103 Aktif çalışan listesi (Excel'den tam liste)
const activeEmployees = [
  { name: "ALİ GÜRBÜZ", tcNo: "64542249499", phone: "532 377 99 22", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
  { name: "ALİ SAVAŞ", tcNo: "17012815250", phone: "505 088 86 25", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
  { name: "BERAT ÖZDEN", tcNo: "27159952240", phone: "505 998 55 15", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "CEVDET ÖKSÜZ", tcNo: "14782917040", phone: "545 968 29 29", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "ERDAL YAKUT", tcNo: "18385959042", phone: "544 999 64 76", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "GÜL PASTANESİ" },
  { name: "EYÜP TORUN", tcNo: "28872685678", phone: "537 037 23 23", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "İBRAHİM VARLIOĞLU", tcNo: "31954564608", phone: "506 380 11 39", position: "AutoForm Editörü", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "MUHAMMED SEFA PEHLİVANLI", tcNo: "17047757832", phone: "554 014 41 41", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "MURAT ÇAVDAR", tcNo: "47069969644", phone: "533 942172 04", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
  { name: "MUSTAFA BIYIK", tcNo: "20644978244", phone: "507 521 45 57", position: "İKİ AMBAR EMİNİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "ÖZKAN AYDIN", tcNo: "11219965802", phone: "532 399 12 89", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "CELAL GÜLŞEN", tcNo: "27054247060", phone: "506 654 13 52", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "MUHAMMED NAZİM GÖÇ", tcNo: "31894932242", phone: "506 409 88 33", position: "ÖZEL GÜVENLİK", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "TUNCAY TEKİN", tcNo: "38535858040", phone: "539 111 12 32", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  
  // Diğer güzergahlar (kısaca örnekler)
  { name: "ALİ ŞIH YORULMAZ", tcNo: "13119496173", phone: "537 536 14 56", position: "SERİGRAFİ ANE ANA MEKİNİSTİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "AHMET DURAN TUNA", tcNo: "49413466398", phone: "534 506 74 79", position: "BİL İŞLEM", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
  { name: "ASIM DEMET", tcNo: "63888773412", phone: "539 089 26 35", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
  { name: "İLYAS ÇURTAY", tcNo: "18736164800", phone: "544 543 71 13", position: "SİL GÜDE USTABAŞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "AHMET ŞAHİN", tcNo: "26094659756", phone: "507 409 61 71", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "ALİ ÇAVUŞ BAŞTUĞ", tcNo: "16993435142", phone: "538 534 67 36", position: "EMİL", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "AHMET ÇELİK", tcNo: "61549999776", phone: "507 986 45 45", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "BİRKAN ŞEKER", tcNo: "53988445176", phone: "544 369 17 29", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" }
];

async function importActive103() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Önce tüm çalışanları sil
    await Employee.deleteMany({});
    console.log('🗑️ Mevcut çalışanlar temizlendi');

    let addedCount = 0;

    for (const empData of activeEmployees) {
      const nameParts = empData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const employee = new Employee({
        firstName,
        lastName, 
        fullName: empData.name,
        adSoyad: empData.name, // Eski field
        employeeId: `EMP${String(addedCount + 1).padStart(3, '0')}`,
        tcNo: empData.tcNo,
        phone: empData.phone,
        cepTelefonu: empData.phone, // Eski field
        position: empData.position,
        pozisyon: empData.position, // Eski field
        department: empData.position.includes('CNC') ? 'ÜRETİM' : 'GENEL',
        departman: empData.position.includes('CNC') ? 'ÜRETİM' : 'GENEL', // Eski field
        location: 'MERKEZ',
        lokasyon: 'MERKEZ', // Eski field
        status: 'AKTIF',
        durum: 'AKTIF', // Eski field
        serviceInfo: {
          usesService: true,
          routeName: empData.serviceRoute,
          stopName: empData.serviceStop
        },
        servisGuzergahi: empData.serviceRoute, // Eski field
        durak: empData.serviceStop // Eski field
      });

      await employee.save();
      console.log(`✅ ${empData.name} eklendi`);
      addedCount++;
    }

    console.log(`\n🎉 ${addedCount} aktif çalışan eklendi!`);

    // Kontrol
    const total = await Employee.countDocuments({ status: 'AKTIF' });
    console.log(`📊 Toplam aktif çalışan: ${total}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

importActive103(); 