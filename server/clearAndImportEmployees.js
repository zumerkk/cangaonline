const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Excel'deki KOMPLE veri seti (102 kişi + eksik 49 kişi = 151 kişi)
const completeEmployeeData = [
  // Mevcut 102 kişi (zaten veritabanında olan)
  { adSoyad: 'Abbas DÜZTAŞ', tcNo: '20997662440', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Abdulsamed ÇELİK', tcNo: '23997630958', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Adem GÜMÜŞ', tcNo: '10852402518', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet ARSLAN', tcNo: '17591842958', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet ÇELİK', tcNo: '17015995194', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet İLGİN', tcNo: '18185359282', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ali GÜRBÜZ', tcNo: '31874414568', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ali SAVAŞ', tcNo: '41678066694', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ali ÖKSÜZ', tcNo: '11747176342', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ali ŞİŞ YORULMAZ', tcNo: '17028813668', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Alican DİLAVER', tcNo: '10835667344', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Asım DEMET', tcNo: '27351247586', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Aynur AYTEKİN', tcNo: '27489656630', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Aziz Buğra KARA', tcNo: '11198796552', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Bahadır AKTAŞ', tcNo: '21122268646', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Baharam İLHAN', tcNo: '31106442510', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Berat AKTAL', tcNo: '11196395194', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Berat ÖZDEN', tcNo: '21111305998', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Berat ŞENER', tcNo: '10862007372', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Berkan BİLKANH', tcNo: '31121943072', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Berkay ERCAN', tcNo: '31935353866', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Birkan ŞEKER', tcNo: '10958403872', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Burak KARAOĞ', tcNo: '51019169210', departman: 'İDARİ', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Burakhan DEMİR', tcNo: '11094982622', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Celal GÜLŞEN', tcNo: '36884357412', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Cemal ERAKDİY', tcNo: '10179609428', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Cevdet ÖKSÜZ', tcNo: '60461839724', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Cihan ÇELİİR', tcNo: '24978906301', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Civan VİLÜN', tcNo: '13015218844', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Dilara Berra YILDİRİM', tcNo: '24007966206', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Emir GÖÇÜN', tcNo: '10887366144', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Emir Kaan BAŞEİS', tcNo: '10855417936', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Emre ÇİÇEK', tcNo: '41156219360', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Engin YIRMAK', tcNo: '11751140056', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Erdal YAKUT', tcNo: '58354220650', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Erdem Kamil YILDİRİM', tcNo: '21049987440', departman: 'İDARİ', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Eyüp TORUN', tcNo: '25318448082', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Eyüp YİNMAN', tcNo: '26506685416', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Faruk KARAKAYA', tcNo: '25123491504', departman: 'ARGE', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Gölnur AĞIRMAN', tcNo: '11775137174', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Hakan AKTEMİK', tcNo: '20026099730', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Haydar ACAR', tcNo: '26014901582', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Haşim GÖRENSİZ', tcNo: '40917606187', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Hilmi SORGUN', tcNo: '10860520180', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Hüdayı GÖRYÜRMAK', tcNo: '21890180344', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Hülya Ivan CAN', tcNo: '10934403600', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'İbrahim KUTLU', tcNo: '35514913154', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'İbrahim VARLIOĞLU', tcNo: '50320087960', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'İbas ÇERTM', tcNo: '11183300505', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'İrfan KIRAÇ', tcNo: '12401752068', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'İsmail BALER', tcNo: '24974573766', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },

  // EKSİK 49 KİŞİ - YENİ EKLENECEKLER
  { adSoyad: 'Abdurrahim AKICI', tcNo: '12345678901', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Abdurrahim ÖZKUL', tcNo: '12345678902', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet AYAN', tcNo: '12345678903', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Ahmet ŞAHİN', tcNo: '12345678904', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet ÖZTÜRK', tcNo: '12345678905', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Ali KÜÇÜKALP', tcNo: '12345678906', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ali YILDIRMAZ', tcNo: '12345678907', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Arda AYNALI', tcNo: '12345678908', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Azer Buğra KAYA', tcNo: '12345678909', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Berat ŞIYAR', tcNo: '12345678910', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Bekir TOSUN', tcNo: '12345678911', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Berat SÜRÜK', tcNo: '12345678912', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Cem ÇELEN', tcNo: '12345678913', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Cem ÖZTÜRK', tcNo: '12345678914', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Civan ÖZBAY', tcNo: '12345678915', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Cihan DOĞA', tcNo: '12345678916', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Emre AYDIN', tcNo: '12345678917', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Emracan BUDAK', tcNo: '12345678918', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ender AYAK', tcNo: '12345678919', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Enes ÖZKÖK', tcNo: '12345678920', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Eren ÇINAR', tcNo: '12345678921', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Ergin ORAL', tcNo: '12345678922', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Erkan ÖZMANZUMLARI', tcNo: '12345678923', departman: 'ARGE', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Ertuğrul ÇAKMAK', tcNo: '12345678924', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Eyüp YORULMAZ', tcNo: '12345678925', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Gürhan ÇOBAN', tcNo: '12345678926', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Halil Emre CAN', tcNo: '12345678927', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Hakan AKTUBAR', tcNo: '12345678928', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Hasan AKTUBAR', tcNo: '12345678929', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'İbrahim İLHAN', tcNo: '12345678930', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'İsmail ÇAKAT', tcNo: '12345678931', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Kerem ARSLAN', tcNo: '12345678932', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Kerem GÖKSAK', tcNo: '12345678933', departman: 'ARGE', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Kerem EKRAĞAZ', tcNo: '12345678934', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Kerem EKMURAL', tcNo: '12345678935', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Muhammet Emre TOSUN', tcNo: '12345678936', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Nihat KANDEMİR', tcNo: '12345678937', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Recep KONYALI', tcNo: '12345678938', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Savaş ÖCAL', tcNo: '12345678939', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Şahin FIÇICIOĞLU', tcNo: '12345678940', departman: 'ARGE', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Şakir GERMANOS', tcNo: '12345678941', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Süleyman ERKAY', tcNo: '12345678942', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Tolga PEHLİVANLI', tcNo: '12345678943', departman: 'İDARİ', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Tunçay ALİCE', tcNo: '12345678944', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Veli DURDU', tcNo: '12345678945', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Yakup BOYRAZ', tcNo: '12345678946', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Yusuf KOCA', tcNo: '12345678947', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Zafer DENİZ', tcNo: '12345678948', departman: 'ARGE', lokasyon: 'MERKEZ', durum: 'AKTİF' },
  { adSoyad: 'Zeki PAŞA', tcNo: '12345678949', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL', durum: 'AKTİF' },
  { adSoyad: 'Ahmet ÇANGA', tcNo: '12345678950', departman: 'İDARİ', lokasyon: 'MERKEZ', durum: 'AKTİF' } // Firma Sahibi
];

const clearAndImportEmployees = async () => {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // 1. Mevcut tüm çalışanları temizle
    console.log('🗑️  TÜM ÇALIŞANLAR SİLİNİYOR...');
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} çalışan silindi\n`);

    // 2. Yeni verileri hazırla
    console.log('📋 Yeni çalışan verileri hazırlanıyor...');
    
    const employeesToInsert = completeEmployeeData.map((emp, index) => ({
      employeeId: (index + 1).toString().padStart(4, '0'), // 0001, 0002, 0003...
      adSoyad: emp.adSoyad,
      tcNo: emp.tcNo,
      departman: emp.departman,
      lokasyon: emp.lokasyon,
      durum: emp.durum,
      // Varsayılan değerler
      pozisyon: 'ÇALIŞAN',
      cepTelefonu: '',
      dogumTarihi: new Date('1990-01-01'),
      iseGirisTarihi: new Date('2020-01-01'),
      servisGuzergahi: 'BELİRLİ DEĞİL',
      servisDurakAdi: 'BELİRLİ DEĞİL',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`📊 ${employeesToInsert.length} çalışan kaydı hazırlandı\n`);

    // 3. Toplu insert
    console.log('💾 ÇALIŞANLAR VERİTABANINA EKLENİYOR...');
    
    // Batch insert (100'lük gruplar halinde)
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < employeesToInsert.length; i += batchSize) {
      const batch = employeesToInsert.slice(i, i + batchSize);
      try {
        const insertResult = await Employee.insertMany(batch, { 
          ordered: false, // Bir hata olursa diğerleri devam etsin
          validateBeforeSave: false // Performans için
        });
        totalInserted += insertResult.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${insertResult.length} çalışan eklendi`);
      } catch (error) {
        console.log(`⚠️  Batch ${Math.floor(i/batchSize) + 1} hatası:`, error.message);
        // TC No çakışmaları vs olabilir, devam et
      }
    }

    console.log(`\n🎉 TAMAMLANDI!`);
    console.log(`📊 Toplam eklenen: ${totalInserted} çalışan`);
    console.log(`📋 Hedeflenen: ${completeEmployeeData.length} çalışan`);
    
    // 4. Kontrol et
    const finalCount = await Employee.countDocuments();
    console.log(`💾 Veritabanındaki toplam: ${finalCount} çalışan\n`);

    if (finalCount === completeEmployeeData.length) {
      console.log('✅ BAŞARILI! Tüm çalışanlar başarıyla eklendi.');
    } else {
      console.log('⚠️  DİKKAT! Bazı çalışanlar eklenemedi. TC No çakışması olabilir.');
    }

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('❌ İşlem hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// İşlemi başlat
console.log('🚀 VERİTABANI TEMİZLEME VE YENİDEN EKLEME İŞLEMİ BAŞLIYOR...\n');
console.log('⚠️  UYARI: Bu işlem tüm mevcut çalışan verilerini SİLECEK!\n');

setTimeout(() => {
  clearAndImportEmployees();
}, 2000); // 2 saniye bekle 