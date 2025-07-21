const mongoose = require('mongoose');
const Employee = require('./models/Employee'); // 🎯 Çalışan modelini import ediyoruz
require('dotenv').config(); // .env dosyasındaki değişkenleri kullanmak için

// --- Departman Verileri ---
// 🖼️ Sağladığın resimlerden çıkardığım departman ve çalışan eşleştirmeleri.
// Her departmanın altındaki isimler, o departmana atanacak.
const departmentUpdates = {
  // Görsel 1 & 2: Merkez şubede farklı vardiyalarda çalışanlar
  'Merkez Şube': [
    'AHMET ÇANGA', 'AHMET DURAN TUNA', 'AZİZ BUĞRA KARA', 'BERAT AKTAŞ', 'BERAT SUSAR',
    'BİRKAN ŞEKER', 'CEMAL ERAKSOY', 'HAKAN AKPINAR', 'HULUSİ EREN CAN', 'İRFAN KIRAÇ',
    'MESUT TUNCER', 'MUSTAFA BIYIK', 'MUZAFFER KIZILÇİÇEK', 'SEFA PEHLİVANLI', 'SONER GÜRSOY',
    'UĞUR ALBAYRAK', 'VEYSEL EMRE TOZLU', 'CELAL GÜLŞEN', 'FURKAN KADİR ESEN', 'MEHMET ERTAŞ',
    'BERAT ÖZDEN', 'EMİR KAAN BAŞER', 'MEHMET ALİ ÖZÇELİK', 'ERDAL YAKUT', 'METİN ARSLAN',
    'YASİN SAYGILI',
  ],
  // Görsel 3: İdari personel
  'İdari Kısım': [
    'MİNE KARAOĞLU', 'AYNUR AYTEKİN', 'BURCU KARAKOÇ', 'GÜLNUR AĞIRMAN', 'MUSTAFA SAMURKOLLU',
  ],
  // Görsel 3: Güvenlik ekibi
  'Özel Güvenlik': [
    'MEHMET KEMAL İNANÇ', 'ALPEREN TOZLU', 'ÖMER TORUN', 'SİNAN BÖLGE',
  ],
  // Görsel 4: Teknik ekip
  'Teknik Ofis / Bakım Onarım': [
    'BAHADIR AKKÜL', 'DİLARA BERRA YILDIRIM', 'MUHAMMED ZÜMER KEKİLLİOĞLU', 'EMİR GÖÇÜK',
    'HÜDAGÜL DEĞİRMENCİ', 'İSMET BAŞER', 'MURAT SEPETCİ', 'ÖZKAN AYDIN',
  ],
  // Görsel 4: Kalite kontrol ekibi
  'Kalite Kontrol': [
    'CELAL BARAN', 'EMRE ÇİÇEK', 'KAMİL BATUHAN BEYGO', 'SADULLAH AKBAYIR',
  ],
  // Görsel 5: Işıl Şube'de çalışanlar
  'Işıl Şube': [
    'BATUHAN İLHAN', 'ASIM DEMET', 'EYÜP ÜNVANLI', 'MURAT GENCER', 'ALİ ŞIH YORULMAZ',
    'AHMET ÇELİK', 'ABBAS CAN ÖNGER', 'CİHAN ÇELEBİ', 'ÇAĞRI YILDIZ', 'EMRE DEMİRCİ',
    'EYÜP TORUN', 'İBRAHİM ÜÇER', 'KEMALETTİN GÜLEŞEN', 'LEVENT DURMAZ', 'MUSA DOĞU',
    'ORHAN YORULMAZ', 'ÖMER FİLİZ', 'POLAT ERCAN', 'SALİH GÖZÜAK', 'SELİM ALSAÇ',
    'SERKAN GÜLEŞEN', 'ÜMİT SAZAK', 'YUSUF GÜRBÜZ', 'MUSTAFA SÜMER', 'AHMET ILGIN',
    'AHMET ŞAHİN', 'ALİ ÇAVUŞ BAŞTUĞ', 'ALİ GÜRBÜZ', 'ALİ SAVAŞ', 'ALİ ÖKSÜZ',
    'BERKAN BULANIK', 'CEVDET ÖKSÜZ', 'HAYATİ SÖZDİNLER', 'HAYDAR ACAR', 'HİLMİ SORGUN',
    'İBRAHİM VARLIOĞLU', 'İLYAS CURTAY', 'KEMAL KARACA', 'MACİT USLU',
    'MUHAMMED NAZIM GÖÇ', 'MUSTAFA BAŞKAYA', 'NİYAZİ YURTSEVEN', 'OSMAN ÖZKILIÇ',
    'SEFA ÖZTÜRK', 'SÜLEYMAN GÖZÜAK', 'ÜMİT DEMİREL', 'ÜMİT TORUN', 'YAŞAR ÇETİN',
  ]
};

