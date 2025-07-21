const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// 🌍 MongoDB bağlantısı
const MONGODB_URI = 'mongodb+srv://zumerkekillioglu:Toor1234@cluster0.1flaw.mongodb.net/canga_db?retryWrites=true&w=majority';

// 📋 Excel'den eksik kalan çalışanlar (51 kişi daha)
const missingEmployeesData = [
  // Excel'den tam liste - Eksik olanlar
  { name: "Nuri ÖZKAN", tcNo: "16013855830", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Mustafa BAŞKAYA", tcNo: "51412659840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Muzaffer KIZILÇIÇEK", tcNo: "32471346923", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "MEZARLIK PEYZAJ ÖNÜ" },
  { name: "Asım DEMET", tcNo: "63888773412", phone: "539 089 26 35", birthDate: "18.06.2003", hireDate: "5.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
  { name: "İlyas ÇURTAY", tcNo: "18736164800", phone: "544 543 71 13", birthDate: "12.09.1997", hireDate: "2.08.2022", position: "SİL GÜDE USTABAŞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Polat ERCAN", tcNo: "32471548648", phone: "507 576 67 44", birthDate: "3.09.2004", hireDate: "20.04.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Emre DEMİRCİ", tcNo: "25943365854", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "KAL MUSTAFA DURAĞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ERDURAN BAKKAL (KARŞIYAKA)" },
  { name: "Mustafa SAMURKOLLU", tcNo: "13374467266", phone: "507 310 93 30", birthDate: "3.09.1995", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ERDURAN BAKKAL (KARŞIYAKA)" },
  { name: "Sefa ÖZTÜRK", tcNo: "15436512040", phone: "505 375 21 11", birthDate: "4.10.2002", hireDate: "23.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER" },
  { name: "Salih GÖZÜAK", tcNo: "23234731680", phone: "507 921 16 65", birthDate: "26.09.1997", hireDate: "13.11.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Selim ALSAÇ", tcNo: "16993855542", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
  { name: "Ümit SAZAK", tcNo: "12476524523", phone: "507 534 36 10", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Ümit TORUN", tcNo: "18765433632", phone: "543 531 21 13", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Kemal KARACA", tcNo: "24810906934", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "BAHÇELIEVLER", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER" },
  { name: "Yaşar ÇETİN", tcNo: "63888773412", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER SAĞLIK OCAĞI" },
  { name: "Mustafa DOĞAN", tcNo: "63888773412", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "YUVA TOKİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER SAĞLIK OCAĞI" },
  { name: "Cihan ÇELEBI", tcNo: "63888773412", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "GÜLLU YOLU BIM MARKET", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER SAĞLIK OCAĞI" },

  // ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI çalışanları
  { name: "Ali Çavuş BAŞTUĞ", tcNo: "16993435142", phone: "538 534 67 36", birthDate: "10.06.1997", hireDate: "3.01.2020", position: "EMİL", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "Ali ÖKSÜZ", tcNo: "26094659700", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Aynur AYTEKİN", tcNo: "11219965890", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Celal BARAN", tcNo: "26094659712", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Levent DURMAZ", tcNo: "47069969699", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Metin ARSLAN", tcNo: "26094659668", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NAR MARKET" },
  { name: "Musa DOĞU", tcNo: "21808634198", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "Ömer FİLİZ", tcNo: "16993855512", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Sadullah AKBAYIR", tcNo: "21808634171", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Eyüp ÜNVANLI", tcNo: "21808634171", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "Osman ÖZKİLİÇ", tcNo: "21808634171", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK" },
  { name: "Uğur ALBAYRAK", tcNo: "16993855577", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Berat SUSAR", tcNo: "25943365890", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "Hulusi Eren CAN", tcNo: "16993855522", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "İbrahim ÜÇER", tcNo: "27189853611", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ES BENZİNLİK" },
  { name: "Soner Çetin GÜRSOY", tcNo: "16993855599", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "Abbas Can ÖNGER", tcNo: "21808634144", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT BENZİNLİK" },
  { name: "Mehmet Ali ÖZÇELÍK", tcNo: "21808634144", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },

  // ÇARŞI MERKEZ SERVİS GÜZERGAHI
  { name: "Ahmet ÇELİK", tcNo: "61549999776", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Birkan ŞEKER", tcNo: "53988445176", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Hilmi SORGUN", tcNo: "61549999723", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Emir Kaan BAŞER", tcNo: "25943365847", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAŞPINAR" },
  { name: "Mert SÜNBÜL", tcNo: "61549999744", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "TOPRAK YEMEK" },
  { name: "Mesut TUNCER", tcNo: "53988445189", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Alperen TOZLU", tcNo: "25943365821", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Veysel Emre TOZLU", tcNo: "61549999756", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Hakan AKPINAR", tcNo: "53988445134", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "HALİ SAHA", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Muhammed ZÜMER KEKİLLİOĞLU", tcNo: "53988445134", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "HALİ SAHA", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" }, // HARIÇ TUT
  { name: "Mine KARAOĞLU", tcNo: "53988445134", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Furkan Kadir EDEN", tcNo: "61549999721", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "REKTÖRLÜK" },
  { name: "Yusuf GÜRBÜZ", tcNo: "25943365865", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ES BENZİNLİK" },
  { name: "Mehmet EKTAŞ", tcNo: "53988445167", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Hüdagül DEĞİRMENCİ", tcNo: "61549999732", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Yasin SAYGILI", tcNo: "25943365876", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ" },
  { name: "Çağrı YILDIZ", tcNo: "53988445145", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Cemal ERAKŞOY", tcNo: "61549999718", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "YENİMAHALLE GO BENZİNLİK" },
  { name: "Aziz BUĞRA KARA", tcNo: "25943365832", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜVE ÜZERİ" },

  // Daha fazla eksik personel...
  { name: "Berat ÖZDEN", tcNo: "27159952240", phone: "505 998 55 15", birthDate: "25.06.2004", hireDate: "24.06.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Cevdet ÖKSÜZ", tcNo: "14782917040", phone: "545 968 29 29", birthDate: "18.07.2006", hireDate: "8.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" }
];

// 📅 Helper fonksiyonları
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
};

const generateEmployeeId = (firstName, lastName, startIndex) => {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const number = (startIndex + 1).toString().padStart(4, '0');
  return `${firstInitial}${lastInitial}${number}`;
};

const normalizeDepartment = (position) => {
  const departmentMap = {
    'CNC TORNA OPERATÖRÜ': 'TORNA GRUBU',
    'CNC FREZE OPERATÖRÜ': 'FREZE GRUBU',
    'TORNACI': 'TORNA GRUBU',
    'AutoForm Editörü': 'TEKNİK OFİS',
    'BİL İŞLEM': 'TEKNİK OFİS',
    'LPG TORNA OPERATÖRÜ': 'TORNA GRUBU',
    'KALİTE KONTROL OPERAТÖRÜ': 'KALİTE KONTROL',
    'KAYNAKÇI': 'KAYNAK',
    'MAL İŞÇİSİ': 'GENEL ÇALIŞMA GRUBU',
    'EMİL': 'GENEL ÇALIŞMA GRUBU',
    'MUTAT. OPERATÖRÜ': 'MONTAJ',
    'SERİGRAFİ(ANE ANA MEKİNİST)': 'TEKNİK OFİS',
    'SERİGRAFI METİNİNİ': 'TEKNİK OFİS',
    'İKİ AMBAR EMİNİ': 'DEPO',
    'İKİ - GÜDE SORUMLUSU': 'KALİTE KONTROL',
    'SİL GÜDE USTABAŞI': 'KALİTE KONTROL',
    'ÖZEL GÜVENLİK': 'İDARİ BİRİM',
    'ÖZEL GÜVENLİK VE ÇORBACISI': 'İDARİ BİRİM',
    'MAKİNE MÜHENDİSİ': 'TEKNİK OFİS',
    'DİSPANSER': 'SAĞLIK HİZMETLERİ',
    'HAKIM UZGLAŞI': 'İDARİ BİRİM',
    'ÇORBA MÜZEESI': 'GENEL ÇALIŞMA GRUBU',
    'FARBENFİJI SÖZEN YARDIMCISI': 'TEKNİK OFİS',
    'BUET': 'GENEL ÇALIŞMA GRUBU',
    'LAZESİ ULUNASAYDANI': 'GENEL ÇALIŞMA GRUBU',
    'İDARE': 'İDARİ BİRİM'
  };
  return departmentMap[position] || 'DİĞER';
};

const determineLocation = (serviceRoute) => {
  if (!serviceRoute) return 'MERKEZ ŞUBE';
  const isilRoutes = ['SANAYİ MAHALLESİ SERVİS GÜZERGAHI', 'OSMANGAZİ-KARŞIYAKA MAHALLESİ', 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI'];
  const merkezRoutes = ['DİSPANSER SERVİS GÜZERGAHI', 'ÇARŞI MERKEZ SERVİS GÜZERGAHI'];
  
  if (isilRoutes.includes(serviceRoute)) {
    return 'IŞIL ŞUBE';
  } else if (merkezRoutes.includes(serviceRoute)) {
    return 'MERKEZ ŞUBE';
  }
  return 'MERKEZ ŞUBE';
};

// 🚀 Ana import fonksiyonu
async function importMissingEmployees() {
  try {
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');

    // 📊 Mevcut çalışan sayısını al
    const currentCount = await Employee.countDocuments();
    console.log(`📊 Mevcut çalışan sayısı: ${currentCount}`);

    // 📝 Eksik çalışanları ekle
    console.log('📝 Eksik çalışanlar ekleniyor...');
    let addedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < missingEmployeesData.length; i++) {
      const empData = missingEmployeesData[i];
      
      // 🚫 Hariç tutulacakları kontrol et
      if (empData.name === 'Ahmet ÇANGA' || empData.name === 'Muhammed ZÜMER KEKİLLİOĞLU') {
        skippedCount++;
        continue;
      }

      // 🔍 Aynı isimde zaten var mı kontrol et
      const existingEmployee = await Employee.findOne({ fullName: empData.name });
      if (existingEmployee) {
        console.log(`⏭️ ${empData.name} zaten mevcut, atlandı`);
        skippedCount++;
        continue;
      }

      // 👤 İsim ayrıştır
      const nameParts = empData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // 📋 Çalışan verisi hazırla
      const employee = new Employee({
        firstName: firstName,
        lastName: lastName,
        fullName: empData.name,
        employeeId: generateEmployeeId(firstName, lastName, currentCount + addedCount),
        tcNo: empData.tcNo,
        phone: empData.phone,
        birthDate: parseDate(empData.birthDate),
        hireDate: parseDate(empData.hireDate),
        position: empData.position,
        department: normalizeDepartment(empData.position),
        location: determineLocation(empData.serviceRoute),
        status: 'AKTIF',
        serviceInfo: {
          routeName: empData.serviceRoute,
          stopName: empData.serviceStop,
          usesService: empData.serviceRoute ? true : false
        }
      });

      try {
        await employee.save();
        console.log(`✅ ${empData.name} eklendi (${employee.employeeId})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${empData.name} eklenirken hata:`, error.message);
      }
    }

    const finalCount = await Employee.countDocuments();
    console.log('\n🎉 Eksik çalışanlar import edildi!');
    console.log(`✅ Eklenen: ${addedCount} çalışan`);
    console.log(`⏭️ Atlanan: ${skippedCount} çalışan`);
    console.log(`📊 Toplam çalışan sayısı: ${finalCount}`);

  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

// 🚀 Scripti çalıştır
if (require.main === module) {
  importMissingEmployees();
}

module.exports = importMissingEmployees; 