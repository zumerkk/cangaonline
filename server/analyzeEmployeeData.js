const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Excel'deki tüm çalışan verileri (Excel'den tam olarak çıkarılan isimler)
const excelEmployees = [
  'Abbas DÜZTAŞ',
  'Ahmet ÇELİK',
  'Abdulsamed ÇELİK',
  'Ahmet İLGİN',
  'Ahmet ARSLAN',
  'Adem GÜMÜŞ',
  'Ali GÜRBÜZ',
  'Ali ÖKSÜZ',
  'Ali SAVAŞ',
  'Ali ŞİŞ YORULMAZ',
  'Alican DİLAVER',
  'Asım DEMET',
  'Aynur AYTEKİN',
  'Aziz Buğra KARA',
  'Bahadır AKTAŞ',
  'Baharam İLHAN',
  'Berat AKTAL',
  'Berat ÖZDEN',
  'Berat ŞENER',
  'Berkan BİLKANH',
  'Berkay ERCAN',
  'Birkan ŞEKER',
  'Burak KARAOĞ',
  'Burakhan DEMİR',
  'Celal GÜLŞEN',
  'Cemal ERAKDİY',
  'Cevdet ÖKSÜZ',
  'Cihan ÇELİİR',
  'Civan VİLÜN',
  'Dilara Berra YILDİRİM',
  'Emir GÖÇÜN',
  'Emir Kaan BAŞEİS',
  'Emre ÇİÇEK',
  'Engin YIRMAK',
  'Erdal YAKUT',
  'Erdem Kamil YILDİRİM',
  'Eyüp TORUN',
  'Eyüp YİNMAN',
  'Faruk KARAKAYA',
  'Gölnur AĞIRMAN',
  'Hakan AKTEMİK',
  'Haşim GÖRENSİZ',
  'Haydar ACAR',
  'Hilmi SORGUN',
  'Hülya Ivan CAN',
  'Hüdayı GÖRYÜRMAK',
  'İbrahim KUTLU',
  'İbrahim VARLIOĞLU',
  'İbas ÇERTM',
  'İrfan KIRAÇ',
  'İsmail BALER',
  'Kamil Berkutlu MUTLU',
  'Kemal KARACA',
  'Kemalettin GÜLŞEN',
  'Levent DURMAZ',
  'Macit USLU',
  'Mehmet Ali GÜLÜK',
  'Mehmet ERTAŞ',
  'Mehmet Kemal İMANG',
  'Metin ZİNCİR',
  'Meks ARSLAN',
  'Mine APTİBEY',
  'Muhammed Sefa PEHLİVANLI',
  'MUHAMMED ZÜMER KEKİLLİOĞLU',
  'Muhammet NAZİM GÖÇ',
  'Murat ÇAVDAR',
  'Murat GÜRBÜZ',
  'Murat KERENLİ',
  'Murat SEPETÇİ',
  'Mustafa BAŞKAYA',
  'Mustafa BİYİK',
  'Mustafa DOĞAN',
  'Mustafa KAREKOĞUZLU',
  'Mustafa SÜMER',
  'Muzaffer İLHAN',
  'Muzaffer ŞIKÇİÇEK',
  'Niyazi YURTSEVEN',
  'Nuri ÖZKAN',
  'Osman KÖSEKUL',
  'Osman ÖDEYÜK',
  'Ömer FİLİZ',
  'Ömer TOKUR',
  'Okan AYDIN',
  'Okan REÇBER',
  'Rafiuliflah AKRAMİİ',
  'Salih GÖZÜAK',
  'Sefa ÖZTÜRK',
  'Selim ALSAÇ',
  'Serkan GÜLDEN',
  'Sinan BÖLGE',
  'Semir GÜRDÜY',
  'Süleyman COŞKUN',
  'Tuncay TEKİN',
  'Uğur BAMANIK',
  'Ümit DEMİREL',
  'Ümit SAZAK',
  'Ümit TORUN',
  'Veysel Emre TOULU',
  'Yasin SAHİLLİ',
  'Yaşar ÇETİN',
  'Yusuf GÜŞBİLK',
  // Aşağıdakiler Excel'de olan ama veritabanında eksik gibi görünen isimler (Excel'den manuel çıkarım)
  'Abdurrahim AKICI',
  'Abdurrahim ÖZKUL',
  'Ahmet AYAN',
  'Ahmet ŞAHİN',
  'Ahmet ÖZTÜRK',
  'Ali KÜÇÜKALP',
  'Ali YILDIRMAZ',
  'Arda AYNALI',
  'Azer Buğra KAYA',
  'Berat ŞIYAR',
  'Bekir TOSUN',
  'Berat SÜRÜK',
  'Cem ÇELEN',
  'Cem ÖZTÜRK',
  'Civan ÖZBAY',
  'Cihan DOĞA',
  'Emre AYDIN',
  'Emracan BUDAK',
  'Ender AYAK',
  'Enes ÖZKÖK',
  'Eren ÇINAR',
  'Ergin ORAL',
  'Erkan ÖZMANZUMLARI',
  'Ertuğrul ÇAKMAK',
  'Eyüp YORULMAZ',
  'Gürhan ÇOBAN',
  'Halil Emre CAN',
  'Hakan AKTUBAR',
  'Hasan AKTUBAR',
  'İbrahim İLHAN',
  'İsmail ÇAKAT',
  'Kerem ARSLAN',
  'Kerem GÖKSAK',
  'Kerem EKRAĞAZ',
  'Kerem EKMURAL',
  'Muhammet Emre TOSUN',
  'Nihat KANDEMİR',
  'Recep KONYALI',
  'Savaş ÖCAL',
  'Şahin FIÇICIOĞLU',
  'Şakir GERMANOS',
  'Süleyman ERKAY',
  'Tolga PEHLİVANLI',
  'Tunçay ALİCE',
  'Veli DURDU',
  'Yakup BOYRAZ',
  'Yusuf KOCA',
  'Zafer DENİZ',
  'Zeki PAŞA',
  'Ahmet ÇANGA' // Firma sahibi - özel durum
];