// --- Yardımcı Fonksiyon: İsim Normalleştirme ---
// Karşılaştırma yapmadan önce isimlerdeki Türkçe karakterleri ve boşlukları standart hale getirir.
// Örnek: "ALİ ŞIH YORULMAZ" -> "ALISIH YORULMAZ"
const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLocaleUpperCase('tr-TR') // Türkçe'ye özgü büyük harf dönüşümü (i -> İ)
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa indir
    .trim();
};


// --- Veritabanı Güncelleme Fonksiyonu ---
const updateEmployeeDepartments = async () => {
  try {
    // 1. Veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı!');

    // 2. Tüm çalışanları veritabanından çek ve isimlerini normalleştir
    const allEmployees = await Employee.find({});
    const normalizedDbEmployees = allEmployees.map(emp => ({
      ...emp.toObject(),
      normalizedName: normalizeName(emp.adSoyad)
    }));

    let updatedCount = 0;
    const notFoundNames = [];

    console.log('🔄 Departmanlar güncelleniyor (Akıllı Eşleştirme ile)...');

    // 3. Departman listesi üzerinde döngüye başla
    for (const [department, names] of Object.entries(departmentUpdates)) {
      // 4. Her departmandaki isimler için döngü
      for (const name of names) {
        const normalizedListName = normalizeName(name);
        
        // 5. Normalleştirilmiş isimler üzerinden eşleşme bul
        const foundEmployee = normalizedDbEmployees.find(
          emp => emp.normalizedName === normalizedListName
        );

        if (foundEmployee) {
          // 6. Çalışan bulunduysa departmanını güncelle ve kaydet
          // Orijinal Employee modelini kullanarak güncelleme yapıyoruz.
          const employeeToUpdate = await Employee.findById(foundEmployee._id);
          employeeToUpdate.departman = department;
          await employeeToUpdate.save();
          updatedCount++;
          console.log(`✅ ${employeeToUpdate.adSoyad} -> Departman: ${department} olarak güncellendi.`);
        } else {
          // 7. Çalışan bulunamadıysa listeye ekle
          notFoundNames.push(name);
        }
      }
    }

    // --- Sonuç Raporu ---
    console.log('\n--- GÜNCELLEME TAMAMLANDI ---');
    console.log(`🎉 Toplam ${updatedCount} çalışanın departman bilgisi güncellendi.`);
    
    if (notFoundNames.length > 0) {
      console.log(`\n⚠️ ${notFoundNames.length} isim hala bulunamadı. Lütfen kontrol edin:`);
      notFoundNames.forEach(name => console.log(`  - ${name}`));
    } else {
      console.log('👍 Tüm isimler başarıyla eşleştirildi ve güncellendi.');
    }

  } catch (error) {
    console.error('❌ Güncelleme sırasında bir hata oluştu:', error);
  } finally {
    // 8. Veritabanı bağlantısını kapat
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
};

// Script'i çalıştır
updateEmployeeDepartments(); 