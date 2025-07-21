const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://canga:canga1234@cluster0.cepqe.mongodb.net/canga?retryWrites=true&w=majority');
    console.log('✅ MongoDB Atlas bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

// Excel dosyalarından alınan yolcu listesi
const routePassengers = {
  'DISPANSER SERVIS GÜZERGAHI': [
    { name: 'ALI GÜRBÜZ', stop: 'ŞADIRVAN (PERŞEMBE PAZARI)' },
    { name: 'ALI SAVAŞ', stop: 'NOKTA A-101/DOKTAŞ' },
    { name: 'BERAT ÖZDEN', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'CEVCET ÖKSÜZ', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'ERDAL YAKUT', stop: 'GÜL PASTANESİ' },
    { name: 'EYÜP TORUN', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'İBRAHİM VARLIOĞLU', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'MUHAMMED SEFA PEHLİVANLI', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'MURAT ÇAVDAR', stop: 'ŞADIRVAN (PERŞEMBE PAZARI)' },
    { name: 'MUSTAFA BIYIK', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'ÖZKAN AYDIN', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'CELAL GÜLŞEN', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'MUHAMMED NAZİM GÖÇ', stop: 'DISPANSER ÜST GEÇİT' },
    { name: 'TUNCAY TEKİN', stop: 'DISPANSER ÜST GEÇİT' }
  ],
  
  'SANAYI MAHALLESİ SERVIS GÜZERGAHI': [
    { name: 'ALI ŞIH YORULMAZ', stop: 'ÇORBACI ALI DAYI' },
    { name: 'AHMET DURAN TUNA', stop: 'NOKTA A-101/DOKTAŞ' },
    { name: 'FATİH BALOĞLU', stop: 'ÇORBACI ALI DAYI' },
    { name: 'HAKKİ YÜCEL', stop: 'ÇORBACI ALI DAYI' },
    { name: 'HAYATİ SÖZDİNLER', stop: 'ÇORBACI ALI DAYI' },
    { name: 'HAYDAR ACAR', stop: 'RASATTEPE KÖPRÜ' },
    { name: 'GÜLNUR AĞIRMAN', stop: 'AYTEMİZ PETROL' },
    { name: 'İSMET BAŞER', stop: 'AYTEMİZ PETROL' },
    { name: 'KEMALETTİN GÜLEŞEN', stop: 'RASATTEPE KÖPRÜ' },
    { name: 'MACİT USLU', stop: 'ÇORBACI ALI DAYI' },
    { name: 'MUSTAFA SÜMER', stop: 'RASATTEPE KÖPRÜ' },
    { name: 'NİVAZI YURTSEVEN', stop: 'NOKTA A-101' },
    { name: 'BERAT AKTAŞ', stop: 'NOKTA A-101' },
    { name: 'NURİ ÖZKAN', stop: 'ÇORBACI ALI DAYI' },
    { name: 'MUSTAFA BAŞKAYA', stop: 'ÇORBACI ALI DAYI' },
    { name: 'MUZAFFER KIZILÇIÇEK', stop: 'MEZARLIK PEYZAJ ÖNÜ' }
  ],
  
  'OSMANGAZI-KARŞIYAKA MAHALLESİ SERVIS GÜZERGAHI': [
    { name: 'ASIM DEMET', stop: 'SALI PAZARI' },
    { name: 'İLYAS CURTAY', stop: 'KAHVELER (KARŞIYAKA)' },
    { name: 'POLAT ERCAN', stop: 'KAHVELER (KARŞIYAKA)' },
    { name: 'EMRE DEMİRCİ', stop: 'KEL MUSTAFA DURAGII' },
    { name: 'MUSTAFA SAMURKOLLU', stop: 'ERDURAN BAKKAL (KARŞIYAKA)' },
    { name: 'SEFA ÖZTÜRK', stop: 'BAHÇELİEVLER' },
    { name: 'SALİH GÖZÜAK', stop: 'KAHVELER (KARŞIYAKA)' },
    { name: 'SELİM ALSAÇ', stop: 'SALI PAZARI' },
    { name: 'ÜMİT SAZAK', stop: 'KAHVELER (KARŞIYAKA)' },
    { name: 'ÜMİT TORUN', stop: 'KAHVELER (KARŞIYAKA)' },
    { name: 'KEMAL KARACA', stop: 'BAHÇELİEVLER' },
    { name: 'YAŞAR ÇETİN', stop: 'BAHÇELİEVLER SAĞLIK OCAĞI' }
  ],
  
  'ÇALILIÖZ MAHALLESİ SERVIS GÜZERGAHI': [
    { name: 'AHMET CANGA', stop: 'NOKTA A-101/DOKTAŞ' },
    { name: 'AHMET ŞAHİN', stop: 'SAAT KULESİ' },
    { name: 'ALI ÇAVUŞ BAŞTUĞ', stop: 'FIRINLI CAMİ' },
    { name: 'ALİ ÖKSÜZ', stop: 'SAAT KULESİ' },
    { name: 'AYNUR AYTEKİN', stop: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)' },
    { name: 'CELAL BARAN', stop: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)' },
    { name: 'LEVENT DURMAZ', stop: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)' },
    { name: 'METİN ARSLAN', stop: 'NAR MARKET' },
    { name: 'MUSA DOĞU', stop: 'FIRINLI CAMİ' },
    { name: 'ÖMER FİLİZ', stop: 'SAAT KULESİ' },
    { name: 'SADULLAH AKBAYIR', stop: 'SAAT KULESİ' },
    { name: 'UĞUR ALBAYRAK', stop: 'SAAT KULESİ' },
    { name: 'BERAT SUSAR', stop: 'VALILIK' },
    { name: 'HULUSİ EREN CAN', stop: 'VALILIK ARKASI' },
    { name: 'İBRAHİM ÜÇER', stop: 'ES BENZİNLİK' },
    { name: 'SONER ÇETİN GÜRSOY', stop: 'VALILIK ARKASI' },
    { name: 'MEHMET ALİ ÖZÇELİK', stop: 'SAAT KULESİ' }
  ],
  
  'ÇARŞI MERKEZ SERVIS GÜZERGAHI': [
    { name: 'AHMET ÇELİK', stop: 'S-OIL BENZİNLİK' },
    { name: 'BİRKAN ŞEKER', stop: 'S-OIL BENZİNLİK' },
    { name: 'HİLMİ SORGUN', stop: 'S-OIL BENZİNLİK' },
    { name: 'EMİR KAAN BAŞER', stop: 'BAŞPINAR' },
    { name: 'MERT SÜNBÜL', stop: 'TOPRAK YEMEK' },
    { name: 'MESUT TUNÇER', stop: 'HALI SAHA' },
    { name: 'ALPEREN TOZLU', stop: 'HALI SAHA' },
    { name: 'VEYSEL EMRE TOZLU', stop: 'HALI SAHA' },
    { name: 'HAKAN AKPINAR', stop: 'HALI SAHA' },
    { name: 'MUHAMMED ZÜMER KEKİLLİOĞLU', stop: 'HALI SAHA' },
    { name: 'MİNE KARAOĞLU', stop: 'ESKİ REKTÖRLÜK' },
    { name: 'FURKAN KADİR EDEN', stop: 'REKTÖRLÜK' },
    { name: 'YUSUF GÜRBÜZ', stop: 'ES BENZİNLİK' },
    { name: 'MEHMET EKTAŞ', stop: 'ESKİ REKTÖRLÜK' },
    { name: 'HÜDAGÜL DEĞİRMENCİ', stop: 'ESKİ REKTÖRLÜK' },
    { name: 'YASİN SAYGILI', stop: 'ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ' },
    { name: 'ÇAĞRI YILDIZ', stop: 'BAĞDAT KÖPRÜ' },
    { name: 'CEMAL ERAKSOY', stop: 'YENİ MAHALLE GO BENZİNLİK' },
    { name: 'AZİZ BUĞRA KARA', stop: 'BAĞDAT KÖPRÜ VE ÜZERİ' }
  ]
};

// Employee modelini güncelle
const updateEmployeeRoutes = async () => {
  try {
    console.log('🔄 Çalışan güzergah bilgileri güncelleniyor...');
    
    let totalUpdated = 0;
    let notFound = 0;
    
    // Her güzergah için çalışanları işle
    for (const [routeName, passengers] of Object.entries(routePassengers)) {
      console.log(`\n📍 İşlenen güzergah: ${routeName} (${passengers.length} yolcu)`);
      
      for (const passenger of passengers) {
        try {
          // Çalışanı bul - farklı name formatlarını dene
          const searchQueries = [
            { adSoyad: passenger.name.trim() },
            { adSoyad: { $regex: passenger.name.trim(), $options: 'i' } },
            { $or: [
              { adSoyad: passenger.name.trim() },
              { adSoyad: { $regex: passenger.name.trim().replace(/\s+/g, '.*'), $options: 'i' } }
            ]}
          ];
          
          let employee = null;
          
          // Sırayla arama yap
          for (const query of searchQueries) {
            employee = await Employee.findOne(query);
            if (employee) break;
          }
          
          if (employee) {
            // Güzergah bilgilerini güncelle
            await Employee.findByIdAndUpdate(employee._id, {
              $set: {
                servisGuzergahi: routeName,
                durak: passenger.stop,
                updatedAt: new Date()
              }
            });
            
            console.log(`✅ Güncellendi: ${passenger.name} -> ${routeName} (${passenger.stop})`);
            totalUpdated++;
          } else {
            console.log(`❌ Bulunamadı: ${passenger.name}`);
            notFound++;
          }
        } catch (error) {
          console.error(`❌ ${passenger.name} güncellenirken hata:`, error.message);
          notFound++;
        }
      }
    }
    
    console.log(`\n📊 Güncelleme tamamlandı:`);
    console.log(`✅ Başarılı: ${totalUpdated} çalışan`);
    console.log(`❌ Bulunamayan: ${notFound} çalışan`);
    
  } catch (error) {
    console.error('❌ Güncelleme sırasında hata:', error.message);
  }
};

// Ana fonksiyon
const main = async () => {
  await connectDB();
  await updateEmployeeRoutes();
  
  console.log('\n🔍 Güncelleme sonrası kontrol...');
  
  // Sonuçları kontrol et
  const totalWithRoutes = await Employee.countDocuments({ 
    servisGuzergahi: { $exists: true, $ne: null, $ne: '' } 
  });
  
  const routeStats = await Employee.aggregate([
    { $match: { servisGuzergahi: { $exists: true, $ne: null, $ne: '' } } },
    { $group: { _id: '$servisGuzergahi', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log(`\n📊 Toplam servis kullanan çalışan: ${totalWithRoutes}`);
  console.log('\n📋 Güzergah bazında dağılım:');
  routeStats.forEach(stat => {
    console.log(`   ${stat._id}: ${stat.count} çalışan`);
  });
  
  await mongoose.connection.close();
  console.log('\n✅ İşlem tamamlandı!');
};

// Scripti çalıştır
main().catch(console.error); 