const analyzeEmployeeData = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Veritabanındaki çalışanları al
    const dbEmployees = await Employee.find({}, 'adSoyad').sort({ adSoyad: 1 });
    const dbNames = dbEmployees.map(emp => emp.adSoyad.trim());
    
    console.log('📊 === KARŞILAŞTIRMA ANALİZİ ===');
    console.log(`📋 Excel'de toplam: ${excelEmployees.length} çalışan`);
    console.log(`💾 Veritabanında: ${dbNames.length} çalışan`);
    console.log(`❌ Eksik: ${excelEmployees.length - dbNames.length} çalışan\n`);

    // Excel'de olup veritabanında olmayan isimler
    const missingInDB = excelEmployees.filter(name => !dbNames.includes(name.trim()));
    
    // Veritabanında olup Excel'de olmayan isimler
    const extraInDB = dbNames.filter(name => !excelEmployees.includes(name.trim()));

    console.log('🚫 === EXCEL\'DE OLUP VERİTABANINDA OLMAYAN İSİMLER ===');
    if (missingInDB.length > 0) {
      missingInDB.forEach((name, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name}`);
      });
    } else {
      console.log('✅ Tüm Excel isimleri veritabanında mevcut');
    }

    console.log('\n🔄 === VERİTABANINDA OLUP EXCEL\'DE OLMAYAN İSİMLER ===');
    if (extraInDB.length > 0) {
      extraInDB.forEach((name, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name}`);
      });
    } else {
      console.log('✅ Veritabanındaki tüm isimler Excel\'de mevcut');
    }

    // Benzer isimler analizi (yazım hatası kontrolü)
    console.log('\n🔍 === POTANSİYEL YAZIM HATASI ANALİZİ ===');
    const potentialMatches = [];
    
    missingInDB.forEach(missingName => {
      dbNames.forEach(dbName => {
        const similarity = calculateSimilarity(missingName, dbName);
        if (similarity > 0.7 && similarity < 1.0) {
          potentialMatches.push({
            excel: missingName,
            db: dbName,
            similarity: Math.round(similarity * 100)
          });
        }
      });
    });

    if (potentialMatches.length > 0) {
      console.log('⚠️  Potansiyel yazım hataları:');
      potentialMatches.forEach((match, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. Excel: "${match.excel}" ↔️ DB: "${match.db}" (${match.similarity}% benzer)`);
      });
    } else {
      console.log('✅ Potansiyel yazım hatası bulunamadı');
    }

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('\n✅ Analiz tamamlandı!');

  } catch (error) {
    console.error('❌ Analiz hatası:', error);
    process.exit(1);
  }
};

// String benzerlik hesaplama fonksiyonu
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Analizi çalıştır
console.log('🔍 Excel ve Veritabanı Karşılaştırma Analizi Başlıyor...\n');
analyzeEmployeeData(); 